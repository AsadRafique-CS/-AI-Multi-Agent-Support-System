// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export async function sendTicketEmail(email, ticketId) {
//   const ticketLink = `http://localhost:3000/tickets/${ticketId}`;

//   await transporter.sendMail({
//     from: `"AI Support" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Your Support Ticket",
//     html: `
//       <p>Your ticket has been created.</p>
//       <p><b>Ticket ID:</b> ${ticketId}</p>
//       <p>
//         View your ticket here:
//         <a href="${ticketLink}">${ticketLink}</a>
//       </p>
//     `,
//   });
// }
import nodemailer from "nodemailer";

// export async function sendTicketEmail(email, ticketId) {
//   const testAccount = await nodemailer.createTestAccount();

//   const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     auth: {
//       user: testAccount.user,
//       pass: testAccount.pass,
//     },
//   });

//   const ticketLink = `http://localhost:3000/ticket/${ticketId}`; // frontend link

//   const info = await transporter.sendMail({
//     from: '"AI Support" <support@test.com>',
//     to: email,
//     subject: "Your Support Ticket",
//     html: `
//       <p>Your ticket has been created.</p>
//       <p><b>Ticket ID:</b> ${ticketId}</p>
//       <p>View and reply to your ticket: <a href="${ticketLink}">${ticketLink}</a></p>
//     `,
//   });

//   console.log("📨 Preview URL:", nodemailer.getTestMessageUrl(info));
// }

// export async function sendAgentReplyEmail(email, ticketId, agentResponse) {
//   // create a test account
//   const testAccount = await nodemailer.createTestAccount();

//   // create a transporter
//   const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     auth: {
//       user: testAccount.user,
//       pass: testAccount.pass,
//     },
//   });

//   const ticketLink = `http://localhost:3000/ticket/${ticketId}`;

//   const info = await transporter.sendMail({
//     from: '"AI Support" <support@test.com>',
//     to: email,
//     subject: "Update on Your Support Ticket",
//     html: `
//       <p>Your ticket has received a response.</p>
//       <p><b>AI Response:</b></p>
//       <blockquote>${agentResponse.response}</blockquote>
//       <p><i>Reasoning:</i> ${agentResponse.reasoning}</p>
//       <p>View full conversation: <a href="${ticketLink}">${ticketLink}</a></p>
//     `,
//   });

//   console.log("📨 Agent Reply Preview URL:", nodemailer.getTestMessageUrl(info));
// }

let transporter; // Reuse transporter

// Initialize transporter once with SMTP
function initTransporter() {
  if (transporter) return;

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL_USER or EMAIL_PASS not configured in .env file");
    return;
  }

  const emailUser = process.env.EMAIL_USER;

  // Detect email provider and configure accordingly
  let smtpConfig;

  if (emailUser.includes('@gmail.com')) {
    // Gmail configuration
    smtpConfig = {
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: process.env.EMAIL_PASS,
      },
    };
    console.log("📧 Using Gmail SMTP");
  } else if (emailUser.includes('@brndsh.io')) {
    // Custom domain - try common SMTP settings
    smtpConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com", // Many custom domains use Gmail
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: emailUser,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // For testing
      }
    };
    console.log(`📧 Using custom SMTP for ${emailUser}`);
    console.log(`📧 SMTP Host: ${smtpConfig.host}:${smtpConfig.port}`);
  } else {
    // Generic SMTP configuration
    smtpConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: emailUser,
        pass: process.env.EMAIL_PASS,
      },
    };
    console.log("📧 Using generic SMTP");
  }

  transporter = nodemailer.createTransport(smtpConfig);

  console.log(`📧 Email transporter initialized for: ${emailUser}`);
}

// Send ticket creation email
export async function sendTicketEmail(email, ticketId) {
  try {
    initTransporter(); // ensure transporter is ready

    const ticketLink = `http://localhost:3000/ticket/${ticketId}`;

    await transporter.sendMail({
      from: `"Support Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Support Ticket",
      html: `
        <p>Your ticket has been created.</p>
        <p><b>Ticket ID:</b> ${ticketId}</p>
        <p>View and reply: <a href="${ticketLink}">${ticketLink}</a></p>
      `,
    });

    console.log("✅ Ticket email sent to:", email);
  } catch (err) {
    console.error("Failed to send ticket email:", err.message);
  }
}

// Send agent/admin reply email
export async function sendAgentReplyEmail(email, ticketId, agentResponse) {
  try {
    initTransporter(); // ensure transporter is ready

    const ticketLink = `http://localhost:3000/ticket/${ticketId}`;

    await transporter.sendMail({
      from: `"Support Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Update on Your Support Ticket",
      html: `
        <p>Your ticket has received a response.</p>
        <p><b>AI Response:</b></p>
        <blockquote>${agentResponse.response}</blockquote>
        <p><i>Reasoning:</i> ${agentResponse.reasoning}</p>
        <p>View full conversation: <a href="${ticketLink}">${ticketLink}</a></p>
      `,
    });

    console.log("✅ Agent reply email sent to:", email);
  } catch (err) {
    console.error("Failed to send agent reply email:", err.message);
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email, resetToken) {
  try {
    initTransporter(); // ensure transporter is ready

    if (!transporter) {
      console.error("❌ Email transporter not initialized. Check EMAIL_USER and EMAIL_PASS in .env");
      return false;
    }

    const resetLink = `http://localhost:3000/reset-password?email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: `"Support Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Code - Support Hub",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password. Use the code below to reset your password:</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">${resetToken}</h1>
          </div>

          <p>Or click this link to reset your password:</p>
          <p><a href="${resetLink}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${resetLink}</a></p>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>Note:</strong> This code will expire in 15 minutes.
          </p>

          <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
      `,
    });

    console.log("✅ Password reset email sent to:", email);
    return true;
  } catch (err) {
    console.error("❌ Failed to send password reset email:", err.message);
    return false;
  }
}