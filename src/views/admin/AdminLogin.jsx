import React from 'react'
import "../../css/adminlogin.css"

function AdminLogin() {
  return (
    <div className="adminLoginFormWrap">
      <div className="adminLoginFormContainer">
        <form className="adminLoginForm">
          <h1 className="adminLogin">Admin Login</h1>

          <div className="loginComponent">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              placeholder="Enter username" 
            />
          </div>

          <div className="loginComponent">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              placeholder="Enter password"
            />
          </div>

          <button className="login" type="submit">Login</button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin