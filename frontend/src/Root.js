import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TicketView from "./TicketView"; // the ticket view page
import App from "./App"; // your main guest/admin ticket list page

export default function Root() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ticket/:ticketId" element={<TicketView />} />
      </Routes>
    </Router>
  );
}