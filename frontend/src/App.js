// import { useState, useEffect } from "react";
// import axios from "axios";

// function App() {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [tickets, setTickets] = useState([]);

//   // Fetch tickets on mount
//   useEffect(() => {
//     fetchTickets();
//   }, []);

//   const submitTicket = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:4000/tickets", {
//         email,
//         message,
//       });
//       alert("Ticket submitted! ID: " + res.data.ticketId);
//       setEmail("");
//       setMessage("");
//       fetchTickets();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to submit ticket");
//     }
//   };

//   const fetchTickets = async () => {
//     try {
//       const res = await axios.get("http://localhost:4000/tickets");
//       setTickets(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
//       <h1>Support Ticket System</h1>

//       {/* Submit Ticket Form */}
//       <form onSubmit={submitTicket} style={{ marginBottom: "2rem" }}>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           style={{ marginRight: "1rem", padding: "0.5rem" }}
//         />
//         <input
//           type="text"
//           placeholder="Message"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           required
//           style={{ marginRight: "1rem", padding: "0.5rem", width: "300px" }}
//         />
//         <button type="submit" style={{ padding: "0.5rem 1rem" }}>
//           Submit Ticket
//         </button>
//       </form>

//       <hr />

//       {/* Tickets */}
//       <button onClick={fetchTickets} style={{ margin: "1rem 0", padding: "0.5rem 1rem" }}>
//         Load Tickets
//       </button>

//       {tickets.length > 0 &&
//         tickets.map((ticket) => (
//           <div
//             key={ticket.id}
//             style={{
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               padding: "1rem",
//               marginBottom: "1.5rem",
//             }}
//           >
//             <p><b>Ticket ID:</b> {ticket.id}</p>
//             <p><b>Email:</b> {ticket.email}</p>
//             <p><b>Intent:</b> {ticket.intent} (Confidence: {ticket.confidence})</p>

//             {/* <div style={{ marginTop: "1rem" }}>
//               <h4>Conversation:</h4>
//               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                
//                 <div style={{ alignSelf: "flex-start", maxWidth: "70%" }}>
//                   <div
//                     style={{
//                       background: "#e0f7fa",
//                       padding: "0.5rem 1rem",
//                       borderRadius: "15px",
//                     }}
//                   >
//                     <b>guest:</b> {ticket.message}
//                   </div>
//                 </div>

                
//                 {ticket.agentResponse && (
//                   <div style={{ alignSelf: "flex-end", maxWidth: "70%" }}>
//                     <div
//                       style={{
//                         background: "#fff3e0",
//                         padding: "0.5rem 1rem",
//                         borderRadius: "15px",
//                       }}
//                     >
//                       <b>agent:</b> {ticket.agentResponse.response}
//                       <div style={{ fontSize: "0.8rem", fontStyle: "italic", marginTop: "0.2rem" }}>
//                         {ticket.agentResponse.reasoning}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div> */}
//             <div style={{ marginTop: "1rem" }}>
//   <h4>Conversation:</h4>
//   <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//     {ticket.messages.map((msg, index) => (
//   <div
//     key={index}
//     style={{
//       alignSelf: msg.sender === "guest" ? "flex-start" : "flex-end",
//       maxWidth: "70%",
//     }}
//   >
//     <div
//       style={{
//         background: msg.sender === "guest" ? "#e0f7fa" : "#fff3e0",
//         padding: "0.5rem 1rem",
//         borderRadius: "15px",
//       }}
//     >
//       <b>{msg.sender}:</b> {msg.text}
//       {msg.sender === "agent" && msg.reasoning && (
//         <div style={{ fontSize: "0.8rem", fontStyle: "italic", marginTop: "0.2rem" }}>
//           {msg.reasoning}
//         </div>
//       )}
//     </div>
//   </div>
// ))}
//   </div>
// </div>

//           </div>
//         ))}
//     </div>
//   );
// }

// export default App;
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // switch between guest/admin
  const [editText, setEditText] = useState({}); // for admin edits

  useEffect(() => {
    fetchTickets();
  }, []);

  const submitTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/tickets", {
        email,
        message,
      });
      if (res.data.message === "Merged with existing ticket") {
  alert(`Your message was merged with ticket ID: ${res.data.ticketId}`);
} else {
  alert("Ticket submitted! ID: " + res.data.ticketId);
}
      setEmail("");
      setMessage("");
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert("Failed to submit ticket");
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:4000/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminAction = async (ticketId, messageId, action, reassignTo = "TechnicalAgent") => {
  try {
    await axios.post(`http://localhost:4000/tickets/${ticketId}/admin-action`, {
      messageId,
      action,
      editedText: editText[messageId],
      reassignTo, // send agent type if reassigning
    });
    fetchTickets();
    setEditText((prev) => ({ ...prev, [messageId]: "", [`reassign-${messageId}`]: "" }));
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Support Ticket System</h1>

      {/* Toggle guest/admin */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={() => setIsAdmin((prev) => !prev)}
            style={{ marginRight: "0.5rem" }}
          />
          Admin Mode
        </label>
      </div>

      {/* Guest form (only if not admin) */}
      {!isAdmin && (
        <form onSubmit={submitTicket} style={{ marginBottom: "2rem" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ marginRight: "1rem", padding: "0.5rem" }}
          />
          <input
            type="text"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            style={{ marginRight: "1rem", padding: "0.5rem", width: "300px" }}
          />
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>
            Submit Ticket
          </button>
        </form>
      )}

      <hr />

      <button onClick={fetchTickets} style={{ margin: "1rem 0", padding: "0.5rem 1rem" }}>
        Load Tickets
      </button>

      {tickets.length > 0 &&
        tickets.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <p><b>Ticket ID:</b> {ticket.id}</p>
            <p><b>Email:</b> {ticket.email}</p>
            <p><b>Intent:</b> {ticket.intent} (Confidence: {ticket.confidence})</p>

            <div style={{ marginTop: "1rem" }}>
              <h4>Conversation:</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {ticket.messages.map((msg) => (
                  <div
  key={msg.id}
  style={{
    alignSelf: msg.sender === "guest" ? "flex-start" : "flex-end",
    maxWidth: "70%",
    border: (msg.status === "low-confidence" || msg.status === "escalated") ? "2px solid red" : "none", // highlight low-confidence and on escalated
    background: msg.sender === "guest" ? "#e0f7fa" : "#fff3e0",
    padding: "0.5rem 1rem",
    borderRadius: "15px",
    position: "relative",
  }}
>
  <b>{msg.sender}:</b> {msg.content}

  {/* Low-confidence badge */}
  {(msg.status === "low-confidence" || msg.status === "escalated") && (
    <span
      style={{
        position: "absolute",
        top: "-10px",
        right: "-10px",
        background: "red",
        color: "white",
        padding: "2px 6px",
        fontSize: "0.7rem",
        borderRadius: "50%",
      }}
    >
      !
    </span>
  )}

  {msg.sender === "agent" && msg.reasoning && (
    <div style={{ fontSize: "0.8rem", fontStyle: "italic", marginTop: "0.2rem" }}>
      {msg.reasoning}
    </div>
  )}
{/* Show status + routing info */}
<div style={{ fontSize: "0.8rem", fontStyle: "italic", marginTop: "0.2rem" }}>
  Status: {msg.status} | Reasoning: {msg.reasoning}
</div>
  {/* Admin actions for pending messages */}
  {isAdmin && (msg.status === "pending" || msg.status === "low-confidence") && msg.sender === "agent" && (
  <div style={{ marginTop: "0.5rem" }}>
    <textarea
      placeholder="Write or edit message for guest"
      value={editText[msg.id] || msg.content}
      onChange={(e) =>
        setEditText((prev) => ({ ...prev, [msg.id]: e.target.value }))
      }
      style={{ width: "100%", marginBottom: "0.5rem" }}
    />
    {msg.status === "pending" && (
      <>
        <button
          onClick={() => handleAdminAction(ticket.id, msg.id, "approve")}
          style={{ marginRight: "0.5rem" }}
        >
          Approve
        </button>
        <button
          onClick={() => handleAdminAction(ticket.id, msg.id, "edit")}
          style={{ marginRight: "0.5rem" }}
        >
          Edit
        </button>
        <button  style={{ marginRight: "0.5rem" }} onClick={() => handleAdminAction(ticket.id, msg.id, "reject")}>
          Reject
                            </button>
                            <button
      onClick={() => {
        const agentType = prompt("Enter agent to reassign to (e.g., TechnicalAgent, RefundAgent):");
        if (agentType) handleAdminAction(ticket.id, msg.id, "reassign", agentType);
      }}
    >
      Reassign
    </button>
      </>
                        )}
                        {/* Admin view for failed messages */}
{isAdmin && msg.status === "failed" && (
  <div style={{ color: "red", fontWeight: "bold", marginTop: "0.5rem" }}>
    ⚠ Agent failed: edit or respond manually
  </div>
)}

                        {isAdmin && msg.status === "escalated" && (
  <div style={{ marginTop: "0.5rem", background: "#ffebee", padding: "0.5rem", borderRadius: "10px" }}>
    <b>Escalated Message:</b> {msg.content}
    <textarea
      placeholder="Reply as admin"
      value={editText[msg.id] || ""}
      onChange={(e) =>
        setEditText((prev) => ({ ...prev, [msg.id]: e.target.value }))
      }
      style={{ width: "100%", marginTop: "0.5rem" }}
    />
    <button onClick={() => handleAdminAction(ticket.id, msg.id, "approve")}>
      Send Reply
    </button>
  </div>
)}

    {msg.status === "low-confidence" && (
      <button
        onClick={() => handleAdminAction(ticket.id, msg.id, "approve")}
      >
        Send to Guest
      </button>
    )}
  </div>
)}
</div>
                ))}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

export default App;

