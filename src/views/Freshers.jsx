import React, { useState } from 'react'
import "../css/fresherform.css"

function Freshers() {

  const [formData, setFormData] = useState({
    name: "",
    parentName: "",
    phoneNo: "",
    parentNo: "",
    email: "",
    address: "",
    entry: "",
    status: "",
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // ─────────────────────────────────────────────
  // Handle Input Change
  // ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // ─────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────
  const validateForm = () => {

    if (
      !formData.name.trim() ||
      !formData.parentName.trim() ||
      !formData.phoneNo.trim() ||
      !formData.parentNo.trim() ||
      !formData.email.trim() ||
      !formData.address.trim() ||
      !formData.entry.trim() ||
      !formData.status.trim()
    ) {
      return "Please fill all fields"
    }

    // Phone Validation
    const phoneRegex = /^[0-9]{10}$/

    if (!phoneRegex.test(formData.phoneNo)) {
      return "Enter a valid 10-digit phone number"
    }

    if (!phoneRegex.test(formData.parentNo)) {
      return "Enter a valid parent phone number"
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(formData.email)) {
      return "Enter a valid email address"
    }

    return null
  }

  // ─────────────────────────────────────────────
  // Submit Form
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setMessage("")

    // Validate Form
    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    try {

      setLoading(true)

      const res = await fetch(
        "https://nemsu-backend.onrender.com/fresher/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData)
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      setMessage("Form submitted successfully")

      // Reset Form
      setFormData({
        name: "",
        parentName: "",
        phoneNo: "",
        parentNo: "",
        email: "",
        address: "",
        entry: "",
        status: "",
      })

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fresherFormContainer">

        {/* ───────────────── HEADER ───────────────── */}
        <div className="formHeaderContainer">

          <div className="formHeader">
            <h2 className="formHeading">
              Form for NEE/NEPGET Selected and Waiting List
            </h2>
          </div>

          <div className="headerBody">

            <span className="hBody">
              Note: This form is meant only for candidates from
              Manipur, including Manipuri candidates from other
              states, who appeared in the NERIST Entrance
              Examination (NEE) or NERIST Post Graduate Entrance
              Test (NEPGET) and are either selected or in the
              waiting list.

              By filling up this form, we will be able to reach
              out to you and assist you during counselling and
              admission at NERIST.
            </span>

            <div className="ebodyContainer">

              <h3 className="eBodyHead">
                Please contact our executives for any clarification
              </h3>

              <p className="executive">
                President: Guneshwor Hijam 
              </p>
              <p className="executive">
                📞
                <a
                  href="tel:+919366972568"
                  className="eBodyContact"
                >
                  +91 93669 72568
                </a>
              </p>

              <p className="executive">
                General Secretary: Hemam Naresh Singh 
              </p>
              <p className="executive">
                📞
                <a
                  href="tel:+919362843841"
                  className="eBodyContact"
                >
                  +91 93628 43841
                </a>
              </p>

              <p className="executive">
                Vice President: Yoihenba Loitongbam
              </p>
              <p className="executive">
                📞
                <a
                  href="tel:+916009105215"
                  className="eBodyContact"
                >
                  +91 60091 05215
                </a>
              </p>

              <p className="executive">
                Asst. General Secretary: Dulin Lenneikip Kom
              </p>
              <p className="executive">
                📞
                <a
                  href="tel:+917085677612"
                  className="eBodyContact"
                >
                  +91 70856 77612
                </a>
              </p>

              <p className="executive">
                Finance Secretary: Loingamba Yambem
              </p>
              <p className="executive">
                📞
                <a
                  href="tel:+918787819704"
                  className="eBodyContact"
                >
                  +91 87878 19704
                </a>
              </p>

            </div>
          </div>
        </div>

        {/* ───────────────── FORM ───────────────── */}
        <div className="formBody">

          <form onSubmit={handleSubmit} className="fresher">

            {/* Error Message */}
            {error && (
              <p className="formError">
                {error}
              </p>
            )}

            {/* Success Message */}
            {message && (
              <p className="formSuccess">
                {message}
              </p>
            )}

            {/* Name */}
            <input
              className='fresherInput'
              type='text'
              name='name'
              placeholder='Enter your Name'
              value={formData.name}
              onChange={handleChange}
            />

            {/* Parent Name */}
            <input
              className='fresherInput'
              type='text'
              name='parentName'
              placeholder='Enter your Parent Name'
              value={formData.parentName}
              onChange={handleChange}
            />

            {/* Phone */}
            <input
              className='fresherInput'
              type='tel'
              name='phoneNo'
              placeholder='Enter your number'
              value={formData.phoneNo}
              onChange={handleChange}
              maxLength={10}
            />

            {/* Parent Phone */}
            <input
              className='fresherInput'
              type='tel'
              name='parentNo'
              placeholder="Enter Parent's number"
              value={formData.parentNo}
              onChange={handleChange}
              maxLength={10}
            />

            {/* Email */}
            <input
              className='fresherInput'
              type='email'
              name='email'
              placeholder='Enter your email'
              value={formData.email}
              onChange={handleChange}
            />

            {/* Address */}
            <textarea
              className='fresherInput'
              name='address'
              placeholder='Enter Address'
              value={formData.address}
              onChange={handleChange}
            />

            {/* Entry */}
            <select
              className='fresherInput'
              name='entry'
              value={formData.entry}
              onChange={handleChange}
            >
              <option value="">
                Select your entrance examination
              </option>

              <option value="NEE I">NEE I</option>
              <option value="NEE II(BBA)">NEE II (BBA)</option>
              <option value="NEE II(PCB Forestry)">NEE II(PCB Forestry)</option>
              <option value="NEE II(PCM Science)">NEE II(PCM Science)</option>
              <option value="NEE II(PCM E&T)">NEE II(PCM E&T)</option>
              <option value="JEE">JEE</option>
              <option value="CUET">CUET</option>
              <option value="NEE III">NEE III</option>
              <option value="NEPGET">NEPGET</option>

            </select>

            {/* Status */}
            <select
              name="status"
              className='fresherInput'
              value={formData.status}
              onChange={handleChange}
            >
              <option value="">
                Select your status
              </option>

              <option value="Selected">
                Selected
              </option>

              <option value="Waiting">
                Waiting
              </option>
            </select>

            {/* Submit Button */}
            <button
              className='buttonform'
              type='submit'
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Form"}
            </button>

          </form>
        </div>
      </div>
    </>
  )
}

export default Freshers