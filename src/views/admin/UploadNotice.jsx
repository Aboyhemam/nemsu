import React, { useState } from "react";
import "../../css/notice.css";

const API_BASE = "https://nemsu-backend.onrender.com";

function UploadNotice() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !file) {
      setMessage("Please provide both title and file.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/admin/uploadNotice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setMessage("Notice uploaded successfully!");
      setTitle("");
      setFile(null);

      document.getElementById("noticeFile").value = "";
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploadNoticePage">
      <div className="uploadNoticeContainer">
        <div className="uploadNoticeHeader">
          <h1 className="uploadNoticeTitle">Upload Notice</h1>
          <p className="uploadNoticeSub">
            Upload official notices and announcements for students.
          </p>
        </div>

        <form className="uploadNoticeForm" onSubmit={handleSubmit}>
          <div className="uploadField">
            <label className="uploadLabel">Notice Title</label>

            <input
              type="text"
              className="uploadInput"
              placeholder="Enter notice title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="uploadField">
            <label className="uploadLabel">Upload File</label>

            <label className="uploadFileBox">
              <input
                id="noticeFile"
                type="file"
                className="uploadFileInput"
                onChange={(e) => setFile(e.target.files[0])}
              />

              <span className="uploadFileText">
                {file ? file.name : "Choose PDF / Image / Document"}
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="uploadButton"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Notice"}
          </button>

          {message && (
            <div
              className={`uploadMessage ${
                message.includes("success")
                  ? "uploadSuccess"
                  : "uploadError"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default UploadNotice;