import React from "react";
import "../css/contact.css";

function Contact() {
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
          <form className="contactForm">
            <div className="inputGroup">
              <input type="text" placeholder="Full Name" required />
            </div>

            <div className="inputGroup">
              <input type="email" placeholder="Email Address" required />
            </div>

            <div className="inputGroup">
              <textarea placeholder="Your Message" rows="5" required />
            </div>

            <button type="submit" className="sendBtn">
              Send Message
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Contact;