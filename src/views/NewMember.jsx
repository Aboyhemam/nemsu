import React, { useState, useRef } from 'react'
import './../css/newmember.css'
import qr from "./../assets/payment_qr.jpeg"

const API_BASE = 'https://nemsu-backend.onrender.com'

const SECTIONS = ['Personal', 'Academic', 'Family & Contact', 'Documents', 'Agreement']

function UploadBox({ label, fieldName, value, onChange, accent }) {
  const inputRef = useRef(null)
  const hasFile = !!value

  return (
    <div
      className={`uploadBox ${accent ? 'uploadBoxAccent' : ''}`}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) onChange(fieldName, file)
        }}
      />
      {hasFile ? (
        <div className="uploadPreview">
          <img
            src={URL.createObjectURL(value)}
            alt={label}
            className="uploadThumb"
          />
          <span className="uploadDone">✓ {value.name}</span>
        </div>
      ) : (
        <div className="uploadPlaceholder">
          <span className="uploadIcon">↑</span>
          <span className="uploadLabel">{label}</span>
          <span className="uploadHint">Click to upload image</span>
        </div>
      )}
    </div>
  )
}

const AGREEMENT_TEXT = `I, the undersigned, hereby declare that:

1. All information provided in this registration form is true, correct, and complete to the best of my knowledge. Any false or misleading information may result in cancellation of membership.

2. I am a bonafide student of NERIST (North Eastern Regional Institute of Science and Technology), Nirjuli, Arunachal Pradesh, and I belong to the state of Manipur.

3. I agree to abide by the rules, regulations, and code of conduct of the NEMSU (NERIST Manipur Students' Union) Constituition (https://www.nemsu.co.in/NEMSUCONS.pdf) and shall not engage in any activity that brings disrepute to the organization.

4. I understand that NEMSU membership is non-transferable and is valid for the duration of my enrollment at NERIST.

5. I authorize NEMSU to use my information for official communication, record-keeping, and organizational purposes only. My data will not be shared with third parties without my consent.

6. I acknowledge that the membership fee paid is non-refundable under any circumstances.

7. I agree that if I am any found involved in violating Institute's rules, the Union will not intervene or provide assistance — no excuses, no exceptions

8. I agree to participate actively in the activities of NEMSU and contribute positively to the welfare of Manipuri students at NERIST.

9. I hereby agree to pay any fines imposed by the Union for acts of indiscipline, with each disciplinary fine not exceeding ₹200. Furthermore, if I choose to leave the Union before completing my studies at NERIST while continuing to reside or study at NERIST, I agree to pay a fine of ₹2,000 for actions deemed detrimental to the unity and integrity of the NEMSU family.

By uploading my signature below, I confirm that I have read, understood, and agree to all the terms and conditions stated above.`

function NewMember() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    DOB: '',
    address: '',
    district: '',
    pin: '',
    state: '',
    course: '',
    department: '',
    admissionYear: '',
    admittedThrough: '',
    fatherName: '',
    motherName: '',
    phoneNo: '',
    email: '',
    parentPhoneNo: '',
  })

  const [files, setFiles] = useState({
    passportPhoto: null,
    payment_SS: null,
    student_sign: null,
    parent_sign: null,
  })

  const [agreed, setAgreed] = useState(false)
  const [section, setSection] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFile = (fieldName, file) => {
    setFiles((prev) => ({ ...prev, [fieldName]: file }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) { setError('You must agree to the terms before submitting.'); return }
    if (!files.student_sign) { setError('Student signature is required.'); return }
    if(!files.passportPhoto) {setError("Passport Photo is required"); return }
    if (!files.parent_sign)  { setError('Parent/Guardian signature is required.'); return }
    if (!files.payment_SS) {
  setError('Payment screenshot is required.')
  return
}

    setLoading(true)
    setError('')

    try {
      const body = new FormData()
      Object.entries(formData).forEach(([k, v]) => body.append(k, v))
      Object.entries(files).forEach(([k, v]) => { if (v) body.append(k, v) })

      const res = await fetch(`${API_BASE}/member/add`, {
        method: 'POST',
        body,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || `Server error ${res.status}`)
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const next = () => setSection((s) => Math.min(s + 1, SECTIONS.length - 1))
  const prev = () => setSection((s) => Math.max(s - 1, 0))

  const resetForm = () => {
    setSuccess(false)
    setAgreed(false)
    setError('')
    setSection(0)
    setFormData({
      firstName: '', middleName: '', lastName: '', gender: '',
      DOB: '', address: '', district: '', pin: '', state: '',
      course: '', department: '', admissionYear: '', admittedThrough: '',
      fatherName: '', motherName: '', phoneNo: '', email: '', parentPhoneNo: '',
    })
    setFiles({ passportPhoto: null, payment_SS: null, student_sign: null, parent_sign: null })
  }

  if (success) {
    return (
      <div className="nmWrap">
        <div className="nmSuccessBox">
          <div className="nmSuccessIcon">✓</div>
          <h2 className="nmSuccessTitle">Member Registered!</h2>
          <p className="nmSuccessSub">The new NEMSU member has been successfully registered.</p>
          <button className="nmBtn nmBtnPrimary" onClick={resetForm}>
            Add Another Member
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="nmWrap">
      {/* ── Page Header ── */}
      <div className="nmPageHeader">
        <p className="nmBreadcrumb">Admin / Members / New</p>
        <h1 className="nmPageTitle">New Member Registration</h1>
        <p className="nmPageSub">Fill in all sections to register a new NEMSU member.</p>
      </div>

      {/* ── Progress Steps ── */}
      <div className="nmSteps">
        {SECTIONS.map((label, i) => (
          <div
            key={i}
            className={`nmStep ${i === section ? 'nmStepActive' : ''} ${i < section ? 'nmStepDone' : ''}`}
            onClick={() => setSection(i)}
          >
            <div className="nmStepDot">{i < section ? '✓' : i + 1}</div>
            <span className="nmStepLabel">{label}</span>
          </div>
        ))}
        <div
          className="nmStepTrack"
          style={{ '--progress': `${(section / (SECTIONS.length - 1)) * 100}%` }}
        />
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="nmForm">

        {/* ══ SECTION 0: Personal ══ */}
        {section === 0 && (
          <div className="nmSection">
            <div className="nmSectionHeader">
              <span className="nmSectionNum">01</span>
              <div>
                <h2 className="nmSectionTitle">Personal Information</h2>
                <p className="nmSectionSub">Basic identity details of the student</p>
              </div>
            </div>

            <div className="nmRow nmRow3">
              <div className="nmField">
                <label className="nmLabel">First Name <span className="nmReq">*</span></label>
                <input className="nmInput" type="text" name="firstName"
                  value={formData.firstName} onChange={handleChange}
                  placeholder="e.g. Rahul" required />
              </div>
              <div className="nmField">
                <label className="nmLabel">Middle Name</label>
                <input className="nmInput" type="text" name="middleName"
                  value={formData.middleName} onChange={handleChange}
                  placeholder="Optional" />
              </div>
              <div className="nmField">
                <label className="nmLabel">Last Name <span className="nmReq">*</span></label>
                <input className="nmInput" type="text" name="lastName"
                  value={formData.lastName} onChange={handleChange}
                  placeholder="e.g. Singh" required />
              </div>
            </div>

            <div className="nmRow nmRow2">
              <div className="nmField">
                <label className="nmLabel">Gender <span className="nmReq">*</span></label>
                <select className="nmInput nmSelect" name="gender"
                  value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="nmField">
                <label className="nmLabel">Date of Birth <span className="nmReq">*</span></label>
                <input className="nmInput" type="date" name="DOB"
                  value={formData.DOB} onChange={handleChange} required />
              </div>
            </div>

            <div className="nmDivider" />

            <p className="nmSubheading">Permanent Address</p>

            <div className="nmRow nmRow1">
              <div className="nmField">
                <label className="nmLabel">Street / Village / Locality <span className="nmReq">*</span></label>
                <input className="nmInput" type="text" name="address"
                  value={formData.address} onChange={handleChange}
                  placeholder="e.g. Thangmeiband, Imphal" required />
              </div>
            </div>

            <div className="nmRow nmRow3">
              <div className="nmField">
                <label className="nmLabel">District <span className="nmReq">*</span></label>
                <input className="nmInput" type="text" name="district"
                  value={formData.district} onChange={handleChange}
                  placeholder="e.g. Imphal West" required />
              </div>
              <div className="nmField">
                <label className="nmLabel">State <span className="nmReq">*</span></label>
                <input className="nmInput" type="text" name="state"
                  value={formData.state} onChange={handleChange}
                  placeholder="e.g. Manipur" required />
              </div>
              <div className="nmField">
                <label className="nmLabel">PIN Code <span className="nmReq">*</span></label>
                <input className="nmInput" type="text" name="pin"
                  value={formData.pin} onChange={handleChange}
                  placeholder="6-digit PIN" maxLength={6} required />
              </div>
            </div>
          </div>
        )}

        {/* ══ SECTION 1: Academic ══ */}
        {section === 1 && (
          <div className="nmSection">
            <div className="nmSectionHeader">
              <span className="nmSectionNum">02</span>
              <div>
                <h2 className="nmSectionTitle">Academic Information</h2>
                <p className="nmSectionSub">Course, department and admission details</p>
              </div>
            </div>

            <div className="nmRow nmRow3">
              <div className="nmField">
                <label className="nmLabel">Course <span className="nmReq">*</span></label>
                <select className="nmInput nmSelect" name="course"
                  value={formData.course} onChange={handleChange} required>
                  <option value="">Select Course</option>
                  <option value="Base Module">Base Module</option>
                  <option value="BTech">BTech</option>
                  <option value="BSc">BSc</option>
                  <option value="BBA">BBA</option>
                  <option value="MTech">MTech</option>
                  <option value="MBA">MBA</option>
                  <option value="MSc">MSc</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div className="nmField">
                <label className="nmLabel">Department <span className="nmReq">*</span></label>
                <select className="nmInput nmSelect" name="department"
                  value={formData.department} onChange={handleChange} required>
                  <option value="">Select Department</option>
                  <option value="AE">AE — Agricultural Engineering</option>
                  <option value="CE">CE — Civil Engineering</option>
                  <option value="CSE">CSE — Computer Science</option>
                  <option value="ECE">ECE — Electronics & Comm.</option>
                  <option value="EE">EE — Electrical Engineering</option>
                  <option value="ME">ME — Mechanical Engineering</option>
                  <option value="Forestry">Forestry</option>
                  <option value="Physics">Physics</option>
                  <option value="Maths">Mathematics</option>
                  <option value="Management Studies">Management Studies</option>
                </select>
              </div>
              <div className="nmField">
                <label className="nmLabel">Admission Year <span className="nmReq">*</span></label>
                <input className="nmInput" type="text" name="admissionYear"
                  value={formData.admissionYear} onChange={handleChange}
                  placeholder="e.g. 2023" maxLength={4} required />
              </div>
            </div>

            <div className="nmRow" style={{ maxWidth: '280px' }}>
              <div className="nmField">
                <label className="nmLabel">Admitted Through <span className="nmReq">*</span></label>
                <select className="nmInput nmSelect" name="admittedThrough"
                  value={formData.admittedThrough} onChange={handleChange} required>
                  <option value="">Select Entrance</option>
                  <option value="NEE I">NEE I</option>
                  <option value="NEE II">NEE II</option>
                  <option value="NEE III">NEE III</option>
                  <option value="JEE">JEE</option>
                  <option value="QUET">QUET</option>
                  <option value="NEPGET">NEPGET</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ══ SECTION 2: Family & Contact ══ */}
        {section === 2 && (
          <div className="nmSection">
            <div className="nmSectionHeader">
              <span className="nmSectionNum">03</span>
              <div>
                <h2 className="nmSectionTitle">Family & Contact</h2>
                <p className="nmSectionSub">Guardian information and contact details</p>
              </div>
            </div>

            <div className="nmRow nmRow2">
              <div className="nmField">
                <label className="nmLabel">Father's Name <span className="nmReq">*</span></label>
                <input className="nmInput" type="text" name="fatherName"
                  value={formData.fatherName} onChange={handleChange}
                  placeholder="Father's full name" required />
              </div>
              <div className="nmField">
                <label className="nmLabel">Mother's Name <span className="nmReq">*</span></label>
                <input className="nmInput" type="text" name="motherName"
                  value={formData.motherName} onChange={handleChange}
                  placeholder="Mother's full name" required />
              </div>
            </div>

            <div className="nmRow nmRow3">
              <div className="nmField">
                <label className="nmLabel">Student Phone <span className="nmReq">*</span></label>
                <input className="nmInput" type="tel" name="phoneNo"
                  value={formData.phoneNo} onChange={handleChange}
                  placeholder="10-digit mobile" maxLength={10} required />
              </div>
              <div className="nmField">
                <label className="nmLabel">Email <span className="nmReq">*</span></label>
                <input className="nmInput" type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="student@example.com" required />
              </div>
              <div className="nmField">
                <label className="nmLabel">Parent's Phone <span className="nmReq">*</span></label>
                <input className="nmInput" type="tel" name="parentPhoneNo"
                  value={formData.parentPhoneNo} onChange={handleChange}
                  placeholder="Parent mobile" maxLength={10} required />
              </div>
            </div>
          </div>
        )}

        {/* ══ SECTION 3: Documents ══ */}
        {section === 3 && (
          <div className="nmSection">
            <div className="nmSectionHeader">
              <span className="nmSectionNum">04</span>
              <div>
                <h2 className="nmSectionTitle">Documents & Payment</h2>
                <p className="nmSectionSub">Upload passport photo, scan the QR to pay, then upload the screenshot</p>
              </div>
            </div>

            {/* ── Passport Photo ── */}
            <p className="nmSubheading">Passport Photo</p>
            <div style={{ maxWidth: '320px', marginBottom: '28px' }}>
              <UploadBox label="Passport Photo" fieldName="passportPhoto"
                value={files.passportPhoto} onChange={handleFile} />
            </div>

            {/* ── Payment QR ── */}
            <div className="nmDivider" />
            <p className="nmSubheading">Membership Fee Payment</p>
            <p className="nmSectionSub" style={{ marginBottom: '20px' }}>
              Scan the QR code below using any UPI app (GPay, PhonePe, Paytm, etc.) to pay the membership fee+Registration fee (Rs. 500).
              After payment, upload the screenshot as proof.
            </p>

            <div className="nmPaymentPanel">
              {/* QR side */}
              <div className="nmQRSide">
                <div className="nmQRFrame">
                  {/* Replace src with your actual QR image path */}
                  <img
                    src={qr}
                    alt="NEMSU Payment QR Code"
                    className="nmQRImg"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  {/* Fallback placeholder if image is missing */}
                  <div className="nmQRFallback" style={{ display: 'none' }}>
                    <span className="nmQRFallbackIcon">⬛</span>
                    <span className="nmQRFallbackText">QR Code</span>
                    <span className="nmQRFallbackHint">Place QR image at<br/>/assets/nemsu_payment_qr.png</span>
                  </div>
                </div>
                <div className="nmQRMeta">
                  <span className="nmQRName">NEMSU</span>
                  <span className="nmQRUpi">markhemam-3@oksbi</span>
                </div>
              </div>

              {/* Instructions side */}
              <div className="nmQRInfo">
                <div className="nmQRSteps">
                  <div className="nmQRStep">
                    <span className="nmQRStepNum">1</span>
                    <span>Open any UPI app on your phone</span>
                  </div>
                  <div className="nmQRStep">
                    <span className="nmQRStepNum">2</span>
                    <span>Tap <strong>Scan QR</strong> and point at the code</span>
                  </div>
                  <div className="nmQRStep">
                    <span className="nmQRStepNum">3</span>
                    <span>Enter the membership fee amount and complete payment</span>
                  </div>
                  <div className="nmQRStep">
                    <span className="nmQRStepNum">4</span>
                    <span>Take a screenshot of the success screen</span>
                  </div>
                  <div className="nmQRStep">
                    <span className="nmQRStepNum">5</span>
                    <span>Upload the screenshot in the box below</span>
                  </div>
                </div>
                <div className="nmQRNote">
                  ⚠ Do not close this page before uploading the screenshot.
                  Payment without a screenshot will not be accepted.
                </div>
              </div>
            </div>

            {/* ── Payment Screenshot upload ── */}
            <div style={{ maxWidth: '320px', marginTop: '20px' }}>
              <p className="nmSubheading" style={{ marginBottom: '10px' }}>
                Payment Screenshot <span className="nmReq">*</span>
              </p>
              <UploadBox label="Payment Screenshot" fieldName="payment_SS"
                value={files.payment_SS} onChange={handleFile} accent />
            </div>
          </div>
        )}

        {/* ══ SECTION 4: Agreement ══ */}
        {section === 4 && (
          <div className="nmSection">
            <div className="nmSectionHeader">
              <span className="nmSectionNum">05</span>
              <div>
                <h2 className="nmSectionTitle">Declaration & Agreement</h2>
                <p className="nmSectionSub">Read the terms carefully, then sign to confirm</p>
              </div>
            </div>

            {/* Agreement text scroll box */}
            <div className="nmAgreementBox">
              <div className="nmAgreementInner">
                <p className="nmAgreementOrg">NEMSU — NERIST Manipur Students' Union</p>
                <h3 className="nmAgreementHeading">Membership Declaration Form</h3>
                {AGREEMENT_TEXT.trim().split('\n\n').map((para, i) => (
                  <p key={i} className="nmAgreementPara">{para}</p>
                ))}
              </div>
            </div>

            {/* Signatures */}
            <p className="nmSubheading" style={{ marginTop: '28px' }}>
              Signatures <span className="nmReq">*</span>
            </p>
            <p className="nmSectionSub" style={{ marginBottom: '16px' }}>
              Upload clear images of both signatures on white paper
            </p>

            <div className="nmUploadGrid nmUploadGrid2">
              <div className="nmSignWrap">
                <div className="nmSignLabel">
                  <span className="nmSignBadge nmSignBadgeStudent">Student</span>
                  Signature of Applicant
                </div>
                <UploadBox
                  label="Student Signature"
                  fieldName="student_sign"
                  value={files.student_sign}
                  onChange={handleFile}
                  accent
                />
              </div>
              <div className="nmSignWrap">
                <div className="nmSignLabel">
                  <span className="nmSignBadge nmSignBadgeParent">Parent / Guardian</span>
                  Signature of Parent or Guardian
                </div>
                <UploadBox
                  label="Parent / Guardian Signature"
                  fieldName="parent_sign"
                  value={files.parent_sign}
                  onChange={handleFile}
                  accent
                />
              </div>
            </div>

            {/* Agree checkbox */}
            <label className="nmAgreeRow">
              <input
                type="checkbox"
                className="nmCheckbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="nmAgreeText">
                I have read and understood the above declaration. I agree to all the terms
                and conditions of NEMSU membership, <a href='https://www.nemsu.co.in/NEMSUCONS.pdf'>NEMSU constituition</a> and confirm that all information provided
                is accurate and truthful.
              </span>
            </label>

            {error && (
              <div className="nmError">
                <span>⚠</span> {error}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="nmNavRow">
          {section > 0 ? (
            <button type="button" className="nmBtn nmBtnSecondary" onClick={prev}>
              ← Back
            </button>
          ) : (
            <span />
          )}

          {section < SECTIONS.length - 1 ? (
            <button type="button" className="nmBtn nmBtnPrimary" onClick={next}>
              Next →
            </button>
          ) : (
            <button
              type="submit"
              className={`nmBtn nmBtnSubmit ${loading ? 'nmBtnLoading' : ''}`}
              disabled={loading || !agreed}
            >
              {loading ? (
                <><span className="nmSpinner" /> Submitting…</>
              ) : (
                'Submit Registration'
              )}
            </button>
          )}
        </div>

      </form>
    </div>
  )
}

export default NewMember