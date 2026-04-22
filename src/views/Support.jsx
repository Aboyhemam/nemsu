import React from "react";
import "../css/support.css";

function Support() {
  return (
    <div className="supportContainer">
      <div className="support">

        <div className="supportHeader">
          <h2 className="supportTitle">Support Us</h2>
          <p className="supportSub">
            Help NEMSU grow and continue supporting students through your contribution.
          </p>
        </div>

        <div className="supportCards">

          <div className="supportCard">
            <h3>Volunteer</h3>
            <p>Join our events and contribute your skills to the community.</p>
            <button>Join Now</button>
          </div>

          <div className="supportCard">
            <h3>Donate</h3>
            <p>Your support helps us organize events and assist students.</p>
            <button>Donate</button>
          </div>

          <div className="supportCard">
            <h3>Collaborate</h3>
            <p>Partner with us for events, workshops, and initiatives.</p>
            <button>Collaborate</button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Support;