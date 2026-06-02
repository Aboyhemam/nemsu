import { jsPDF } from "jspdf";

export const generateMemberPDF = async (member, nemsuLogo, neristLogo) => {
  const doc = new jsPDF("p", "mm", "a4");

  // ---------------------------------------------
  // Constants & Theme (refined professional palette)
  // ---------------------------------------------
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 15;

  // Refined professional color palette
  const PRIMARY = [15, 42, 90];     // rich deep navy (more premium)
  const SECONDARY = [30, 75, 140];  // softer navy for accents
  const ACCENT = [184, 134, 11];    // elegant gold (replaces crimson for premium feel)
  const TEXT_DARK = [33, 37, 41];   // near-black for body text
  const GREY = [108, 117, 125];     // refined neutral grey
  const LIGHT = [240, 244, 250];    // very subtle blue-tinted background
  const BORDER = [210, 218, 230];   // soft border colour

  // ---------------------------------------------
  // Helpers
  // ---------------------------------------------
  const loadImage = (src) =>
    new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const formatDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const safe = (v) => (v === null || v === undefined ? "" : String(v));

  // ---------------------------------------------
  // Load all images safely
  // ---------------------------------------------
  const [nemsuImg, neristImg, passportImg, studentSign, parentSign] =
    await Promise.all([
      loadImage(nemsuLogo),
      loadImage(neristLogo),
      loadImage(member.passportPhoto_fileId),
      loadImage(member.student_sign_fileId),
      loadImage(member.parent_sign_fileId),
    ]);

  const fullName = [member.firstName, member.middleName, member.lastName]
    .filter(Boolean)
    .join(" ");

  const issuedDate = formatDate(member.created_At || member.createdAt);

  // ---------------------------------------------
  // Reusable header / footer
  // ---------------------------------------------
  const drawHeader = (subtitle) => {
    // Top accent bar (navy with thin gold underline)
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, PAGE_W, 4, "F");
    doc.setFillColor(...ACCENT);
    doc.rect(0, 4, PAGE_W, 0.8, "F");

    if (nemsuImg) doc.addImage(nemsuImg, "PNG", MARGIN, 10, 22, 22);
    if (neristImg) doc.addImage(neristImg, "PNG", PAGE_W - MARGIN - 22, 10, 22, 22);

    doc.setTextColor(...PRIMARY);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("NERIST MANIPUR STUDENTS' UNION", PAGE_W / 2, 17, {
      align: "center",
    });

    doc.setTextColor(...GREY);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      "North Eastern Regional Institute of Science and Technology",
      PAGE_W / 2,
      23,
      { align: "center" }
    );
    doc.text("Nirjuli, Arunachal Pradesh", PAGE_W / 2, 28, {
      align: "center",
    });

    // Sub-title banner (primary with gold side accent)
    doc.setFillColor(...PRIMARY);
    doc.roundedRect(MARGIN, 34, PAGE_W - MARGIN * 2, 9, 1.5, 1.5, "F");
    doc.setFillColor(...ACCENT);
    doc.rect(MARGIN, 34, 2, 9, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(subtitle, PAGE_W / 2, 40.3, { align: "center" });
  };

  const drawFooter = (pageNo, totalPages) => {
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);

    doc.setTextColor(...GREY);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text("NEMSU — Official Membership Document", MARGIN, PAGE_H - 9);
    if (issuedDate) {
      doc.text(`Issued: ${issuedDate}`, PAGE_W / 2, PAGE_H - 9, {
        align: "center",
      });
    }
    doc.text(`Page ${pageNo} of ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 9, {
      align: "right",
    });
  };

  // =============================================
  // PAGE 1 — MEMBERSHIP FORM
  // =============================================
  drawHeader("NEMSU MEMBERSHIP FORM");

  // Meta strip: issue date
  doc.setTextColor(...GREY);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${issuedDate}`, MARGIN, 50);
  if (member.membershipId) {
    doc.text(`Member ID: ${safe(member.membershipId)}`, PAGE_W - MARGIN, 50, {
      align: "right",
    });
  }

  // Passport photo frame
  const photoX = PAGE_W - MARGIN - 35;
  const photoY = 55;
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.5);
  doc.rect(photoX, photoY, 35, 45);
  if (passportImg) {
    doc.addImage(passportImg, "JPEG", photoX + 1, photoY + 1, 33, 43);
  } else {
    doc.setTextColor(...GREY);
    doc.setFontSize(8);
    doc.text("Photo", photoX + 17.5, photoY + 24, { align: "center" });
  }

  // Section helper
  let y = 58;
  const labelX = MARGIN;
  const valueX = 58;
  const lineGap = 7.2;

  const sectionTitle = (title) => {
    y += 2;
    doc.setFillColor(...LIGHT);
    doc.rect(MARGIN, y - 4.5, PAGE_W - MARGIN * 2, 7, "F");
    // gold side accent on section header
    doc.setFillColor(...ACCENT);
    doc.rect(MARGIN, y - 4.5, 1.5, 7, "F");
    doc.setTextColor(...PRIMARY);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), MARGIN + 4, y);
    y += lineGap + 1;
  };

  const row = (label, value, opts = {}) => {
    doc.setTextColor(...TEXT_DARK);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}`, labelX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const maxW = (opts.fullWidth ? PAGE_W - MARGIN : photoX - 4) - valueX;
    const text = doc.splitTextToSize(safe(value), maxW);
    doc.text(text, valueX, y);
    y += lineGap * (Array.isArray(text) ? text.length : 1);
  };

  // --- Personal Details ---
  sectionTitle("Personal Details");
  row("Full Name", fullName);
  row("Father's Name", member.fatherName);
  row("Mother's Name", member.motherName);
  row("Gender", member.gender);
  row("Date of Birth", formatDate(member.DOB));

  // --- Address (full width, below photo) ---
  y = Math.max(y, photoY + 47);
  sectionTitle("Address Details");
  row("Address", member.address, { fullWidth: true });
  row("District", member.district);
  row("State", member.state);
  row("PIN", member.pin);

  // --- Academic Details ---
  sectionTitle("Academic Details");
  row("Course", member.course);
  row("Department", member.department);
  row("Admission Year", member.admissionYear);
  row("Admitted Through", member.admittedThrough);

  // --- Contact Details ---
  sectionTitle("Contact Details");
  row("Phone", member.phoneNo);
  row("Parent Phone", member.parentPhoneNo);
  row("Email", member.email);

  // --- Signatures ---
  y += 6;
  const signY = Math.min(y, PAGE_H - 45);

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);

  // Student
  if (studentSign) doc.addImage(studentSign, "PNG", MARGIN, signY, 35, 15);
  doc.line(MARGIN, signY + 17, MARGIN + 50, signY + 17);
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Student Signature", MARGIN, signY + 22);

  // Parent
  const px = PAGE_W / 2 + 10;
  if (parentSign) doc.addImage(parentSign, "PNG", px, signY, 35, 15);
  doc.line(px, signY + 17, px + 50, signY + 17);
  doc.text("Parent / Guardian Signature", px, signY + 22);

  drawFooter(1, 2);

  // =============================================
  // PAGE 2 — DECLARATION FORM
  // =============================================
  doc.addPage();
  drawHeader("NEMSU MEMBERSHIP DECLARATION");

  doc.setTextColor(...GREY);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Applicant: ${fullName}`, MARGIN, 50);
  doc.text(`Date: ${issuedDate}`, PAGE_W - MARGIN, 50, { align: "right" });

  const agreementIntro = "I, the undersigned, hereby declare that:";

  const clauses = [
    "All information provided in this registration form is true, correct, and complete to the best of my knowledge. Any false or misleading information may result in cancellation of membership.",
    "I am a bonafide student of NERIST (North Eastern Regional Institute of Science and Technology), Nirjuli, Arunachal Pradesh, and I belong to the state of Manipur.",
    "I agree to abide by the rules, regulations, and code of conduct of NEMSU (NERIST Manipur Students' Union) and shall not engage in any activity that brings disrepute to the organization.",
    "I understand that NEMSU membership is non-transferable and is valid for the duration of my enrollment at NERIST.",
    "I authorize NEMSU to use my information for official communication, record-keeping, and organizational purposes only. My data will not be shared with third parties without my consent.",
    "I acknowledge that the membership fee paid is non-refundable under any circumstances.",
    "I agree to participate actively in the activities of NEMSU and contribute positively to the welfare of Manipuri students at NERIST.",
  ];

  let dy = 58;
  doc.setTextColor(...TEXT_DARK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(agreementIntro, MARGIN, dy);
  dy += 8;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  clauses.forEach((clause, i) => {
    const num = `${i + 1}.`;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PRIMARY);
    doc.text(num, MARGIN, dy);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_DARK);
    const wrapped = doc.splitTextToSize(clause, PAGE_W - MARGIN * 2 - 8);
    doc.text(wrapped, MARGIN + 8, dy);
    dy += wrapped.length * 5.2 + 3;
  });

  // Closing statement
  dy += 2;
  const closing =
    "I have read and understood the above declaration. I agree to all the terms and conditions of NEMSU membership and confirm that all information provided is accurate and truthful.";
  const closingWrapped = doc.splitTextToSize(closing, PAGE_W - MARGIN * 2);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...TEXT_DARK);
  doc.text(closingWrapped, MARGIN, dy);
  dy += closingWrapped.length * 5.2 + 12;

  // Applicant / Parent signatures (page 2)
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);

  if (studentSign) doc.addImage(studentSign, "PNG", MARGIN, dy, 40, 18);
  doc.line(MARGIN, dy + 20, MARGIN + 55, dy + 20);
  doc.setTextColor(...PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Applicant Signature", MARGIN, dy + 25);

  const p2x = PAGE_W / 2 + 10;
  if (parentSign) doc.addImage(parentSign, "PNG", p2x, dy, 40, 18);
  doc.line(p2x, dy + 20, p2x + 55, dy + 20);
  doc.text("Parent / Guardian Signature", p2x, dy + 25);

  // =============================================
  // APPROVED BY — President & General Secretary
  // Pinned near the bottom of the last page
  // =============================================
  const approvalBoxH = 48;
  const approvalY = PAGE_H - 14 - approvalBoxH - 4; // sits just above footer

  // "Approved by:" heading bar
  doc.setFillColor(...PRIMARY);
  doc.roundedRect(MARGIN, approvalY, PAGE_W - MARGIN * 2, 7, 1.2, 1.2, "F");
  doc.setFillColor(...ACCENT);
  doc.rect(MARGIN, approvalY, 2, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("APPROVED BY", PAGE_W / 2, approvalY + 4.9, { align: "center" });

  // Two columns
  const colTop = approvalY + 11;
  const colW = (PAGE_W - MARGIN * 2 - 6) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + colW + 6;

  // Subtle bordered boxes for each authority
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.setFillColor(250, 251, 253);
  doc.roundedRect(leftX, colTop, colW, approvalBoxH - 12, 1.5, 1.5, "FD");
  doc.roundedRect(rightX, colTop, colW, approvalBoxH - 12, 1.5, 1.5, "FD");

  const renderAuthorityBlock = (x, title) => {
    // Title
    doc.setTextColor(...PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, x + colW / 2, colTop + 6, { align: "center" });

    // thin gold divider under title
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.4);
    doc.line(x + colW / 2 - 18, colTop + 8, x + colW / 2 + 18, colTop + 8);

    // Fields
    doc.setTextColor(...TEXT_DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    const fieldStartY = colTop + 14;
    const fieldGap = 8;
    const labelInnerX = x + 4;
    const lineStartX = x + 28;
    const lineEndX = x + colW - 4;

    const fields = ["Name", "Sign with seal", "Date"];
    fields.forEach((label, idx) => {
      const fy = fieldStartY + idx * fieldGap;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...TEXT_DARK);
      doc.text(`${label}:`, labelInnerX, fy);

      // underline for value
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.25);
      doc.line(lineStartX, fy + 1, lineEndX, fy + 1);
    });
  };

  renderAuthorityBlock(leftX, "President");
  renderAuthorityBlock(rightX, "General Secretary");

  drawFooter(2, 2);

  // =============================================
  // SAVE
  // =============================================
  const fileName = `${fullName || "NEMSU"}_NEMSU_Membership_Form.pdf`;
  doc.save(fileName);
};