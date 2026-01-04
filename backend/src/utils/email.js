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

export async function sendTicketEmail(email, ticketId) {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const ticketLink = `http://localhost:3000/ticket/${ticketId}`; // frontend link

  const info = await transporter.sendMail({
    from: '"AI Support" <support@test.com>',
    to: email,
    subject: "Your Support Ticket",
    html: `
      <p>Your ticket has been created.</p>
      <p><b>Ticket ID:</b> ${ticketId}</p>
      <p>View and reply to your ticket: <a href="${ticketLink}">${ticketLink}</a></p>
    `,
  });

  console.log("📨 Preview URL:", nodemailer.getTestMessageUrl(info));
}

export async function sendAgentReplyEmail(email, ticketId, agentResponse) {
  const ticketLink = `http://localhost:3000/tickets/${ticketId}`;

  await transporter.sendMail({
    from: `"AI Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Update on Your Support Ticket",
    html: `
      <p>Your ticket has received a response.</p>

      <p><b>AI Response:</b></p>
      <blockquote>${agentResponse.response}</blockquote>

      <p><i>Reasoning:</i> ${agentResponse.reasoning}</p>

      <p>
        View full conversation:
        <a href="${ticketLink}">${ticketLink}</a>
      </p>
    `,
  });
}
