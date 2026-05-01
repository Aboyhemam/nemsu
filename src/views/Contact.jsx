import React, { useState } from "react";
import "../css/contact.css";

function Contact() {

  // ✅ State (added)
  const [senderName, setSenderName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // ✅ Submit handler (added)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg("");

    if (!senderName || !email || !message) {
      setStatusMsg("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("https://nemsu-backend.onrender.com/msg/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderName,
          email,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMsg(data.message || "Something went wrong");
        return;
      }

      // ✅ success
      setStatusMsg("Message sent successfully!");
      setSenderName("");
      setEmail("");
      setMessage("");

    } catch (err) {
      setStatusMsg("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contactContainer">
      <div className="contact">

        <div className="contactHeader">
          <h2 className="contactTitle">Contact Us</h2>
          <p className="contactSub">
            Reach out to NEMSU for queries, collaborations, or support.
          </p>
        </div>

        <div className="contactContent">

          {/* LEFT INFO */}
          <div className="contactInfo">
            <div className="infoCard">
              <h3>Email</h3>
              <p>nemsuofficial1@gmail.com</p>
            </div>

            <div className="infoCard">
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
            </div>

            <div className="infoCard">
              <h3>Location</h3>
              <p>NERIST Campus, Arunachal Pradesh</p>
            </div>
          </div>

          {/* RIGHT FORM */}
          <form className="contactForm" onSubmit={handleSubmit}>
            <div className="inputGroup">
              <input
                type="text"
                placeholder="Full Name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
              />
            </div>

            <div className="inputGroup">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="inputGroup">
              <textarea
                placeholder="Your Message"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {/* ✅ Status message */}
            {statusMsg && (
              <p style={{ marginBottom: "10px", color: "crimson" }}>
                {statusMsg}
              </p>
            )}

            <button type="submit" className="sendBtn" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Contact;