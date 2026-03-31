import React, { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const CallDetector: React.FC = () => {

  const [result, setResult] = useState("");
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // 🔥 NEW AUDIO STATES
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // 🔥 AUDIO SETUP
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    const newAudio = new Audio(url);

    newAudio.onloadedmetadata = () => {
      setDuration(newAudio.duration);
    };

    newAudio.ontimeupdate = () => {
      setCurrentTime(newAudio.currentTime);
    };

    setAudio(newAudio);

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
      setWaveform(res.data.waveform || []);
      setKeywords(res.data.keywords || []);
      setStatus("✅ Detection Complete");

    } catch (err) {
      console.error(err);
      setStatus("❌ Error processing file");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 PLAY / PAUSE
  const togglePlay = () => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  // 🔥 SEEK BAR
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    const newTime = (clickX / width) * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const percentage = Math.round(confidence);
  const isScam = result.includes("SCAM");

  return (
    <div style={styles.container}>

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

      {/* 🔥 AUDIO PLAYER */}
      {audioUrl && (
        <div style={styles.card}>
          <b>🎧 Audio Player</b>

          <button style={styles.btnGreen} onClick={togglePlay}>
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          <div style={{ marginTop: 8 }}>
            {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </div>

          <div style={styles.progressBar} onClick={handleSeek}>
            <div
              style={{
                ...styles.progressFill,
                width: `${(currentTime / duration) * 100 || 0}%`
              }}
            />
          </div>
        </div>
      )}

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
            setWaveform([]);
            setKeywords([]);
            setAudioUrl(null);
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
          {transcript
            ? transcript.split(" ").map((word, index) => {
                const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
                const isRisky = keywords.includes(cleanWord);

                return (
                  <span
                    key={index}
                    style={{
                      color: isRisky ? "#ff3c82" : "white",
                      fontWeight: isRisky ? "bold" : "normal",
                      marginRight: 5
                    }}
                  >
                    {word}
                  </span>
                );
              })
            : "No transcript yet"}
        </div>
      </div>

      {/* Keywords */}
      {keywords.length > 0 && (
        <div style={styles.card}>
          <b>⚠️ Risk Keywords Detected:</b>
          <div style={{ marginTop: 6 }}>
            {keywords.map((k, i) => (
              <span key={i} style={{ color: "#ff3c82", marginRight: 10, fontWeight: "bold" }}>
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Waveform */}
      {waveform.length > 0 && (
        <div style={styles.card}>
          <b>📊 Audio Waveform Analysis</b>

          <Line
            data={{
              labels: waveform.map((_, i) => i),
              datasets: [
                {
                  data: waveform,
                  borderColor: "#00ffb4",
                  borderWidth: 1,
                  pointRadius: 0
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { display: false },
                y: { display: false }
              }
            }}
          />
        </div>
      )}

      {/* Result */}
      <div style={styles.resultBox}>
        <div style={{
          fontSize: 22,
          fontWeight: "bold",
          color: result ? (isScam ? "#ff3c82" : "#00ffb4") : "#aaa"
        }}>
          {result || "No result yet"}
        </div>

        <div style={{ marginTop: 8, fontSize: 16, color: "#aaa" }}>
          {result ? `${percentage}% confidence` : "Confidence will appear here"}
        </div>

        <div style={styles.bar}>
          <div style={{ ...styles.fill, width: `${percentage}%` }} />
        </div>
      </div>

    </div>
  );
};

const styles: any = {
  container: { padding: 20, display: "flex", flexDirection: "column", gap: 14 },
  row: { display: "flex", gap: 12 },

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

  status: { fontWeight: 700, color: "#00ffb4", minHeight: 20 },

  card: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.2)"
  },

  resultBox: { marginTop: 10 },

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
    background: "linear-gradient(90deg,#00ffb4,#a78bfa,#ff3c82)"
  },

  progressBar: {
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.1)",
    marginTop: 10,
    cursor: "pointer"
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg,#00ffb4,#a78bfa,#ff3c82)"
  }
};

export default CallDetector;