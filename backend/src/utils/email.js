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
let testAccountInitialized = false;

// Initialize transporter once
async function initTransporter() {
  if (testAccountInitialized) return;

  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  testAccountInitialized = true;
  console.log("📧 Nodemailer transporter initialized");
}

// Send ticket creation email
export async function sendTicketEmail(email, ticketId) {
  try {
    await initTransporter(); // ensure transporter is ready

    const ticketLink = `http://localhost:3000/ticket/${ticketId}`;

    const info = await transporter.sendMail({
      from: '"AI Support" <support@test.com>',
      to: email,
      subject: "Your Support Ticket",
      html: `
        <p>Your ticket has been created.</p>
        <p><b>Ticket ID:</b> ${ticketId}</p>
        <p>View and reply: <a href="${ticketLink}">${ticketLink}</a></p>
      `,
    });

    console.log("📨 Ticket Email Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Failed to send ticket email:", err.message);
  }
}

// Send agent/admin reply email
export async function sendAgentReplyEmail(email, ticketId, agentResponse) {
  try {
    await initTransporter(); // ensure transporter is ready

    const ticketLink = `http://localhost:3000/ticket/${ticketId}`;

    const info = await transporter.sendMail({
      from: '"AI Support" <support@test.com>',
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

    console.log("📨 Agent Reply Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Failed to send agent reply email:", err.message);
  }
}