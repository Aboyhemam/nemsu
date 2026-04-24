import React from 'react'

function AdminLogin() {
  return (
    
    <div className="adminLoginFormWrap">
        <div className="adminLoginFormContainer">
            <form action="post" className="adminLoginForm">
                <h1 className="adminLogin">Admin Login</h1>
                <label htmlFor="username" className="usernameLabel">
                    User Name:
                </label>
                <input type="text" className="username" />
                <label htmlFor="password" className="password">
                    Password:
                </label>
                <input type="password" className="password" />
                <button className="login" type='submit'>Login</button>
            </form>
        </div>
    </div>
  )
}

export default AdminLogin