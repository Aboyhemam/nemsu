// src/pages/AdminMembers.jsx

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { generateMemberPDF } from "./../../util/member.js";
import "../../css/member.css"
import nemsuLogo from "../../assets/logo.png";
import neristLogo from "../../assets/nerist_logo .png";

const API_BASE = "https://nemsu-backend.onrender.com";

function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");

const filteredMembers = members.filter((member) =>
  `${member.firstName} ${member.middleName || ""} ${member.lastName}`
    .toLowerCase()
    .includes(search.toLowerCase())
);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/member/all`);
      const data = await res.json();

      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // EXPORT EXCEL
  // ==========================

  const exportExcel = () => {
    const excelData = members.map((m) => ({
      Name: `${m.firstName} ${m.middleName || ""} ${m.lastName}`,
      Gender: m.gender,
      DOB: m.DOB,

      Father: m.fatherName,
      Mother: m.motherName,

      Address: m.address,
      District: m.district,
      State: m.state,
      PIN: m.pin,

      Course: m.course,
      Department: m.department,
      AdmissionYear: m.admissionYear,
      AdmittedThrough: m.admittedThrough,

      Phone: m.phoneNo,
      ParentPhone: m.parentPhoneNo,
      Email: m.email,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "NEMSU Members"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "NEMSU_Members.xlsx");
  };

  // ==========================
  // BLANK FORM
  // ==========================

  const downloadBlankForm = async () => {
    const blankMember = {
      firstName: "_ _ _ _ _ _ _ _",
      middleName: "_ _ _ _ _ _ _ _",
      lastName: "_ _ _ _",
      gender: "_ _ _ _ _",
      DOB: "____/____/__________",

      fatherName: "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _",
      motherName: "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _" ,

      address: "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _",
      district: "_ _ _ _ _ _ _ _",
      state: "_ _ _ _ _ _ _ _",
      pin: "_ _ _ _ _ _ _ _",

      course: "_ _ _ _ _ _ _ _",
      department: "_ _ _ _ _ _ _ _",
      admissionYear: "_ _ _ _ _ _ _ _",
      admittedThrough: "_ _ _ _ _ _ _ _",

      phoneNo: "_ _ _ _ _ _ _ _ _ _ _ _",
      parentPhoneNo: "_ _ _ _ _ _ _ _ _ _ _ _ _",
      email: "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _",

      passportPhoto_fileId:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNQRY4_svfrclxUrnJFNVHf7GjhZVAlrFGyw&s",

      student_sign_fileId:
        "https://ik.imagekit.io/ef0fjxapr/image.png",

      parent_sign_fileId:
        "https://ik.imagekit.io/ef0fjxapr/image.png",
    };

    await generateMemberPDF(
      blankMember,
      nemsuLogo,
      neristLogo
    );
  };

  if (loading) {
    return <h2>Loading Members...</h2>;
  }

  return (
    <div className="membersPage">
      <div className="membersTop">

  <div className="membersTitleBox">
    <h1>NEMSU Members Directory</h1>
    <p>Manage registered members and generate documents</p>
  </div>

  <div className="membersStats">
    <div className="statCard">
      <h2>{members.length}</h2>
      <span>Total Members</span>
    </div>
  </div>

</div>

<div className="membersToolbar">

  <input
    type="text"
    placeholder="Search member..."
    className="searchInput"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <div className="membersActions">
    <button onClick={exportExcel} className="excelBtn">
      Export Excel
    </button>

    <button onClick={downloadBlankForm} className="blankBtn">
      Download Blank Form
    </button>
  </div>

</div>

      <table className="membersTable">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Course</th>
            <th>Department</th>
            <th>Phone</th>
            <th>Email</th>
            <th>PDF</th>
          </tr>
        </thead>

        <tbody>
            {filteredMembers.map((member) => (
            <tr key={member._id}>
              <td>
                <img
                  src={member.passportPhoto_fileId}
                  alt=""
                  width="50"
                />
              </td>

              <td>
                {member.firstName}{" "}
                {member.middleName}{" "}
                {member.lastName}
              </td>

              <td>{member.course}</td>

              <td>{member.department}</td>

              <td>{member.phoneNo}</td>

              <td>{member.email}</td>

              <td>
                <button
                  onClick={() =>
                    generateMemberPDF(
                      member,
                      nemsuLogo,
                      neristLogo
                    )
                  }
                >
                  Generate PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminMembers;