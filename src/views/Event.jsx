import React, { useState } from 'react'
import "../css/event.css"

function Event() {

  const images1 = Object.values(
  import.meta.glob('../assets/fresher-meet/*.{jpg,JPG,png}', {
    eager: true,
    import: 'default'
  })
)

  const images2 = Object.values(
  import.meta.glob('../assets/ningol-chakouba/*.{jpg,JPG,png}', {
    eager: true,
    import: 'default'
  })
)

  const images3 = Object.values(
  import.meta.glob('../assets/eachu/*.{jpg,JPG,png}', {
    eager: true,
    import: 'default'
  })
)

  const [activeIndex, setActiveIndex] = useState(0)
  const [activeIndex1, setActiveIndex1] = useState(0)
  const [activeIndex2, setActiveIndex2] = useState(0)

  return (
    <div className="eventContainer">
      <div className="event">

        {/* ================= GALLERY ================= */}
        <div className="galleryWrap">

          {/* 🔥 MAIN VIEW */}
          <div className="galleryView">

            {/* INDEX (TOP LEFT) */}
            <div className="mainIndex">
              {activeIndex + 1} / {images1.length}
            </div>

            {images1.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className={`viewimg ${index === activeIndex ? "active" : ""}`}
              />
            ))}
          </div>

          {/* 🔥 THUMBNAILS */}
          <div className="gallery">
            {images1.map((img, index) => (
              <div
                key={index}
                className={`eventImgContainer ${index === activeIndex ? "active" : ""}`}
                onClick={() => setActiveIndex(index)}
              >
                <div className="imgContent">
                  <img src={img} alt="" className="imgEvent" />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ================= TEXT (NOW BELOW) ================= */}
        <div className="eventAbout">
          <div className="eventTitle">
            <h3 className="titleText">Freshers' Meet</h3>
          </div>

          <div className="eventDescript">
            <div className="descripttext">
              <p className="textEvent">
                The Fresher Meet is one of the most welcoming and lively events organized by NEMSU to greet new students joining NERIST. It serves as a platform for freshers to introduce themselves, interact with seniors, and become part of the Manipuri student community. The event usually includes cultural performances, fun activities, and ice-breaking sessions, helping newcomers feel comfortable and connected from the very beginning of their journey.
              </p>
            </div>
          </div>
        </div>

      </div>
      <div className="event">

        {/* ================= GALLERY ================= */}
        <div className="galleryWrap">

          {/* 🔥 MAIN VIEW */}
          <div className="galleryView">

            {/* INDEX (TOP LEFT) */}
            <div className="mainIndex">
              {activeIndex1 + 1} / {images2.length}
            </div>

            {images2.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className={`viewimg ${index === activeIndex1 ? "active" : ""}`}
              />
            ))}
          </div>

          {/* 🔥 THUMBNAILS */}
          <div className="gallery">
            {images2.map((img, index) => (
              <div
                key={index}
                className={`eventImgContainer ${index === activeIndex1 ? "active" : ""}`}
                onClick={() => setActiveIndex1(index)}
              >
                <div className="imgContent">
                  <img src={img} alt="" className="imgEvent" />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ================= TEXT (NOW BELOW) ================= */}
        <div className="eventAbout">
          <div className="eventTitle">
            <h3 className="titleText">Ningol Chakouba</h3>
          </div>

          <div className="eventDescript">
            <div className="descripttext">
              <p className="textEvent">
                Ningol Chakouba is a culturally significant festival celebrated by NEMSU with great warmth and respect. It is dedicated to honoring women, especially sisters and daughters, and symbolizes love and family bonding. During the celebration, students come together to share traditional meals and recreate the feeling of home, making it a deeply emotional and meaningful event for everyone involved.
              </p>
            </div>
          </div>
        </div>

      </div>
      <div className="event">

        {/* ================= GALLERY ================= */}
        <div className="galleryWrap">

          {/* 🔥 MAIN VIEW */}
          <div className="galleryView">

            {/* INDEX (TOP LEFT) */}
            <div className="mainIndex">
              {activeIndex2 + 1} / {images3.length}
            </div>

            {images3.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className={`viewimg ${index === activeIndex2 ? "active" : ""}`}
              />
            ))}
          </div>

          {/* 🔥 THUMBNAILS */}
          <div className="gallery">
            {images3.map((img, index) => (
              <div
                key={index}
                className={`eventImgContainer ${index === activeIndex2 ? "active" : ""}`}
                onClick={() => setActiveIndex2(index)}
              >
                <div className="imgContent">
                  <img src={img} alt="" className="imgEvent" />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ================= TEXT (NOW BELOW) ================= */}
        <div className="eventAbout">
          <div className="eventTitle">
            <h3 className="titleText">Sports</h3>
          </div>

          <div className="eventDescript">
            <div className="descripttext">
              <p className="textEvent">
                The One Day Sports Meet is organized to promote fitness, teamwork, and sportsmanship among students. This energetic event features a variety of indoor and outdoor games where participants compete with enthusiasm and unity. It encourages students to take a break from academics, engage in healthy competition, and build stronger bonds through team spirit and collaboration.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Event