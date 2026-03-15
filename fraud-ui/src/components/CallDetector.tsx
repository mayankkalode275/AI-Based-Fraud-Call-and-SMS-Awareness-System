import React, { useState } from "react";
import axios from "axios";

const CallDetector: React.FC = () => {

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(""); // reset previous result
    }
  };

  const uploadCall = async () => {

    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    try {

      setLoading(true);

      const response = await axios.post(
       "http://localhost:5001/predict_call",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("Backend Response:", response.data);

      if (response.data && response.data.prediction) {
        setResult(response.data.prediction);
      } else {
        setResult("No prediction received from backend");
      }

    } catch (error) {

      console.error("API Error:", error);
      setResult("Error connecting to backend");

    } finally {
      setLoading(false);
    }
  };

return (
<div style={{ padding: "10px 10px 20px 10px" }}>
   <h2 style={{ marginBottom: 25, marginTop: 10 }}>
  AI Scam Call Detector
</h2>

    {/* Upload Button */}
<label style={{ ...styles.btnGreen, marginBottom: 20 }}>      Upload Call Recording
      <input
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </label>

    <div style={styles.row}>

      <button
        style={styles.btnGreen}
        onClick={uploadCall}
        disabled={loading}
      >
        {loading ? "Processing..." : "Detect Call"}
      </button>

      <button
        style={styles.btnPurple}
        onClick={() => {
          setFile(null);
          setResult("");
        }}
      >
        Clear
      </button>

    </div>

    {result && (
      <div style={styles.resultBox}>
        Prediction:
        <span style={styles.resultText}>
          {result}
        </span>
      </div>
    )}

  </div>
);
};
const styles = {

  row: {
  display: "flex",
  gap: 14,
  marginTop: 20,
  marginBottom: 20
},

  btnGreen: {
    border: "1px solid rgba(0,255,180,0.35)",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 900,
    color: "rgba(0,255,180,0.95)",
    background: "rgba(0,255,180,0.08)",
    cursor: "pointer"
  },

  btnPurple: {
    border: "1px solid rgba(167,139,250,0.35)",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 900,
    color: "rgba(167,139,250,0.95)",
    background: "rgba(167,139,250,0.08)",
    cursor: "pointer"
  },

resultBox: {
  marginTop: 30,
  fontSize: 18,
  fontWeight: 700
},

  resultText: {
    marginLeft: 10,
    color: "#ff3c82"
  }

};
export default CallDetector;