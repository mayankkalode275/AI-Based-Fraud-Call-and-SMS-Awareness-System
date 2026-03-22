import React, { useState } from "react";
import axios from "axios";

const CallDetector: React.FC = () => {

  const [result, setResult] = useState("");
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [voiceType, setVoiceType] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    setStatus("📁 Uploading & Processing...");
    setLoading(true);

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await axios.post(
        "http://localhost:5001/predict_call",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(res.data.prediction || "");
      setTranscript(res.data.transcript || "");
      setConfidence(res.data.confidence || 0);
      setVoiceType(res.data.voice_type || "");
      setStatus("✅ Detection Complete");

    } catch (err) {
      console.error(err);
      setStatus("❌ Error processing file");
    } finally {
      setLoading(false);
    }
  };

  const percentage = Math.round(confidence);
  const isScam = result.includes("SCAM");

  return (
    <div style={styles.container}>

      {/* Upload Button */}
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
          {loading ? "Processing..." : "Ready for Detection"}
        </button>

        <button
          style={styles.btnPurple}
          onClick={() => {
            setResult("");
            setTranscript("");
            setConfidence(0);
            setVoiceType("");
            setStatus("");
          }}
        >
          Clear
        </button>
      </div>

      {/* Status */}
      <div style={styles.status}>
        {status || "Upload a call recording to analyze"}
      </div>

      {/* Transcript */}
      <div style={styles.card}>
        <b>📝 Transcript:</b>
        <div style={{ marginTop: 6 }}>
          {transcript || "No transcript yet"}
        </div>
      </div>

      {/* Voice Type */}
      <div style={styles.card}>
        <b>🎤 Voice Type:</b>{" "}
        {voiceType || "Not analyzed"}
      </div>

      {/* Result */}
      <div style={styles.resultBox}>

        <div style={{
          fontSize: 22,
          fontWeight: "bold",
          color: result
            ? (isScam ? "#ff3c82" : "#00ffb4")
            : "#aaa"
        }}>
          {result || "No result yet"}
        </div>

        <div style={{
          marginTop: 8,
          fontSize: 16,
          color: "#aaa"
        }}>
          {result
            ? `${percentage}% confidence`
            : "Confidence will appear here"}
        </div>

        {/* Progress Bar */}
        <div style={styles.bar}>
          <div
            style={{
              ...styles.fill,
              width: `${percentage}%`
            }}
          />
        </div>

      </div>

    </div>
  );
};

const styles: any = {

  container: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 14
  },

  row: {
    display: "flex",
    gap: 12
  },

  btnGreen: {
    border: "1px solid rgba(0,255,180,0.35)",
    borderRadius: 14,
    padding: "10px 16px",
    fontWeight: 900,
    color: "rgba(0,255,180,0.95)",
    background: "rgba(0,255,180,0.08)",
    cursor: "pointer"
  },

  btnPurple: {
    border: "1px solid rgba(167,139,250,0.35)",
    borderRadius: 14,
    padding: "10px 16px",
    fontWeight: 900,
    color: "rgba(167,139,250,0.95)",
    background: "rgba(167,139,250,0.08)",
    cursor: "pointer"
  },

  status: {
    fontWeight: 700,
    color: "#00ffb4",
    minHeight: 20
  },

  card: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.2)"
  },

  resultBox: {
    marginTop: 10
  },

  bar: {
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.1)",
    marginTop: 10,
    overflow: "hidden"
  },

  fill: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg,#00ffb4,#a78bfa,#ff3c82)"
  }

};

export default CallDetector;