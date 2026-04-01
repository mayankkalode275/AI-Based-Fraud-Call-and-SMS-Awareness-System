import React, { useEffect, useMemo, useState } from "react";
import CallDetector from "./components/CallDetector";

type PredictResponse = {
  prediction: string;
  confidence: number;
  risky_words: string[];
};

type HistoryItem = {
  time: string;
  message: string;
  prediction: string;
  confidence: number;
  risky_words: string[];
};

const API = "http://127.0.0.1:5000";

type Screen = "home" | "choose" | "sms" | "call";

export default function App() {
  // Flow screens
  const [screen, setScreen] = useState<Screen>("home");

  // detector state
  const [sms, setSms] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PredictResponse | null>(null);
  const [error, setError] = useState("");

  // history persist
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem("fraud_history");
      return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("fraud_history", JSON.stringify(history));
  }, [history]);

  // ========================= NEW HELPER FUNCTIONS =========================

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSms(transcript);
    };
  };

  const detectLanguage = (text: string) => {
    const hindiRegex = /[\u0900-\u097F]/;
    if (hindiRegex.test(text)) return "Hindi";
    return "English";
  };

  const getSuggestions = () => {
    if (!data) return [];
    if (data.prediction.toUpperCase().includes("FRAUD")) {
      return [
        "Do NOT click on any links in this message",
        "Do NOT share OTP, password, or bank details",
        "Verify the sender by contacting official sources",
        "Report this message to your bank or cybercrime portal",
      ];
    } else {
      return [
        "Message appears safe, but stay cautious",
        "Avoid sharing sensitive information",
        "Double-check unknown links before clicking",
      ];
    }
  };

  // ========================= EXISTING HELPERS =========================

  const detectScamType = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes("bank") || t.includes("account")) return "Banking Scam";
    if (t.includes("otp") || t.includes("verify")) return "OTP Scam";
    if (t.includes("lottery") || t.includes("win")) return "Lottery Scam";
    if (t.includes("link") || t.includes("http")) return "Phishing Scam";
    return "General Suspicion";
  };

  const extractLinks = (text: string) => {
    const regex = /(https?:\/\/[^\s]+)/g;
    return text.match(regex) || [];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const isFraud = useMemo(
    () => data?.prediction?.toUpperCase().includes("FRAUD") ?? false,
    [data]
  );

  const confidenceWidth = Math.max(0, Math.min(100, data?.confidence ?? 0));

  const riskLevel =
    (data?.confidence ?? 0) > 75
      ? "HIGH RISK"
      : (data?.confidence ?? 0) > 50
      ? "MEDIUM RISK"
      : "LOW RISK";

  const riskColor =
    riskLevel === "HIGH RISK"
      ? "rgba(255,60,130,0.95)"
      : riskLevel === "MEDIUM RISK"
      ? "rgba(167,139,250,0.95)"
      : "rgba(0,255,180,0.95)";

  const checkSMS = async () => {
    if (!sms.trim()) return;
    setError("");
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: sms }),
      });

      if (!res.ok) throw new Error("Backend error. Is Flask running?");

      const json = (await res.json()) as PredictResponse;
      setData(json);

      const item: HistoryItem = {
        time: new Date().toLocaleString(),
        message: sms,
        prediction: json.prediction,
        confidence: json.confidence,
        risky_words: json.risky_words,
      };

      setHistory((prev) => [item, ...prev].slice(0, 25));
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSms("");
    setData(null);
    setError("");
  };

  const downloadReport = () => {
    const lines: string[] = [
      "AI Fraud SMS Detector - Report",
      `Generated: ${new Date().toLocaleString()}`,
      "--------------------------------------------------",
      `Total checks in history: ${history.length}`,
      ""
    ];

    history.forEach((h, idx) => {
      lines.push(`#${idx + 1}  Time: ${h.time}`);
      lines.push(`Message: ${h.message}`);
      lines.push(`Prediction: ${h.prediction}`);
      lines.push(`Confidence: ${h.confidence}%`);
      lines.push(`Risky Words: ${h.risky_words.join(", ") || "None"}`);
      lines.push("--------------------------------------------------");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fraud_sms_report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const Chip = ({ text }: { text: string }) => (
    <span style={styles.chip}>{text}</span>
  );

  // ========================= RENDERING =========================

  if (screen === "home") {
    return (
      <div style={styles.page}>
        <div style={styles.gridDots} /><div style={styles.glowGreen} /><div style={styles.glowPurple} /><div style={styles.blurLayer} />
        <div style={styles.centerWrap}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>🛡️</div>
            <h2 style={styles.modalTitle}>Welcome to AI Fraud Detector</h2>
            <p style={styles.modalText}>
              Detect suspicious <b>Fraud Scams</b> using Machine Learning, confidence scores,
              risky keywords, and real-time call analytics.
            </p>
            <button style={styles.btnGreen} onClick={() => setScreen("choose")}>Start Protection →</button>
            <div style={styles.modalFoot}>Tip: Keep Flask backend running on <b>127.0.0.1:5000</b></div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "choose") {
    return (
      <div style={styles.page}>
        <div style={styles.gridDots} /><div style={styles.glowGreen} /><div style={styles.glowPurple} /><div style={styles.blurLayer} />
        <div style={styles.centerWrap}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Choose Detection Mode</h2>
            <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
              <button style={styles.modeCard} onClick={() => setScreen("call")}>
                <div style={styles.modeTop}>
                  <span style={styles.modeIcon}>📞</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.modeTitle}>Fraud Call Detector</div>
                    <div style={styles.modeSub}>Real-time voice-to-text analysis</div>
                  </div>
                </div>
              </button>
              <button style={styles.modeCard} onClick={() => setScreen("sms")}>
                <div style={styles.modeTop}>
                  <span style={styles.modeIcon}>💬</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.modeTitle}>Fraud SMS Detector</div>
                    <div style={styles.modeSub}>Analyze text messages for phishing</div>
                  </div>
                </div>
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              <button style={styles.btnPurple} onClick={() => setScreen("home")}>← Back to Home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "call") {
    return (
      <div style={styles.page}>
        <div style={styles.gridDots} /><div style={styles.glowGreen} /><div style={styles.glowPurple} />
        <div style={styles.shell}>
          <header style={styles.header}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={styles.logo}>📞</div>
              <h1 style={styles.title}>AI Fraud Call Detector</h1>
            </div>
            <button style={styles.btnOutlineGreen} onClick={() => setScreen("choose")}>← Switch Mode</button>
          </header>
          <div style={styles.twoCol}>
            <div style={styles.card}><CallDetector /></div>
            <div style={styles.card}>
              <h3 style={styles.h3}>Voice Analysis Protocol</h3>
              <div style={{...styles.empty, textAlign: 'left', marginTop: 15}}>
                <p>• Speak clearly into the microphone.</p>
                <p>• The AI detects "Urgency" and "Threat" patterns.</p>
                <p>• Results are processed per sentence.</p>
                <div style={{marginTop: 20, padding: 10, border: '1px solid rgba(0,255,180,0.2)', borderRadius: 10, background: 'rgba(0,255,180,0.05)'}}>
                  <small style={{color: '#00ffb4'}}>Status: AI Voice Core Active</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.gridDots} /><div style={styles.glowGreen} /><div style={styles.glowPurple} />
      <div style={styles.shell}>
        <header style={styles.header}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={styles.logo}>🛡️</div>
            <div>
              <h1 style={styles.title}>AI Fraud SMS Detector</h1>
              <p style={styles.sub}>Cyber-Neon UI • React+TS • Flask API</p>
            </div>
          </div>
          <button style={styles.btnOutlineGreen} onClick={() => setScreen("choose")}>← Switch Mode</button>
        </header>

        <div style={styles.twoCol}>
          <div style={styles.card}>
            <div style={styles.cardHeader}><h3 style={styles.h3}>Check Message</h3><span style={styles.pillGreen}>LIVE</span></div>
            <textarea value={sms} onChange={(e) => setSms(e.target.value)} placeholder="Paste or speak suspicious SMS here..." style={styles.textarea} />
            <div style={styles.row}>
              <button onClick={checkSMS} disabled={!sms.trim() || loading} style={styles.btnGreen}>{loading ? "Scanning..." : "Check SMS"}</button>
              <button onClick={startVoiceInput} style={styles.btnOutlineGreen}>🎙 Speak</button>
              <button onClick={clearAll} style={styles.btnPurple}>Clear</button>
            </div>

            {error && <div style={{ color: "#ff3c82", marginTop: 10, fontSize: 13 }}>{error}</div>}

            {data && (
              <div style={{ marginTop: 16 }}>
                <h3 style={styles.h3}>Result Analysis</h3>
                <div style={styles.resultBox}>
                  <div style={styles.resultTop}>
                    <span style={{ ...styles.status, borderColor: isFraud ? "rgba(255,60,130,0.8)" : "rgba(0,255,180,0.8)", color: isFraud ? "#ff3c82" : "#00ffb4" }}>
                      {data.prediction}
                    </span>
                    <div style={styles.kv}><span style={styles.k}>Confidence Score</span><span style={styles.v}>{data.confidence.toFixed(2)}%</span></div>
                    <div style={styles.meter}><div style={{ ...styles.fill, width: `${confidenceWidth}%` }} /></div>
                    <div style={{ marginTop: 8, fontWeight: 950, fontSize: 13 }}>Risk Level: <span style={{ color: riskColor }}>{riskLevel}</span></div>

                    {/* LANGUAGE DETECTION UI */}
                    <div style={{ marginTop: 8 }}>
                        <div style={styles.smallLabel}>Detected Language</div>
                        <div style={{ fontWeight: 900, fontSize: 14, color: '#a78bfa' }}>
                            {detectLanguage(sms)}
                        </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={styles.smallLabel}>Scam Category</div>
                      <span style={styles.typeBadge}>{detectScamType(sms)}</span>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={styles.smallLabel}>Risky Keywords</div>
                      {data.risky_words?.length ? (
                        <div style={styles.chips}>{data.risky_words.map((w) => <Chip key={w} text={w} />)}</div>
                      ) : <div style={styles.muted}>No risky keywords detected.</div>}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={styles.smallLabel}>Detected Links</div>
                      {extractLinks(sms).length > 0 ? (
                        <div style={{marginTop: 5}}>
                          {extractLinks(sms).map((link, index) => (
                            <div key={index} style={{ color: "#00ffcc", fontSize: 12, wordBreak: 'break-all' }}>• {link}</div>
                          ))}
                        </div>
                      ) : <div style={styles.muted}>No links found</div>}
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <div style={styles.smallLabel}>Safety Suggestions</div>
                        <ul style={{ marginTop: 6, paddingLeft: 18, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                            {getSuggestions().map((tip, i) => (
                            <li key={i} style={{ marginBottom: 4 }}>
                                {tip}
                            </li>
                            ))}
                        </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.h3}>Scan History</h3>
              <button onClick={downloadReport} style={styles.btnOutlineGreen}>Report</button>
            </div>
            <div style={styles.historyList}>
              {history.length === 0 && <div style={styles.muted}>No history yet.</div>}
              {history.map((h, i) => (
                <div key={i} style={styles.historyItem}>
                  <div style={styles.historyTop}>
                    <span style={styles.time}>{h.time}</span>
                    <span style={{color: h.prediction.includes("FRAUD") ? "#ff3c82" : "#00ffb4", fontSize: 11, fontWeight: 800}}>{h.prediction}</span>
                  </div>
                  <div style={styles.msg}>{h.message}</div>
                  <button 
                    onClick={() => copyToClipboard(h.message)}
                    style={{background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer', marginTop: 5, padding: 0}}
                  >
                    Copy Message
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================= CSS STYLES =========================
const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: 22, background: "linear-gradient(135deg, #050814 0%, #07071a 55%, #050814 100%)", color: "rgba(255,255,255,0.92)", position: "relative", overflow: "hidden" },
  gridDots: { position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)", backgroundSize: "26px 26px", opacity: 0.3, pointerEvents: "none" },
  glowGreen: { position: "absolute", width: 820, height: 820, borderRadius: 999, left: -260, top: -320, background: "rgba(0,255,180,0.18)", filter: "blur(90px)", pointerEvents: "none" },
  glowPurple: { position: "absolute", width: 820, height: 820, borderRadius: 999, right: -320, top: -260, background: "rgba(167,139,250,0.20)", filter: "blur(90px)", pointerEvents: "none" },
  blurLayer: { position: "absolute", inset: 0, backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.35)", zIndex: 0 },
  centerWrap: { position: "relative", minHeight: "calc(100vh - 44px)", display: "grid", placeItems: "center", zIndex: 1 },
  modal: { width: "min(500px, 94vw)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(8,10,22,0.85)", padding: 30, textAlign: "center" },
  modalIcon: { width: 60, height: 60, margin: "0 auto 15px", borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", fontSize: 28 },
  modalTitle: { margin: 0, fontSize: 24, fontWeight: 950, letterSpacing: -0.5 },
  modalText: { margin: "15px 0 25px", color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6 },
  modalFoot: { marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.4)" },
  btnGreen: { border: "1px solid #00ffb4", borderRadius: 12, padding: "12px 24px", fontWeight: 900, color: "#00ffb4", background: "rgba(0,255,180,0.08)", cursor: "pointer", transition: "0.2s" },
  btnPurple: { border: "1px solid #a78bfa", borderRadius: 12, padding: "12px 24px", fontWeight: 900, color: "#a78bfa", background: "rgba(167,139,250,0.08)", cursor: "pointer", transition: "0.2s" },
  btnOutlineGreen: { border: "1px solid rgba(0,255,180,0.3)", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "#00ffb4", background: "transparent", cursor: "pointer" },
  modeCard: { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 16, cursor: "pointer", transition: "0.2s", color: "inherit" },
  modeTop: { display: "flex", gap: 15, alignItems: "center" },
  modeIcon: { fontSize: 24, background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 12 },
  modeTitle: { fontWeight: 900, fontSize: 16 },
  modeSub: { fontSize: 12, opacity: 0.6 },
  shell: { maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { width: 45, height: 45, borderRadius: 12, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", fontSize: 20 },
  title: { margin: 0, fontSize: 22, fontWeight: 900 },
  sub: { fontSize: 12, color: "rgba(0,255,180,0.7)" },
  twoCol: { display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 },
  card: { background: "rgba(8,10,22,0.6)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 20, backdropFilter: "blur(12px)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  h3: { margin: 0, fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 },
  pillGreen: { padding: "4px 10px", borderRadius: 999, border: "1px solid #00ffb4", color: "#00ffb4", background: "rgba(0,255,180,0.1)", fontSize: 10, fontWeight: 900 },
  textarea: { width: "100%", minHeight: 140, borderRadius: 14, padding: 15, background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, outline: 'none', resize: 'none' },
  row: { display: "flex", gap: 12, marginTop: 15 },
  resultBox: { borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", padding: 15 },
  resultTop: { display: "flex", flexDirection: "column", gap: 8 },
  status: { alignSelf: "flex-start", padding: "6px 16px", borderRadius: 999, border: "1px solid", fontWeight: 900, fontSize: 14 },
  kv: { display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 5 },
  k: { opacity: 0.6 },
  v: { fontWeight: 800 },
  meter: { height: 6, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginTop: 4 },
  fill: { height: "100%", background: "linear-gradient(90deg, #00ffb4, #a78bfa, #ff3c82)", transition: "width 0.5s ease-out" },
  smallLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase" },
  typeBadge: { display: "inline-block", marginTop: 5, padding: "5px 12px", borderRadius: 8, background: "rgba(255,200,0,0.1)", color: "#ffc800", border: "1px solid rgba(255,200,0,0.3)", fontSize: 12, fontWeight: 800 },
  chips: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5 },
  chip: { padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(0,255,180,0.3)", background: "rgba(0,255,180,0.05)", fontSize: 11, color: "#00ffb4", fontWeight: 700 },
  historyList: { display: "flex", flexDirection: "column", gap: 12, maxHeight: 480, overflowY: "auto", paddingRight: 5 },
  historyItem: { borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 12 },
  historyTop: { display: "flex", justifyContent: "space-between", marginBottom: 5 },
  time: { fontSize: 10, opacity: 0.5 },
  msg: { fontSize: 13, opacity: 0.9, lineHeight: 1.4, wordBreak: 'break-word' },
  muted: { fontSize: 12, opacity: 0.4, textAlign: 'center', marginTop: 20 },
  empty: { color: "rgba(255,255,255,0.6)", fontSize: 13 }
};