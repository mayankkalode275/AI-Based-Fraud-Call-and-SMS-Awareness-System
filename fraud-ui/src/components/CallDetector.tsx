import React, { useState } from "react";
import axios from "axios";

const CallDetector: React.FC = () => {

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      setFile(selectedFile);
      setResult("");
      setTranscript("");
      setStatus("📁 File selected... Processing started");

      uploadCallAuto(selectedFile);
    }
  };

  const uploadCallAuto = async (selectedFile: File) => {
    const formData = new FormData();
    formData.append("audio", selectedFile);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5001/predict_call",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      setStatus("✅ File processed successfully!");
      setResult(response.data.prediction);
      setTranscript(response.data.transcript);
      setConfidence(response.data.confidence);

    } catch {
      setStatus("❌ Error processing file");
    } finally {
      setLoading(false);
    }
  };

  const percentage = Math.round(confidence * 100);
  const isScam = result.includes("SCAM");

  return (
    <div>

      {/* Upload */}
      <label style={styles.btnGreen}>
        Upload Call Recording
        <input
          type="file"
          accept="audio/*"
          hidden
          onChange={handleFileChange}
        />
      </label>

      {/* Buttons */}
      <div style={styles.row}>
        <button style={styles.btnGreen}>
          {loading ? "Processing..." : "Auto Detect Enabled"}
        </button>

        <button style={styles.btnPurple} onClick={() => {
          setFile(null);
          setResult("");
          setTranscript("");
          setConfidence(0);
          setStatus("");
        }}>
          Clear
        </button>
      </div>

      {/* Status */}
      {status && (
        <div style={styles.status}>{status}</div>
      )}

      {/* Transcript */}
      {transcript && (
        <div style={styles.text}>
          <b>Caller said:</b> {transcript}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={styles.resultBox}>

          <div style={{
            fontSize: 20,
            fontWeight: "bold",
            color: isScam ? "#ff3c82" : "#00ffb4"
          }}>
            {result}
          </div>

          <div style={{
            marginTop: 8,
            fontSize: 16,
            color: isScam ? "#ff3c82" : "#00ffb4"
          }}>
            {percentage}% confidence
          </div>

          {/* Progress Bar */}
          <div style={styles.bar}>
            <div style={{
              ...styles.fill,
              width: `${percentage}%`
            }} />
          </div>

        </div>
      )}

    </div>
  );
};

const styles = {

  row: {
    display: "flex",
    gap: 12,
    marginTop: 15
  },

  btnGreen: {
    border: "1px solid rgba(0,255,180,0.35)",
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 900,
    color: "rgba(0,255,180,0.95)",
    background: "rgba(0,255,180,0.08)",
    cursor: "pointer"
  },

  btnPurple: {
    border: "1px solid rgba(167,139,250,0.35)",
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 900,
    color: "rgba(167,139,250,0.95)",
    background: "rgba(167,139,250,0.08)",
    cursor: "pointer"
  },

  status: {
    marginTop: 12,
    fontWeight: 700,
    color: "#00ffb4"
  },

  text: {
    marginTop: 12,
    color: "rgba(255,255,255,0.8)"
  },

  resultBox: {
    marginTop: 20
  },

  bar: {
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.1)",
    marginTop: 10
  },

  fill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg,#00ffb4,#a78bfa,#ff3c82)"
  }

};

export default CallDetector;