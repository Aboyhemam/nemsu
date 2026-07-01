import { jsPDF } from "jspdf";

export const generateMemberPDF = async (member, nemsuLogo, neristLogo) => {
  const doc = new jsPDF("p", "mm", "a4");

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 15;

  // Minimal clean palette
  const PRIMARY = [24, 43, 73];       // deep navy
  const SECONDARY = [90, 103, 120];   // muted slate
  const TEXT_DARK = [35, 39, 47];
  const TEXT_MID = [90, 98, 108];
  const LIGHT = [245, 247, 250];
  const BORDER = [220, 225, 232];
  const WHITE = [255, 255, 255];

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

  const issuedDate = formatDate(member.createdAt);

  const drawHeader = (subtitle) => {
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, PAGE_W, 3.5, "F");

    if (nemsuImg) doc.addImage(nemsuImg, "PNG", MARGIN, 10, 21, 21);
    if (neristImg) doc.addImage(neristImg, "PNG", PAGE_W - MARGIN - 21, 10, 21, 21);

    doc.setTextColor(...PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("NERIST MANIPUR STUDENTS' UNION", PAGE_W / 2, 17, {
      align: "center",
    });

    doc.setTextColor(...TEXT_MID);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(
      "North Eastern Regional Institute of Science and Technology",
      PAGE_W / 2,
      23,
      { align: "center" }
    );
    doc.text("Nirjuli,PIN-791109, Arunachal Pradesh", PAGE_W / 2, 28, {
      align: "center",
    });

    doc.setFillColor(...PRIMARY);
    doc.roundedRect(MARGIN, 35, PAGE_W - MARGIN * 2, 8.5, 1.5, 1.5, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(subtitle, PAGE_W / 2, 40.4, { align: "center" });
  };

  const drawFooter = (pageNo, totalPages) => {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);

    doc.setTextColor(...TEXT_MID);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
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

  // =========================
  // PAGE 1
  // =========================
  drawHeader("NEMSU MEMBERSHIP FORM");

  doc.setTextColor(...TEXT_MID);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${issuedDate}`, MARGIN, 50);

  if (member.membershipId) {
    doc.text(`Member ID: ${safe(member.membershipId)}`, PAGE_W - MARGIN, 50, {
      align: "right",
    });
  }

  // Photo area
  const photoW = 34;
  const photoH = 42;
  const photoX = PAGE_W - MARGIN - photoW;
  const photoY = 58;

  // Left column should stop before photo
  const gapToPhoto = 8;
  const contentRight = photoX - gapToPhoto;

  // Photo card
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.roundedRect(photoX - 1.5, photoY - 1.5, photoW + 3, photoH + 3, 1.5, 1.5, "FD");

  if (passportImg) {
    doc.addImage(passportImg, "JPEG", photoX, photoY, photoW, photoH);
  } else {
    doc.setFillColor(...LIGHT);
    doc.roundedRect(photoX, photoY, photoW, photoH, 1, 1, "F");
    doc.setTextColor(...TEXT_MID);
    doc.setFontSize(8);
    doc.text("Passport Photo", photoX + photoW / 2, photoY + photoH / 2, {
      align: "center",
    });
  }

  let y = 60;
  const labelX = MARGIN;
  const valueX = 58;
  const lineGap = 7;

  const sectionTitle = (title, width = PAGE_W - MARGIN * 2) => {
    y += 2;
    doc.setFillColor(...LIGHT);
    doc.roundedRect(MARGIN, y - 4.5, width, 7, 1, 1, "F");
    doc.setTextColor(...PRIMARY);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), MARGIN + 4, y);
    y += lineGap + 1;
  };

  const row = (label, value, opts = {}) => {
    const rightLimit = opts.fullWidth ? PAGE_W - MARGIN : contentRight;
    const maxW = rightLimit - valueX;

    doc.setTextColor(...TEXT_DARK);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text(label, labelX, y);

    doc.setTextColor(...TEXT_MID);
    doc.setFont("helvetica", "normal");
    const text = doc.splitTextToSize(safe(value), maxW);
    doc.text(text, valueX, y);

    y += lineGap * (Array.isArray(text) ? text.length : 1);
  };

  // Personal details only in left column beside photo
  sectionTitle("Personal Details", contentRight - MARGIN);
  row("Full Name", fullName);
  row("Gender", member.gender);
  row("Date of Birth", formatDate(member.DOB));
  row("Address", member.address, { fullWidth: true });
  row("District", member.district, { fullWidth: true });
  row("State", member.state, { fullWidth: true });
  row("PIN", member.pin, { fullWidth: true });

  // Start next section only after the photo area ends
  y = Math.max(y, photoY + photoH + 8);

  sectionTitle("Parents' Details");
  row("Father's Name", member.fatherName);
  row("Mother's Name", member.motherName);


  sectionTitle("Academic Details");
  row("Course", member.course, { fullWidth: true });
  row("Department", member.department, { fullWidth: true });
  row("Admission Year", member.admissionYear, { fullWidth: true });
  row("Admitted Through", member.admittedThrough, { fullWidth: true });

  sectionTitle("Contact Details");
  row("Phone", member.phoneNo, { fullWidth: true });
  row("Parent Phone", member.parentPhoneNo, { fullWidth: true });
  row("Email", member.email, { fullWidth: true });

  y += 8;
  const signY = Math.min(y, PAGE_H - 45);

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);

  if (studentSign) doc.addImage(studentSign, "PNG", MARGIN, signY, 35, 15);
  doc.line(MARGIN, signY + 17, MARGIN + 50, signY + 17);
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Student Signature", MARGIN, signY + 22);

  const px = PAGE_W / 2 + 10;
  if (parentSign) doc.addImage(parentSign, "PNG", px, signY, 35, 15);
  doc.line(px, signY + 17, px + 50, signY + 17);
  doc.text("Parent / Guardian Signature", px, signY + 22);

  drawFooter(1, 2);

  // =========================
  // PAGE 2
  // =========================
  doc.addPage();
  drawHeader("NEMSU MEMBERSHIP DECLARATION");

  doc.setTextColor(...TEXT_MID);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Applicant: ${fullName}`, MARGIN, 50);
  doc.text(`Date: ${issuedDate}`, PAGE_W - MARGIN, 50, { align: "right" });

  const agreementIntro = "I, the undersigned, hereby declare that:";

  const clauses = [
    "All information provided in this registration form is true, correct, and complete to the best of my knowledge. Any false or misleading information may result in cancellation of membership.",
    "I am a bonafide student of NERIST (North Eastern Regional Institute of Science and Technology), Nirjuli, Arunachal Pradesh.",
    "I agree to abide by the rules, regulations, and code of conduct of NEMSU (NERIST Manipur Students' Union) Constitution (https://www.nemsu.co.in/NEMSUCONS.pdf) and shall not engage in any activity that brings disrepute to the organization.",
    "I understand that NEMSU membership is non-transferable and is valid for the duration of my enrollment at NERIST.",
    "I authorize NEMSU to use my information for official communication, record-keeping, and organizational purposes only. My data will not be shared with third parties without my consent.",
    "I acknowledge that the membership fee paid is non-refundable under any circumstances.",
    "I agree that if I am any found involved in violating Institute's rules, the Union will not intervene or provide assistance — no excuses, no exceptions.",
    "I agree to participate actively in the activities of NEMSU and contribute positively to the welfare of Manipuri students at NERIST.",
    "I hereby agree to pay any fines imposed by the Union for acts of indiscipline, with each disciplinary fine not exceeding ₹200. Furthermore, if I choose to leave the Union before completing my studies at NERIST while continuing to reside or study at NERIST, I agree to pay a fine of ₹2,000 for actions deemed detrimental to the unity and integrity of the NEMSU family."
  ];

  let dy = 58;
  doc.setTextColor(...TEXT_DARK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(agreementIntro, MARGIN, dy);
  dy += 8;

  doc.setFontSize(9.5);
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

  dy += 3;
  const closing =
    "I have read and understood the above declaration. I agree to all the terms and conditions of NEMSU membership and confirm that all information provided is accurate and truthful.(NB: Please go through the constitution once)";
  const closingWrapped = doc.splitTextToSize(closing, PAGE_W - MARGIN * 2);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...TEXT_DARK);
  doc.text(closingWrapped, MARGIN, dy);
  dy += closingWrapped.length * 5.2 + 12;

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

  const approvalBoxH = 48;
  const approvalY = PAGE_H - 14 - approvalBoxH - 4;

  doc.setFillColor(...PRIMARY);
  doc.roundedRect(MARGIN, approvalY, PAGE_W - MARGIN * 2, 7, 1.2, 1.2, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("APPROVED BY", PAGE_W / 2, approvalY + 4.9, { align: "center" });

  const colTop = approvalY + 11;
  const colW = (PAGE_W - MARGIN * 2 - 6) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + colW + 6;

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.setFillColor(252, 253, 255);
  doc.roundedRect(leftX, colTop, colW, approvalBoxH - 12, 1.5, 1.5, "FD");
  doc.roundedRect(rightX, colTop, colW, approvalBoxH - 12, 1.5, 1.5, "FD");

  const renderAuthorityBlock = (x, title) => {
    doc.setTextColor(...PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, x + colW / 2, colTop + 6, { align: "center" });

    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(x + 10, colTop + 9, x + colW - 10, colTop + 9);

    doc.setTextColor(...TEXT_DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    const fieldStartY = colTop + 14;
    const fieldGap = 8;
    const labelInnerX = x + 4;
    const lineStartX = x + 28;
    const lineEndX = x + colW - 4;

    ["Name", "Sign with seal", "Date"].forEach((label, idx) => {
      const fy = fieldStartY + idx * fieldGap;
      doc.text(`${label}:`, labelInnerX, fy);
      doc.setDrawColor(...BORDER);
      doc.line(lineStartX, fy + 1, lineEndX, fy + 1);
    });
  };

  renderAuthorityBlock(leftX, "President");
  renderAuthorityBlock(rightX, "General Secretary");

  drawFooter(2, 2);

  const fileName = `${fullName || "NEMSU"}_NEMSU_Membership_Form.pdf`;
  doc.save(fileName);
};