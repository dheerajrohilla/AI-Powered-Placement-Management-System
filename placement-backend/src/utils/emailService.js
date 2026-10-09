import nodemailer from 'nodemailer';

// Store last sent email in memory for debugging / test assertions
let lastSentEmail = null;

/**
 * Returns a configured nodemailer transporter.
 * If SMTP credentials are set in environment variables, uses them.
 * Otherwise, uses a stream/simulated transport that logs cleanly to console.
 */
export const getTransporter = () => {
  const service = process.env.SMTP_SERVICE;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  // Easy direct Gmail service setup
  if (service?.toLowerCase() === 'gmail' || (!host && user?.endsWith('@gmail.com') && pass)) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
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
        rejectUnauthorized: false
      }
    });
  }

  // Fallback simulated transport for development & testing
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'windows',
    buffer: true
  });
};

/**
 * Check if real SMTP credentials have been provided
 */
export const isRealSmtpConfigured = () => {
  return Boolean(
    (process.env.SMTP_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.SMTP_USER && process.env.SMTP_PASS)
  );
};

/**
 * Get the most recently dispatched email (for tests / inspection)
 */
export const getLastSentEmail = () => lastSentEmail;

/**
 * Clear the stored last dispatched email
 */
export const clearLastSentEmail = () => {
  lastSentEmail = null;
};

/**
 * Send an email with automatic fallback and full error safety
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const isRealSmtp = isRealSmtpConfigured();
  
  // Use user's authenticated email in 'from' to prevent Gmail/provider spoofing rejections
  const defaultFrom = process.env.SMTP_USER
    ? `"Training & Placement Cell" <${process.env.SMTP_USER}>`
    : '"Training & Placement Cell" <placements@university.edu>';
  const from = process.env.EMAIL_FROM || defaultFrom;

  const transporter = getTransporter();

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });

    lastSentEmail = {
      to,
      from,
      subject,
      text,
      html,
      messageId: info.messageId || `msg-${Date.now()}`,
      sentAt: new Date(),
      simulated: !isRealSmtp
    };

    if (isRealSmtp) {
      console.log(`[EMAIL DISPATCHED] 🚀 Real email successfully delivered to ${to} | ID: ${info.messageId}`);
    } else {
      console.log(`[EMAIL SIMULATED] 📝 (Simulation Mode) Email dispatched to ${to}`);
      console.log(`[EMAIL SUBJECT] "${subject}"`);
      console.log(`[EMAIL TIP] To receive real emails in your actual inbox, configure SMTP_USER & SMTP_PASS in placement-backend/.env`);
    }

    return {
      success: true,
      messageId: lastSentEmail.messageId,
      recipient: to,
      simulated: !isRealSmtp
    };
  } catch (error) {
    console.error(`[EMAIL ERROR] ❌ Failed to send email to ${to}:`, error.message);
    if (error.code === 'EAUTH') {
      console.error('[EMAIL ERROR] 💡 Hint: Authentication failed. If using Gmail, you MUST use a 16-character Google App Password (not your regular account password). Go to Google Account > Security > 2-Step Verification > App Passwords.');
    }
    return {
      success: false,
      error: error.message,
      recipient: to,
      simulated: false
    };
  }
};

/**
 * Send an automated application confirmation email to the student's registered address
 * notifying them about their application and advising them to get ready for the test.
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
  driveId = ''
}) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const prepLink = `${clientUrl}/student/company-prep/${driveId || ''}`;
  const mockInterviewLink = `${clientUrl}/student/mock-interview?driveId=${driveId || ''}`;
  const applicationsLink = `${clientUrl}/student/applications`;

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

  const text = `
Hello ${studentName},

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
1. Round 1: Online Technical & Aptitude Assessment (Quantitative aptitude, logical reasoning, and programming fundamentals)
2. Round 2: Coding & Problem Solving (Data structures, algorithms, and clean problem solving)
3. Round 3: Technical & System Fundamentals (Core engineering subjects, project walkthroughs, and resume consistency)
4. Round 4: Behavioral & HR Evaluation (STAR response structure, communication, and team alignment)

--- QUICK PORTAL ACTIONS ---
• Company-Specific Prep Mode: ${prepLink}
• AI Mock Interview Tailored to ${companyName}: ${mockInterviewLink}
• View Application Status: ${applicationsLink}

Stay focused, practice diligently, and give your 100%. We believe in you!

Warm regards,
Training & Placement Cell
AI-Powered Placement Management Portal
`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Confirmed - ${companyName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;line-height:1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
          
          <!-- HEADER BANNER -->
          <tr>
            <td style="background:linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #6366f1 100%);padding:36px 32px;text-align:center;color:#ffffff;">
              <div style="font-size:28px;margin-bottom:8px;">🎓</div>
              <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">Training & Placement Cell</h1>
              <p style="margin:6px 0 0 0;font-size:14px;color:#e0e7ff;font-weight:500;">AI-Powered Campus Placement Management Portal</p>
            </td>
          </tr>

          <!-- HERO GREETING & ENCOURAGEMENT -->
          <tr>
            <td style="padding:32px 32px 20px 32px;">
              <div style="display:inline-block;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">
                ✓ Application Confirmed
              </div>
              <h2 style="margin:0 0 12px 0;font-size:22px;font-weight:800;color:#0f172a;">
                Get Ready for the Test! All the Best! 🚀
              </h2>
              <p style="margin:0 0 16px 0;font-size:15px;color:#334155;">
                Dear <strong>${studentName}</strong>,
              </p>
              <p style="margin:0 0 20px 0;font-size:15px;color:#334155;line-height:1.6;">
                You have successfully applied for the role of <strong style="color:#4338ca;">${role}</strong> at <strong style="color:#0f172a;">${companyName}</strong>. Your profile has been submitted to the placement pipeline.
              </p>
              <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <p style="margin:0;font-size:14px;color:#1e40af;font-weight:600;">
                  ⚡ The company test and interview process will begin soon. Make sure you brush up on your fundamentals and take advantage of our AI Preparation tools below!
                </p>
              </div>
            </td>
          </tr>

          <!-- DRIVE SUMMARY CARD -->
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:20px;">
                <tr>
                  <td colspan="2" style="padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
                    <span style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Drive Snapshot</span>
                    <h3 style="margin:4px 0 0 0;font-size:18px;color:#0f172a;font-weight:700;">${companyName}</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0 6px 0;font-size:13px;color:#64748b;width:40%;">Target Role:</td>
                  <td style="padding:12px 0 6px 0;font-size:14px;color:#0f172a;font-weight:600;">${role}</td>
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
                  <td style="padding:6px 0;font-size:13px;color:#64748b;">Location:</td>
                  <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;">${location}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#64748b;">Deadline:</td>
                  <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;">${deadlineDisplay}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0 0 0;font-size:13px;color:#64748b;vertical-align:top;">Required Skills:</td>
                  <td style="padding:10px 0 0 0;">
                    ${requirementsList}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TEST PREPARATION GUIDE -->
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <h3 style="margin:0 0 14px 0;font-size:16px;font-weight:700;color:#0f172a;display:flex;align-items:center;">
                📝 Recommended Test Preparation Checklist
              </h3>
              
              <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:10px;">
                <strong style="color:#4338ca;font-size:14px;">1. Online Aptitude & Technical MCQs</strong>
                <p style="margin:4px 0 0 0;font-size:13px;color:#475569;">
                  Practice quantitative aptitude, data interpretation, logical reasoning, and basic coding puzzles.
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:10px;">
                <strong style="color:#0284c7;font-size:14px;">2. Coding & DSA Problem Solving</strong>
                <p style="margin:4px 0 0 0;font-size:13px;color:#475569;">
                  Solve medium-difficulty problems on Arrays, Strings, HashMaps, Trees, and Dynamic Programming.
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;">
                <strong style="color:#059669;font-size:14px;">3. AI Mock Interview Practice</strong>
                <p style="margin:4px 0 0 0;font-size:13px;color:#475569;">
                  Take an automated mock interview generated specifically from ${companyName}'s job description to sharpen your real-time responses.
                </p>
              </div>
            </td>
          </tr>

          <!-- CALL TO ACTION BUTTONS -->
          <tr>
            <td style="padding:0 32px 32px 32px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${prepLink}" target="_blank" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;box-shadow:0 4px 6px -1px rgba(79,70,229,0.25);">
                      🎯 Open Company Prep Mode
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${mockInterviewLink}" target="_blank" style="display:inline-block;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;margin-right:8px;">
                      🎙️ Take AI Mock Interview
                    </a>
                    <a href="${applicationsLink}" target="_blank" style="display:inline-block;background:#f8fafc;color:#475569;border:1px solid #cbd5e1;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">
                      📊 Track Applications
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- GOOD LUCK MESSAGE -->
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#0f172a;">
                🌟 "Success occurs when opportunity meets preparation."
              </p>
              <p style="margin:0;font-size:13px;color:#64748b;">
                Give your best effort in the upcoming test. The placement cell is cheering for you!
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 32px;background:#0f172a;color:#94a3b8;font-size:12px;text-align:center;">
              <p style="margin:0 0 8px 0;color:#cbd5e1;font-weight:600;">
                Training & Placement Cell • AI Placement Portal
              </p>
              <p style="margin:0 0 8px 0;">
                This automated notification was delivered to your registered email address (${to}).
              </p>
              <p style="margin:0;color:#64748b;">
                © ${new Date().getFullYear()} AI-Powered Placement Management System. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return sendEmail({
    to,
    subject,
    text,
    html
  });
};
