import React from 'react'
import "../css/about.css"

import pic1 from "../assets/pictures/gfm.jpg"
import pic2 from "../assets/pictures/fresher-meet/IMG-20250810-WA0345.jpg"
import pic3 from "../assets/pictures/pic1.jpg"
import pic4 from "../assets/pictures/eachu/IMG_9074.JPG"
import pic5 from "../assets/pictures/IMG_0501.jpg"
import pic6 from "../assets/pictures/eachu/IMG_5202.jpg"
import pic7 from "../assets/pictures/ningol-chakouba/5.JPG"

const data = [
  {
    img: pic1,
    text: "The Nerist Manipur Students’ Union (NEMSU) stands as a vibrant student organization..."
  },
  {
    img: pic2,
    text: "One of the most anticipated events organized by NEMSU is the Fresher Meet..."
  },
  {
    img: pic3,
    text: "Another key event is the One Day Sports Meet..."
  },
  {
    img: pic4,
    text: "NEMSU also takes pride in celebrating important cultural festivals..."
  },
  {
    img: pic5,
    text: "One of the most lively and culturally rich programs is Thabal Chongba..."
  },
  {
    img: pic6,
    text: "Finally, the Farewell program is organized to bid a heartfelt goodbye..."
  },
  {
    img: pic7,
    text: "Through these events and initiatives, NEMSU continues to uphold its mission..."
  }
]

function About() {
  return (
    <div className="aboutContainer">
      {data.map((item, index) => (
        <div 
          key={index} 
          className={`aboutSection ${index % 2 === 0 ? "right" : "left"}`}
        >
          <div className="imgContainer">
            <img 
              src={item.img} 
              alt="NEMSU event" 
              className="aboutImg"
              loading="lazy"
            />
          </div>

          <div className="parContainer">
            <p className="aboutText">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default About