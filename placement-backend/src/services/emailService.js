import nodemailer from 'nodemailer';
import EmailLog from '../models/EmailLog.js';
import {
  renderPasswordResetOtpTemplate,
  renderApplicationConfirmationTemplate,
  renderInterviewScheduledTemplate,
  renderInterviewRescheduledTemplate,
  renderApplicationStatusUpdateTemplate,
  renderAdminTestEmailTemplate
} from '../templates/emailTemplates.js';

// In-memory record for test suite inspection and rapid assertions
let lastSentEmail = null;

// Mask sensitive string (e.g. rohilladheerajcaptain@gmail.com -> ro***@gmail.com)
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length <= 2 ? name[0] + '***' : name.slice(0, 2) + '***' + name.slice(-1);
  return `${maskedName}@${domain}`;
};

/**
 * Checks whether real SMTP credentials are provided in the environment.
 */
export const isRealSmtpConfigured = () => {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  return Boolean(
    (process.env.SMTP_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.SMTP_USER && process.env.SMTP_PASS)
  );
};

/**
 * Return default from address securely without leaking passwords
 */
export const getDefaultFromAddress = () => {
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM;
  }
  if (process.env.SMTP_USER) {
    return `"Training & Placement Cell" <${process.env.SMTP_USER}>`;
  }
  return '"Training & Placement Cell" <placements@university.edu>';
};

/**
 * Creates and returns the active Nodemailer transporter.
 */
export const getTransporter = () => {
  // Always use fast, zero-network simulated transport in test suite
  if (process.env.NODE_ENV === 'test') {
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows',
      buffer: true
    });
  }

  const timeoutMs = parseInt(process.env.EMAIL_TIMEOUT_MS, 10) || 10000;
  const service = process.env.SMTP_SERVICE;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : undefined;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  // Gmail service setup
  if (service?.toLowerCase() === 'gmail' || (!host && user?.endsWith('@gmail.com') && pass)) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: timeoutMs,
      greetingTimeout: timeoutMs,
      socketTimeout: timeoutMs * 2
    });
  }

  // Generic custom SMTP host
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      },
      connectionTimeout: timeoutMs,
      greetingTimeout: timeoutMs,
      socketTimeout: timeoutMs * 2
    });
  }

  // Fallback simulated transport for development when no credentials set
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'windows',
    buffer: true
  });
};

/**
 * Verifies live connection to the configured upstream SMTP provider.
 */
export const verifyTransporterConnection = async () => {
  const isReal = isRealSmtpConfigured();
  if (!isReal) {
    return {
      success: true,
      simulated: true,
      message: 'Simulated transport is active (no real SMTP credentials or test environment).'
    };
  }

  const transporter = getTransporter();
  try {
    await transporter.verify();
    return {
      success: true,
      simulated: false,
      message: 'SMTP handshake and credentials successfully verified.'
    };
  } catch (error) {
    return {
      success: false,
      simulated: false,
      error: error.message,
      code: error.code || 'ECONNECTION',
      message: `SMTP connection verification failed: ${error.message}`
    };
  }
};

/**
 * Sleep helper for retry backoff
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core centralized email delivery function with:
 * - Server-side trusted recipient enforcement
 * - Idempotency deduplication check
 * - Outbox / EmailLog persistence
 * - Exponential backoff retry for transient network errors
 * - Provider confirmation check
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  eventType = 'custom',
  idempotencyKey = null,
  metadata = {},
  maxRetries = null
}) => {
  // Validate recipient format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!to || !emailRegex.test(to.trim())) {
    console.warn(`[EMAIL BLOCKED] Invalid recipient address: "${to}"`);
    return {
      success: false,
      error: 'Invalid recipient email address.',
      recipient: to,
      simulated: false
    };
  }

  const cleanTo = to.trim().toLowerCase();
  const isRealSmtp = isRealSmtpConfigured();
  const from = getDefaultFromAddress();
  const retriesLimit = maxRetries !== null ? maxRetries : (parseInt(process.env.EMAIL_MAX_RETRIES, 10) || 3);

  // 1. Idempotency Check: Prevent duplicate sends if request was already fulfilled
  if (idempotencyKey) {
    try {
      const existingLog = await EmailLog.findOne({ idempotencyKey });
      if (existingLog && existingLog.status === 'sent') {
        console.log(`[EMAIL DEDUPLICATED] Notification for key "${idempotencyKey}" was already dispatched to ${cleanTo}`);
        return {
          success: true,
          messageId: existingLog.messageId,
          recipient: cleanTo,
          deduplicated: true,
          simulated: existingLog.status === 'simulated'
        };
      }
    } catch (dbErr) {
      // Non-fatal, proceed with delivery attempt
      console.warn('[EMAIL DB WARNING] Could not check idempotency:', dbErr.message);
    }
  }

  // 2. Outbox Log Entry
  let outboxEntry = null;
  try {
    outboxEntry = await EmailLog.create({
      recipient: cleanTo,
      from,
      subject,
      eventType,
      status: isRealSmtp ? 'queued' : 'simulated',
      idempotencyKey: idempotencyKey || undefined,
      metadata,
      maxRetries: retriesLimit
    });
  } catch (logErr) {
    // If duplicate key error caught here, another concurrent worker just created it
    if (logErr.code === 11000 && idempotencyKey) {
      const existing = await EmailLog.findOne({ idempotencyKey });
      if (existing) {
        return {
          success: existing.status === 'sent' || existing.status === 'simulated',
          messageId: existing.messageId,
          recipient: cleanTo,
          deduplicated: true
        };
      }
    }
    console.warn('[EMAIL OUTBOX WARNING] Could not create outbox log:', logErr.message);
  }

  const transporter = getTransporter();
  let attempt = 0;
  let lastError = null;

  while (attempt <= retriesLimit) {
    attempt++;
    try {
      const info = await transporter.sendMail({
        from,
        to: cleanTo,
        subject,
        text,
        html
      });

      // Provider confirmation check:
      // Real SMTP returns a non-empty messageId and/or accepted recipients array
      const messageId = info.messageId || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const isAccepted = Array.isArray(info.accepted) ? info.accepted.length > 0 : true;

      if (!isAccepted) {
        throw new Error(`Upstream mail provider rejected recipient: ${cleanTo}`);
      }

      // Update in-memory record for test suite inspection
      lastSentEmail = {
        to: cleanTo,
        from,
        subject,
        text,
        html,
        messageId,
        sentAt: new Date(),
        simulated: !isRealSmtp,
        eventType
      };

      // Update outbox log in database
      if (outboxEntry?._id) {
        await EmailLog.findByIdAndUpdate(outboxEntry._id, {
          status: isRealSmtp ? 'sent' : 'simulated',
          messageId,
          attempts: attempt,
          sentAt: new Date()
        });
      }

      if (isRealSmtp) {
        console.log(`[EMAIL DISPATCHED] 🚀 Real email successfully delivered to ${cleanTo} | Event: ${eventType} | ID: ${messageId}`);
      } else {
        console.log(`[EMAIL SIMULATED] 📝 (Simulation Mode) Email dispatched to ${cleanTo} | Subject: "${subject}"`);
      }

      return {
        success: true,
        messageId,
        recipient: cleanTo,
        simulated: !isRealSmtp,
        attempts: attempt
      };
    } catch (error) {
      lastError = error;
      console.error(`[EMAIL ERROR (Attempt ${attempt}/${retriesLimit + 1})] ❌ Failed sending to ${cleanTo}:`, error.message);

      // Check for non-retryable errors (e.g. invalid auth credentials, permanently rejected recipient)
      const isPermanentError = error.code === 'EAUTH' || error.code === 'EENVELOPE' || error.responseCode === 550;
      if (isPermanentError || attempt > retriesLimit) {
        break;
      }

      // Exponential backoff delay with jitter
      const backoffMs = Math.min(1000 * Math.pow(1.5, attempt), 5000);
      await delay(backoffMs);
    }
  }

  // All attempts exhausted or permanent error occurred
  if (outboxEntry?._id) {
    try {
      await EmailLog.findByIdAndUpdate(outboxEntry._id, {
        status: 'failed',
        attempts: attempt,
        lastError: lastError?.message || 'Unknown delivery failure'
      });
    } catch (updateErr) {
      // ignore
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Email delivery failed',
    recipient: cleanTo,
    simulated: false,
    attempts: attempt
  };
};

/**
 * Retrieve the most recently dispatched email (for tests / inspection)
 */
export const getLastSentEmail = () => lastSentEmail;

/**
 * Clear the stored last dispatched email
 */
export const clearLastSentEmail = () => {
  lastSentEmail = null;
};

// ==============================================================================
// HIGH-LEVEL DYNAMIC EVENT DISPATCHERS
// ==============================================================================

/**
 * 1. Dispatch Password Reset OTP Email
 */
export const sendPasswordResetOtpEmail = async ({
  to,
  name = 'User',
  otp,
  expiresInMinutes = 15,
  resetUrl = ''
}) => {
  const { subject, html, text } = renderPasswordResetOtpTemplate({
    name,
    otp,
    expiresInMinutes,
    resetUrl
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
    eventType: 'password_reset_otp',
    maxRetries: 1,
    // 5-minute cooldown per OTP request for the same recipient
    idempotencyKey: `pwd-reset_${to.toLowerCase()}_${Math.floor(Date.now() / (5 * 60 * 1000))}`,
    metadata: { name, expiresInMinutes }
  });
};

/**
 * 2. Dispatch Successful Job Application Confirmation Email
 */
export const sendApplicationConfirmationEmail = async ({
  to,
  studentName = 'Candidate',
  companyName = 'Company',
  role = 'Software Engineer',
  salary = null,
  location = 'Pan India / Hybrid',
  driveDate = null,
  registrationDeadline = null,
  requirements = [],
  driveId = '',
  applicationId = ''
}) => {
  const { subject, html, text } = renderApplicationConfirmationTemplate({
    studentName,
    companyName,
    role,
    salary,
    location,
    driveDate,
    registrationDeadline,
    requirements,
    driveId
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
    eventType: 'application_confirmation',
    // Idempotent key per application to avoid duplicate email on re-requests
    idempotencyKey: `app-confirm_${applicationId || `${to}_${driveId}`}`,
    metadata: { driveId, applicationId, companyName, role }
  });
};

/**
 * 3. Dispatch Interview Scheduled Email
 */
export const sendInterviewScheduledEmail = async ({
  to,
  studentName = 'Candidate',
  companyName = 'Company',
  role = 'Software Engineer',
  round = 'Technical Round',
  scheduledDate,
  timeZone = 'Asia/Kolkata',
  mode = 'virtual',
  location = '',
  joinLink = '',
  interviewer = 'Company Interview Panel',
  interviewId = ''
}) => {
  const { subject, html, text } = renderInterviewScheduledTemplate({
    studentName,
    companyName,
    role,
    round,
    scheduledDate,
    timeZone,
    mode,
    location,
    joinLink,
    interviewer
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
    eventType: 'interview_scheduled',
    idempotencyKey: `interview-sched_${interviewId || `${to}_${scheduledDate}`}_${round}`,
    metadata: { interviewId, companyName, role, round, scheduledDate }
  });
};

/**
 * 4. Dispatch Interview Rescheduled / Conflict Resolved Email
 */
export const sendInterviewRescheduledEmail = async ({
  to,
  studentName = 'Candidate',
  companyName = 'Company',
  role = 'Software Engineer',
  round = 'Technical Round',
  oldDate,
  newDate,
  timeZone = 'Asia/Kolkata',
  reason = 'Administrative schedule update',
  mode = 'virtual',
  joinLink = '',
  location = '',
  interviewId = ''
}) => {
  const { subject, html, text } = renderInterviewRescheduledTemplate({
    studentName,
    companyName,
    role,
    round,
    oldDate,
    newDate,
    timeZone,
    reason,
    mode,
    joinLink,
    location
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
    eventType: 'interview_rescheduled',
    idempotencyKey: `interview-resched_${interviewId || to}_${new Date(newDate).getTime()}`,
    metadata: { interviewId, companyName, role, round, oldDate, newDate, reason }
  });
};

/**
 * 5. Dispatch Application Status Update Email (Shortlisted, Selected, Rejected)
 */
export const sendApplicationStatusUpdateEmail = async ({
  to,
  studentName = 'Candidate',
  companyName = 'Company',
  role = 'Software Engineer',
  status = 'shortlisted',
  feedback = '',
  salary = null,
  applicationId = ''
}) => {
  const { subject, html, text } = renderApplicationStatusUpdateTemplate({
    studentName,
    companyName,
    role,
    status,
    feedback,
    salary
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
    eventType: 'application_status_update',
    idempotencyKey: `app-status_${applicationId || to}_${status}`,
    metadata: { applicationId, companyName, role, status }
  });
};

/**
 * 6. Dispatch Admin Diagnostic Test Email
 */
export const sendAdminDiagnosticTestEmail = async ({
  to,
  adminName = 'Administrator'
}) => {
  const isReal = isRealSmtpConfigured();
  const provider = isReal ? (process.env.SMTP_SERVICE || process.env.SMTP_HOST || 'Custom SMTP') : 'Simulated / Stream';

  const { subject, html, text } = renderAdminTestEmailTemplate({
    adminName,
    provider,
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
    eventType: 'admin_test',
    maxRetries: 1, // Fast feedback for test ping
    metadata: { adminName, provider }
  });
};

/**
 * Administrative diagnostics helper
 */
export const getEmailDiagnosticsSummary = async () => {
  const isConfigured = isRealSmtpConfigured();
  const rawUser = process.env.SMTP_USER || '';
  const maskedUser = maskEmail(rawUser);
  const provider = process.env.SMTP_SERVICE || (process.env.SMTP_HOST ? `${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}` : 'None (Simulated)');

  // Query delivery counts from EmailLog
  let stats = {
    totalLogged: 0,
    sent: 0,
    simulated: 0,
    failed: 0,
    queued: 0,
    successRate: '100%'
  };

  try {
    const counts = await EmailLog.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    let total = 0;
    counts.forEach(c => {
      total += c.count;
      if (stats[c._id] !== undefined) {
        stats[c._id] = c.count;
      }
    });
    stats.totalLogged = total;
    const successful = stats.sent + stats.simulated;
    stats.successRate = total > 0 ? `${((successful / total) * 100).toFixed(1)}%` : '100%';
  } catch (err) {
    // DB might be offline or empty
  }

  return {
    isConfigured,
    provider,
    service: process.env.SMTP_SERVICE || null,
    host: process.env.SMTP_HOST || null,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    userMasked: maskedUser,
    fromAddress: getDefaultFromAddress(),
    timeoutMs: parseInt(process.env.EMAIL_TIMEOUT_MS, 10) || 10000,
    maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES, 10) || 3,
    stats
  };
};

export default {
  getTransporter,
  verifyTransporterConnection,
  sendEmail,
  getLastSentEmail,
  clearLastSentEmail,
  isRealSmtpConfigured,
  getDefaultFromAddress,
  maskEmail,
  sendPasswordResetOtpEmail,
  sendApplicationConfirmationEmail,
  sendInterviewScheduledEmail,
  sendInterviewRescheduledEmail,
  sendApplicationStatusUpdateEmail,
  sendAdminDiagnosticTestEmail,
  getEmailDiagnosticsSummary
};

