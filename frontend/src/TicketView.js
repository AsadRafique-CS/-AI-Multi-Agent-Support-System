import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function TicketView() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");

  const fetchTicket = async () => {
    const res = await axios.get(`http://localhost:4000/tickets`);
    const t = res.data.find(t => t.id === ticketId);
    setTicket(t);
  };

  const sendReply = async () => {
    if (!reply) return;
    await axios.post(`http://localhost:4000/tickets/${ticketId}/messages`, {
      sender: "guest",
      text: reply,
    });
    setReply("");
    fetchTicket();
  };

  useEffect(() => {
    fetchTicket();
  }, []);

  if (!ticket) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Ticket #{ticket.id}</h2>
      <div>
        {ticket.messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: "1rem", alignSelf: msg.sender === "guest" ? "flex-start" : "flex-end" }}>
            <b>{msg.sender}:</b> {msg.content}
            {msg.sender === "agent" && msg.reasoning && (
              <div style={{ fontSize: "0.8rem", fontStyle: "italic" }}>{msg.reasoning}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <textarea
          placeholder="Write your reply..."
          value={reply}
          onChange={e => setReply(e.target.value)}
          style={{ width: "100%", height: "80px" }}
        />
        <button onClick={sendReply} style={{ marginTop: "0.5rem" }}>Send Reply</button>
      </div>
    </div>
  );
}
