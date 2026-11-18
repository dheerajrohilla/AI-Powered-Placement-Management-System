/**
 * Reusable, professional HTML & plain-text email templates for the
 * AI-Powered Placement Management Portal.
 */

const clientBaseUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Common modern HTML shell for all transactional emails
 */
export const baseEmailLayout = ({
  title,
  preheader = '',
  badge = 'Placement Cell Notification',
  badgeColor = '#4f46e5',
  badgeBg = '#eef2ff',
  heading,
  studentName = 'Candidate',
  mainContentHtml,
  highlightBoxHtml = '',
  detailsTableHtml = '',
  actionButtonsHtml = '',
  footerNote = '',
  recipientEmail = ''
}) => {
  const currentYear = new Date().getFullYear();
  const portalUrl = clientBaseUrl();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .container-table { width: 100% !important; border-radius: 0 !important; }
      .content-cell { padding: 24px 18px !important; }
      .header-cell { padding: 28px 18px !important; }
      .btn-block { display: block !important; width: 100% !important; text-align: center !important; margin: 6px 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;line-height:1.6;">
  <!-- Preheader text hidden in inbox view -->
  <div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader || title}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table class="container-table" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td class="header-cell" style="background:linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%);padding:36px 32px;text-align:center;color:#ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;width:44px;height:44px;line-height:44px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:12px;font-size:22px;text-align:center;margin-bottom:10px;">
                      🎓
                    </div>
                    <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">Training & Placement Cell</h1>
                    <p style="margin:6px 0 0 0;font-size:13px;color:#c7d2fe;font-weight:500;letter-spacing:0.3px;">AI-Powered Campus Placement Management System</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CONTENT BODY -->
          <tr>
            <td class="content-cell" style="padding:32px 32px 24px 32px;">
              ${badge ? `
              <div style="display:inline-block;background:${badgeBg};color:${badgeColor};border:1px solid ${badgeColor}33;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">
                ${badge}
              </div>` : ''}

              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;">
                ${heading}
              </h2>

              <p style="margin:0 0 16px 0;font-size:15px;color:#334155;">
                Dear <strong>${studentName}</strong>,
              </p>

              <div style="font-size:15px;color:#334155;line-height:1.6;">
                ${mainContentHtml}
              </div>

              ${highlightBoxHtml ? `
              <div style="margin:20px 0;">
                ${highlightBoxHtml}
              </div>` : ''}

              ${detailsTableHtml ? `
              <div style="margin:24px 0;">
                ${detailsTableHtml}
              </div>` : ''}

              ${actionButtonsHtml ? `
              <div style="margin:30px 0 16px 0;text-align:center;">
                ${actionButtonsHtml}
              </div>` : ''}

              ${footerNote ? `
              <div style="margin:20px 0 0 0;padding-top:16px;border-top:1px dashed #e2e8f0;font-size:13px;color:#64748b;font-style:italic;">
                ${footerNote}
              </div>` : ''}
            </td>
          </tr>

          <!-- ENCOURAGING QUOTE BANNER -->
          <tr>
            <td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:13px;color:#475569;font-weight:500;">
                ⭐ Placement Cell Helpline: <a href="mailto:placements@university.edu" style="color:#4338ca;text-decoration:none;font-weight:600;">placements@university.edu</a> • Stay prepared and proactive!
              </p>
            </td>
          </tr>

          <!-- SECURITY & COMPLIANCE FOOTER -->
          <tr>
            <td style="padding:24px 32px;background:#0f172a;color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;">
              <p style="margin:0 0 6px 0;color:#cbd5e1;font-weight:600;font-size:13px;">
                Training & Placement Cell • AI Placement Portal
              </p>
              ${recipientEmail ? `
              <p style="margin:0 0 6px 0;color:#94a3b8;">
                This automated email was sent to <span style="color:#e2e8f0;">${recipientEmail}</span>.
              </p>` : ''}
              <p style="margin:0 0 8px 0;color:#64748b;">
                Please do not reply directly to this automated mailbox. For assistance, contact your department placement coordinator.
              </p>
              <p style="margin:0;color:#475569;font-size:11px;">
                © ${currentYear} AI-Powered Placement Management System. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * 1. Password Reset OTP Template
 */
export const renderPasswordResetOtpTemplate = ({
  name = 'User',
  otp,
  expiresInMinutes = 15,
  resetUrl = ''
}) => {
  const subject = `🔐 Password Reset OTP: ${otp} (Valid for ${expiresInMinutes} mins) - Placement Portal`;

  const mainContentHtml = `
    <p style="margin:0 0 14px 0;">
      We received a request to reset the password for your account on the <strong>AI-Powered Placement Management Portal</strong>.
    </p>
    <p style="margin:0 0 18px 0;">
      Use the One-Time Password (OTP) below to complete your password reset:
    </p>
  `;

  const highlightBoxHtml = `
    <div style="background:#eff6ff;border:2px dashed #3b82f6;border-radius:14px;padding:22px;text-align:center;">
      <div style="font-size:12px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
        Your 6-Digit Reset Code
      </div>
      <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1d4ed8;font-family:monospace;padding:6px 0;">
        ${otp}
      </div>
      <div style="font-size:13px;color:#475569;margin-top:8px;">
        ⏱️ This code will expire in <strong>${expiresInMinutes} minutes</strong>.
      </div>
    </div>
  `;

  const actionButtonsHtml = resetUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <a href="${resetUrl}" target="_blank" class="btn-block" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;box-shadow:0 4px 6px -1px rgba(37,99,235,0.25);">
            Direct Password Reset Link →
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  const footerNote = `
    🛡️ <strong>Security Notice:</strong> If you did not initiate this request, your account may be secure but please verify your credentials or notify the administration immediately. Never share your OTP with anyone.
  `;

  const html = baseEmailLayout({
    title: 'Password Reset OTP',
    preheader: `Your verification code is ${otp}. Valid for ${expiresInMinutes} minutes.`,
    badge: 'Security Verification',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    heading: 'Reset Your Password',
    studentName: name,
    mainContentHtml,
    highlightBoxHtml,
    actionButtonsHtml,
    footerNote
  });

  const text = `Hello ${name},

We received a request to reset your password on the AI-Powered Placement Portal.

YOUR 6-DIGIT VERIFICATION CODE: ${otp}

This code will expire in ${expiresInMinutes} minutes.

${resetUrl ? `You can also reset your password directly using this link:\n${resetUrl}\n\n` : ''}Security Notice: If you did not initiate this request, please disregard this email. Never share your OTP with anyone.

Training & Placement Cell
AI Placement Management Portal
`;

  return { subject, html, text };
};

/**
 * 2. Successful Job Application Confirmation Template
 */
export const renderApplicationConfirmationTemplate = ({
  studentName = 'Candidate',
  companyName = 'Company',
  role = 'Software Engineer',
  salary = null,
  location = 'Pan India / Hybrid',
  driveDate = null,
  registrationDeadline = null,
  requirements = [],
  driveId = ''
}) => {
  const portalUrl = clientBaseUrl();
  const prepLink = `${portalUrl}/student/company-prep/${driveId || ''}`;
  const mockInterviewLink = `${portalUrl}/student/mock-interview?driveId=${driveId || ''}`;
  const applicationsLink = `${portalUrl}/student/applications`;

  const salaryDisplay = salary
    ? `₹${(Number(salary) / 100000).toFixed(1)} LPA (₹${Number(salary).toLocaleString()})`
    : 'Competitive / Industry Standard';

  const driveDateDisplay = driveDate
    ? new Date(driveDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'To be announced shortly by TPO';

  const deadlineDisplay = registrationDeadline
    ? new Date(registrationDeadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Closed upon capacity';

  const requirementsList = Array.isArray(requirements) && requirements.length > 0
    ? requirements.map(r => `<span style="display:inline-block;background:#e0e7ff;color:#3730a3;padding:4px 10px;border-radius:12px;font-size:12px;margin:3px 4px 3px 0;font-weight:600;">${r}</span>`).join('')
    : '<span style="color:#64748b;font-size:13px;">Refer to job description</span>';

  const textRequirements = Array.isArray(requirements) && requirements.length > 0
    ? requirements.join(', ')
    : 'Refer to job description';

  const subject = `🎯 Application Confirmed: You applied for ${companyName}! Get ready for the test & All the Best!`;

  const mainContentHtml = `
    <p style="margin:0 0 14px 0;">
      Congratulations! Your application for the position of <strong style="color:#4338ca;">${role}</strong> at <strong style="color:#0f172a;">${companyName}</strong> has been successfully recorded in the campus placement pipeline.
    </p>
    <p style="margin:0 0 14px 0;">
      The selection process will commence soon. Please inspect the drive snapshot below and start preparing immediately.
    </p>
  `;

  const highlightBoxHtml = `
    <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:14px 16px;border-radius:0 8px 8px 0;">
      <p style="margin:0;font-size:14px;color:#065f46;font-weight:600;">
        ⚡ Get Ready for the Test! All the best for the selection rounds. Leverage our AI Mock Interview and Company Prep tools to boost your confidence.
      </p>
    </div>
  `;

  const detailsTableHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:20px;">
      <tr>
        <td colspan="2" style="padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Drive Snapshot</span>
          <h3 style="margin:4px 0 0 0;font-size:18px;color:#0f172a;font-weight:800;">${companyName}</h3>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0 6px 0;font-size:13px;color:#64748b;width:38%;">Role / Designation:</td>
        <td style="padding:10px 0 6px 0;font-size:14px;color:#0f172a;font-weight:600;">${role}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Package / CTC:</td>
        <td style="padding:6px 0;font-size:14px;color:#047857;font-weight:700;">${salaryDisplay}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Drive / Test Date:</td>
        <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:600;">${driveDateDisplay}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Work Location:</td>
        <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;">${location}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Registration Closes:</td>
        <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;">${deadlineDisplay}</td>
      </tr>
      <tr>
        <td style="padding:8px 0 0 0;font-size:13px;color:#64748b;vertical-align:top;">Required Skills:</td>
        <td style="padding:8px 0 0 0;">${requirementsList}</td>
      </tr>
    </table>
  `;

  const actionButtonsHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding-bottom:10px;">
          <a href="${prepLink}" target="_blank" class="btn-block" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;box-shadow:0 4px 6px -1px rgba(79,70,229,0.25);">
            🎯 Open Company Prep Mode
          </a>
        </td>
      </tr>
      <tr>
        <td align="center">
          <a href="${mockInterviewLink}" target="_blank" class="btn-block" style="display:inline-block;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;margin-right:6px;">
            🎙️ Take AI Mock Interview
          </a>
          <a href="${applicationsLink}" target="_blank" class="btn-block" style="display:inline-block;background:#f8fafc;color:#475569;border:1px solid #cbd5e1;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;">
            📊 View Applications
          </a>
        </td>
      </tr>
    </table>
  `;

  const footerNote = `
    💡 <strong>Preparation Tip:</strong> Practice online aptitude and programming questions daily. The company shortlists based on performance in Round 1.
  `;

  const html = baseEmailLayout({
    title: `Application Confirmed - ${companyName}`,
    preheader: `You applied for ${role} at ${companyName}. Get ready for the test!`,
    badge: 'Application Confirmed',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    heading: 'Application Successfully Submitted! 🚀',
    studentName,
    mainContentHtml,
    highlightBoxHtml,
    detailsTableHtml,
    actionButtonsHtml,
    footerNote
  });

  const text = `Hello ${studentName},

Congratulations! You have successfully applied for the position of "${role}" at "${companyName}".

Get ready for the test! All the best for the selection process!

--- DRIVE DETAILS ---
• Company: ${companyName}
• Role: ${role}
• Compensation: ${salaryDisplay}
• Location: ${location}
• Test / Drive Date: ${driveDateDisplay}
• Application Deadline: ${deadlineDisplay}
• Key Skills: ${textRequirements}

--- PREPARATION ROADMAP & NEXT STEPS ---
1. Round 1: Online Technical & Aptitude Assessment
2. Round 2: Coding & Problem Solving
3. Round 3: Technical & Core Engineering Fundamentals
4. Round 4: Behavioral & HR Evaluation

--- PORTAL LINKS ---
• Company Prep: ${prepLink}
• AI Mock Interview: ${mockInterviewLink}
• Track Application: ${applicationsLink}

Training & Placement Cell
AI Placement Management Portal
`;

  return { subject, html, text };
};

/**
 * 3. Interview Scheduled Template
 */
export const renderInterviewScheduledTemplate = ({
  studentName = 'Candidate',
  companyName = 'Company',
  role = 'Software Engineer',
  round = 'Technical Round',
  scheduledDate,
  timeZone = 'Asia/Kolkata',
  mode = 'virtual',
  location = '',
  joinLink = '',
  interviewer = 'Technical Interview Panel',
  interviewerEmail = ''
}) => {
  const portalUrl = clientBaseUrl();
  const interviewsUrl = `${portalUrl}/student/interviews`;

  const formattedDate = scheduledDate
    ? new Date(scheduledDate).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    : 'Date will be communicated';

  const roundName = round.charAt(0).toUpperCase() + round.slice(1);
  const modeDisplay = mode === 'virtual' ? '🌐 Virtual (Online Meeting)' : mode === 'in_person' ? '🏢 In-Person (Campus)' : '📞 Telephonic';

  const subject = `📅 Interview Scheduled: ${companyName} - ${roundName} for ${role}`;

  const mainContentHtml = `
    <p style="margin:0 0 14px 0;">
      Great news! <strong>${companyName}</strong> has scheduled an interview for your application for the role of <strong style="color:#4338ca;">${role}</strong>.
    </p>
    <p style="margin:0 0 14px 0;">
      Please find the interview schedule and coordination details below. Be sure to confirm your availability on the portal.
    </p>
  `;

  const highlightBoxHtml = `
    <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:14px 16px;border-radius:0 8px 8px 0;">
      <p style="margin:0;font-size:14px;color:#1e40af;font-weight:600;">
        🕒 Scheduled Time: <strong>${formattedDate}</strong> (${timeZone})
      </p>
    </div>
  `;

  const detailsTableHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:20px;">
      <tr>
        <td colspan="2" style="padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Interview Particulars</span>
          <h3 style="margin:4px 0 0 0;font-size:18px;color:#0f172a;font-weight:800;">${companyName} • ${roundName}</h3>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0 6px 0;font-size:13px;color:#64748b;width:38%;">Target Role:</td>
        <td style="padding:10px 0 6px 0;font-size:14px;color:#0f172a;font-weight:600;">${role}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Round Type:</td>
        <td style="padding:6px 0;font-size:14px;color:#2563eb;font-weight:700;">${roundName}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Interview Mode:</td>
        <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:600;">${modeDisplay}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Date & Time:</td>
        <td style="padding:6px 0;font-size:14px;color:#047857;font-weight:700;">${formattedDate}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Interviewer / Panel:</td>
        <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;">${interviewer || 'Company Technical Panel'}</td>
      </tr>
      ${joinLink ? `
      <tr>
        <td style="padding:8px 0 0 0;font-size:13px;color:#64748b;">Meeting Link:</td>
        <td style="padding:8px 0 0 0;">
          <a href="${joinLink}" target="_blank" style="color:#2563eb;font-weight:600;word-break:break-all;">${joinLink}</a>
        </td>
      </tr>` : ''}
      ${location && mode !== 'virtual' ? `
      <tr>
        <td style="padding:8px 0 0 0;font-size:13px;color:#64748b;">Venue / Room:</td>
        <td style="padding:8px 0 0 0;font-size:14px;color:#0f172a;font-weight:600;">${location}</td>
      </tr>` : ''}
    </table>
  `;

  const actionButtonsHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${joinLink ? `
      <tr>
        <td align="center" style="padding-bottom:10px;">
          <a href="${joinLink}" target="_blank" class="btn-block" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:8px;font-size:14px;font-weight:700;box-shadow:0 4px 6px -1px rgba(5,150,105,0.25);">
            🎥 Join Interview Meeting
          </a>
        </td>
      </tr>` : ''}
      <tr>
        <td align="center">
          <a href="${interviewsUrl}" target="_blank" class="btn-block" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">
            📅 View Interview on Portal
          </a>
        </td>
      </tr>
    </table>
  `;

  const footerNote = `
    📌 <strong>Checklist:</strong> Join at least 10 minutes prior to the scheduled time. Ensure a quiet environment, strong internet connection, and have your resume and portfolio handy.
  `;

  const html = baseEmailLayout({
    title: `Interview Scheduled - ${companyName}`,
    preheader: `Your ${roundName} interview with ${companyName} is scheduled for ${formattedDate}.`,
    badge: 'Interview Scheduled',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    heading: 'Your Interview has been Scheduled! 📅',
    studentName,
    mainContentHtml,
    highlightBoxHtml,
    detailsTableHtml,
    actionButtonsHtml,
    footerNote
  });

  const text = `Hello ${studentName},

${companyName} has scheduled an interview for you for the role of "${role}".

--- INTERVIEW DETAILS ---
• Company: ${companyName}
• Role: ${role}
• Round: ${roundName}
• Date & Time: ${formattedDate} (${timeZone})
• Mode: ${modeDisplay}
• Interviewer: ${interviewer || 'Company Technical Panel'}
${joinLink ? `• Meeting Link: ${joinLink}\n` : ''}${location ? `• Location: ${location}\n` : ''}
Portal Interview Dashboard: ${interviewsUrl}

Please join 10 minutes prior to the scheduled time. All the best!

Training & Placement Cell
AI Placement Management Portal
`;

  return { subject, html, text };
};

/**
 * 4. Interview Rescheduled Template
 */
export const renderInterviewRescheduledTemplate = ({
  studentName = 'Candidate',
  companyName = 'Company',
  role = 'Software Engineer',
  round = 'Technical Round',
  oldDate,
  newDate,
  timeZone = 'Asia/Kolkata',
  reason = 'Administrative schedule optimization',
  mode = 'virtual',
  joinLink = '',
  location = ''
}) => {
  const portalUrl = clientBaseUrl();
  const interviewsUrl = `${portalUrl}/student/interviews`;

  const formatDt = (dt) => dt ? new Date(dt).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }) : 'TBD';

  const oldDateDisplay = formatDt(oldDate);
  const newDateDisplay = formatDt(newDate);
  const roundName = round.charAt(0).toUpperCase() + round.slice(1);

  const subject = `⚠️ Rescheduled: ${companyName} - ${roundName} Interview New Time: ${newDateDisplay}`;

  const mainContentHtml = `
    <p style="margin:0 0 14px 0;">
      Please note that your scheduled <strong>${roundName}</strong> interview with <strong>${companyName}</strong> has been <strong>rescheduled</strong>.
    </p>
    <p style="margin:0 0 14px 0;">
      <strong>Reason:</strong> ${reason}
    </p>
  `;

  const highlightBoxHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fef3c7;border-radius:10px;padding:16px;">
      <tr>
        <td style="padding-bottom:8px;font-size:12px;color:#92400e;font-weight:700;text-transform:uppercase;">
          Schedule Update Comparison
        </td>
      </tr>
      <tr>
        <td style="font-size:14px;color:#dc2626;text-decoration:line-through;padding-bottom:4px;">
          Previous Time: ${oldDateDisplay}
        </td>
      </tr>
      <tr>
        <td style="font-size:16px;color:#047857;font-weight:800;">
          👉 New Time: ${newDateDisplay} (${timeZone})
        </td>
      </tr>
    </table>
  `;

  const detailsTableHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:20px;">
      <tr>
        <td colspan="2" style="padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Updated Details</span>
          <h3 style="margin:4px 0 0 0;font-size:17px;color:#0f172a;font-weight:700;">${companyName} • ${role}</h3>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0 4px 0;font-size:13px;color:#64748b;width:38%;">Interview Round:</td>
        <td style="padding:8px 0 4px 0;font-size:14px;color:#0f172a;font-weight:600;">${roundName}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Updated Mode:</td>
        <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;">${mode}</td>
      </tr>
      ${joinLink ? `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Meeting Link:</td>
        <td style="padding:6px 0;">
          <a href="${joinLink}" target="_blank" style="color:#2563eb;font-weight:600;">${joinLink}</a>
        </td>
      </tr>` : ''}
      ${location ? `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Venue:</td>
        <td style="padding:6px 0;font-size:14px;color:#0f172a;">${location}</td>
      </tr>` : ''}
    </table>
  `;

  const actionButtonsHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <a href="${interviewsUrl}" target="_blank" class="btn-block" style="display:inline-block;background:#d97706;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;box-shadow:0 4px 6px -1px rgba(217,119,6,0.25);">
            Confirm New Schedule on Portal
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = baseEmailLayout({
    title: `Interview Rescheduled - ${companyName}`,
    preheader: `Your ${roundName} interview with ${companyName} has been moved to ${newDateDisplay}.`,
    badge: 'Schedule Update',
    badgeColor: '#d97706',
    badgeBg: '#fffbeb',
    heading: 'Interview Rescheduled',
    studentName,
    mainContentHtml,
    highlightBoxHtml,
    detailsTableHtml,
    actionButtonsHtml
  });

  const text = `Hello ${studentName},

Your ${roundName} interview with ${companyName} has been rescheduled.

• Previous Time: ${oldDateDisplay}
• New Time: ${newDateDisplay} (${timeZone})
• Reason: ${reason}
${joinLink ? `• Meeting Link: ${joinLink}\n` : ''}
Check your interview schedule on the portal: ${interviewsUrl}

Training & Placement Cell
AI Placement Management Portal
`;

  return { subject, html, text };
};

/**
 * 5. Application Status Update Template (Shortlisted, Selected / Offer, Rejected)
 */
export const renderApplicationStatusUpdateTemplate = ({
  studentName = 'Candidate',
  companyName = 'Company',
  role = 'Software Engineer',
  status = 'shortlisted',
  feedback = '',
  salary = null
}) => {
  const portalUrl = clientBaseUrl();
  const applicationsLink = `${portalUrl}/student/applications`;

  const salaryDisplay = salary
    ? `₹${(Number(salary) / 100000).toFixed(1)} LPA (₹${Number(salary).toLocaleString()})`
    : null;

  let badgeText = 'Status Update';
  let badgeColor = '#4f46e5';
  let badgeBg = '#eef2ff';
  let heading = `Application Update for ${companyName}`;
  let subject = `📢 Application Update: ${companyName} (${role})`;
  let bannerHighlight = '';
  let content = '';

  if (status === 'shortlisted') {
    badgeText = '✓ Shortlisted';
    badgeColor = '#059669';
    badgeBg = '#ecfdf5';
    heading = `Congratulations! You have been Shortlisted by ${companyName}! 🌟`;
    subject = `🎉 Shortlisted: Congratulations! You moved to the next round at ${companyName}`;
    bannerHighlight = `
      <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:14px 16px;border-radius:0 8px 8px 0;margin:18px 0;">
        <p style="margin:0;font-size:14px;color:#065f46;font-weight:600;">
          👏 Outstanding performance! Your application has cleared the screening/test round. Keep your notifications active for interview slots.
        </p>
      </div>
    `;
    content = `
      <p style="margin:0 0 14px 0;">
        We are thrilled to inform you that your profile has been <strong>shortlisted</strong> for the role of <strong>${role}</strong> at <strong>${companyName}</strong>.
      </p>
      ${feedback ? `<p style="margin:0 0 14px 0;color:#334155;"><strong>Recruiter Notes:</strong> "${feedback}"</p>` : ''}
      <p style="margin:0 0 14px 0;">
        Next steps: Interview scheduling will be published soon. Review your project notes and fundamentals in the company preparation section.
      </p>
    `;
  } else if (status === 'selected') {
    badgeText = '🎉 Offer Received';
    badgeColor = '#b45309';
    badgeBg = '#fef3c7';
    heading = `Heartiest Congratulations! You have received an Offer from ${companyName}! 🏆`;
    subject = `🎉 Placement Offer: Congratulations on your selection at ${companyName}!`;
    bannerHighlight = `
      <div style="background:linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);border:2px solid #f59e0b;padding:18px;border-radius:12px;margin:18px 0;text-align:center;">
        <div style="font-size:24px;margin-bottom:6px;">🌟 🎓 🚀</div>
        <h3 style="margin:0 0 6px 0;color:#92400e;font-size:18px;font-weight:800;">Offer Granted</h3>
        <p style="margin:0;font-size:15px;color:#78350f;font-weight:700;">
          Role: ${role} ${salaryDisplay ? `• CTC: ${salaryDisplay}` : ''}
        </p>
      </div>
    `;
    content = `
      <p style="margin:0 0 14px 0;">
        On behalf of the entire university and the Training & Placement Cell, we extend our heartiest congratulations to you for being <strong>selected</strong> for employment at <strong>${companyName}</strong>!
      </p>
      ${feedback ? `<p style="margin:0 0 14px 0;color:#334155;"><strong>Company Remarks:</strong> "${feedback}"</p>` : ''}
      <p style="margin:0 0 14px 0;">
        Please log into the portal to review your offer details, accept the confirmation, and download onboarding guidelines.
      </p>
    `;
  } else if (status === 'rejected') {
    badgeText = 'Application Update';
    badgeColor = '#64748b';
    badgeBg = '#f1f5f9';
    heading = `Update regarding your application for ${companyName}`;
    subject = `Placement Update: ${companyName} (${role})`;
    content = `
      <p style="margin:0 0 14px 0;">
        Thank you for participating in the placement drive for <strong>${companyName}</strong> for the role of <strong>${role}</strong>.
      </p>
      <p style="margin:0 0 14px 0;">
        While this specific round did not result in a selection, the placement team commends your efforts.
      </p>
      ${feedback ? `<p style="margin:0 0 14px 0;color:#334155;"><strong>Feedback for Improvement:</strong> "${feedback}"</p>` : ''}
      <p style="margin:0 0 14px 0;">
        Remember that each interview is a step towards your dream role. Take advantage of our AI Rejection Analyzer and Skill Roadmap on the portal to fine-tune your preparation for upcoming drives.
      </p>
    `;
  } else {
    content = `
      <p style="margin:0 0 14px 0;">
        The status of your application for <strong>${role}</strong> at <strong>${companyName}</strong> has been updated to <strong>${status.replace('_', ' ').toUpperCase()}</strong>.
      </p>
      ${feedback ? `<p style="margin:0 0 14px 0;color:#334155;"><strong>Note:</strong> "${feedback}"</p>` : ''}
    `;
  }

  const actionButtonsHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <a href="${applicationsLink}" target="_blank" class="btn-block" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;box-shadow:0 4px 6px -1px rgba(79,70,229,0.25);">
            View Application Details on Portal
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = baseEmailLayout({
    title: `Application Update - ${companyName}`,
    preheader: `${companyName} application status: ${status}`,
    badge: badgeText,
    badgeColor,
    badgeBg,
    heading,
    studentName,
    mainContentHtml: content,
    highlightBoxHtml: bannerHighlight,
    actionButtonsHtml
  });

  const text = `Hello ${studentName},

${companyName} application update for "${role}":
Status: ${status.toUpperCase()}
${salaryDisplay ? `Compensation: ${salaryDisplay}\n` : ''}${feedback ? `Feedback: ${feedback}\n` : ''}
View your full application record: ${applicationsLink}

Training & Placement Cell
AI Placement Management Portal
`;

  return { subject, html, text };
};

/**
 * 6. Admin Diagnostic Test Email Template
 */
export const renderAdminTestEmailTemplate = ({
  adminName = 'System Administrator',
  provider = 'SMTP/Gmail',
  timestamp = new Date(),
  environment = 'development'
}) => {
  const subject = `✅ Centralized Email System Verification - Placement Portal [${new Date().toLocaleTimeString()}]`;

  const mainContentHtml = `
    <p style="margin:0 0 14px 0;">
      This is an authorized verification email dispatched from the <strong>AI-Powered Placement Management System</strong>.
    </p>
    <p style="margin:0 0 14px 0;">
      If you are reading this email in your inbox, your centralized email notification service is properly configured, authenticated with the upstream mail provider, and ready for campus-wide delivery.
    </p>
  `;

  const highlightBoxHtml = `
    <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:16px;border-radius:0 8px 8px 0;">
      <h4 style="margin:0 0 6px 0;color:#065f46;font-size:15px;font-weight:700;">
        ✓ SMTP Pipeline Operational
      </h4>
      <p style="margin:0;font-size:13px;color:#047857;">
        The email provider confirmed receipt and scheduled transmission without error.
      </p>
    </div>
  `;

  const detailsTableHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:20px;">
      <tr>
        <td colspan="2" style="padding-bottom:10px;border-bottom:1px solid #e2e8f0;">
          <h4 style="margin:0;font-size:14px;color:#0f172a;font-weight:700;">System Diagnostic Snapshot</h4>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0 4px 0;font-size:13px;color:#64748b;width:40%;">Provider / Transport:</td>
        <td style="padding:8px 0 4px 0;font-size:13px;color:#0f172a;font-weight:600;">${provider}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#64748b;">Node Environment:</td>
        <td style="padding:4px 0;font-size:13px;color:#0f172a;font-weight:600;">${environment}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#64748b;">Dispatched Timestamp:</td>
        <td style="padding:4px 0;font-size:13px;color:#0f172a;font-weight:500;">${new Date(timestamp).toUTCString()}</td>
      </tr>
    </table>
  `;

  const html = baseEmailLayout({
    title: 'Centralized Email Verification',
    preheader: 'Centralized email delivery verification passed successfully.',
    badge: 'System Verification',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    heading: 'Email Notification System Operational ✅',
    studentName: adminName,
    mainContentHtml,
    highlightBoxHtml,
    detailsTableHtml
  });

  const text = `Centralized Email System Verification
Admin: ${adminName}
Provider: ${provider}
Environment: ${environment}
Timestamp: ${new Date(timestamp).toISOString()}

Email service is functioning normally.
`;

  return { subject, html, text };
};
