import React from 'react'
import Header from './presets/Header'
import "./../css/home.css"
function Home() {
  return (
    <div className="homeBody">
        <div className="heading">
        <div className="nemsu">
            <h2 className="name">Nerist Manipur Students' Union</h2>
        </div>
        <div className="motto">
            <h3 className="motoText">
                Learn Unity and Peace
            </h3>
        </div>
        </div>
        <div className="bodyBody">
            <div className="picContainer">
                <div className="pic">
                    <img src="/pictures/IMG-20260422-WA0075.jpg" alt="" className="homePic" />
                </div>
            </div>
            <div className="textContainer">
                <div className="bodyText">
                    <span className="text">
                        The Nerist Manipur Students' Union (NEMSU) is a student-driven organization established to promote the welfare, unity, and overall development of Manipuri students at NERIST. Rooted in the values of community support and cultural identity, NEMSU serves as a platform for students to connect, collaborate, and address their academic and social needs. Guided by its motto, “Learn, Unity and Peace,” the union strives to foster a harmonious environment where students can grow intellectually, support one another, and contribute positively to campus life.
                    </span>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Home