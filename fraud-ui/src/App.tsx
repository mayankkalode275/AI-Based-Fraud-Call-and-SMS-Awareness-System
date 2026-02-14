import React, { useEffect, useMemo, useState } from "react";

type PredictResponse = {
  prediction: string;
  confidence: number;
  risky_words: string[];
};

type MetricsResponse = {
  accuracy: number;
  confusion_matrix: number[][];
  labels: string[];
};

type HistoryItem = {
  time: string;
  message: string;
  prediction: string;
  confidence: number;
  risky_words: string[];
};

const API = "http://127.0.0.1:5000";

type Screen = "home" | "choose" | "sms";

export default function App() {
  // Flow screens
  const [screen, setScreen] = useState<Screen>("home");

  // tabs inside sms screen
  const [tab, setTab] = useState<"detector" | "metrics">("detector");

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

  const isFraud = useMemo(
    () => data?.prediction?.toUpperCase().includes("FRAUD") ?? false,
    [data]
  );

  const confidenceWidth = Math.max(0, Math.min(100, data?.confidence ?? 0));

  // Risk Level (Option B)
  // UPDATED Risk Level Logic
  const riskLevel =
    data?.prediction?.toUpperCase().includes("SAFE") &&
    (data?.confidence ?? 0)>= 95
      ? "LOW RISK"
      : (data?.confidence ?? 0) > 60
      ? "MEDIUM RISK"
      : "HIGH RISK";

  const riskColor =
    riskLevel === "HIGH RISK"
      ? "rgba(255,60,130,0.95)"
      : riskLevel === "MEDIUM RISK"
      ? "rgba(167,139,250,0.95)"
      : "rgba(0,255,180,0.95)";


  const checkSMS = async () => {
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

  const clearHistory = () => setHistory([]);

  const downloadReport = () => {
    const lines: string[] = [];
    lines.push("AI Fraud SMS Detector - Report");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("--------------------------------------------------");
    lines.push(`Total checks in history: ${history.length}`);
    lines.push("");

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

  // metrics
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [metricsErr, setMetricsErr] = useState("");
  const [metricsLoading, setMetricsLoading] = useState(false);

  const loadMetrics = async () => {
    setMetricsErr("");
    setMetricsLoading(true);
    try {
      const res = await fetch(`${API}/metrics`);
      if (!res.ok) throw new Error("Failed to load metrics (backend issue).");
      const json = (await res.json()) as MetricsResponse;
      setMetrics(json);
    } catch (e: any) {
      setMetricsErr(e?.message || "Metrics error");
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    if (screen === "sms" && tab === "metrics" && !metrics && !metricsLoading) {
      loadMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, tab]);

  const Chip = ({ text }: { text: string }) => (
    <span style={styles.chip}>{text}</span>
  );

  // ========================= HOME =========================
  if (screen === "home") {
    return (
      <div style={styles.page}>
        <div style={styles.gridDots} />
        <div style={styles.glowGreen} />
        <div style={styles.glowPurple} />
        <div style={styles.blurLayer} />

        <div style={styles.centerWrap}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>🛡️</div>
            <h2 style={styles.modalTitle}>Welcome to AI Fraud Detector</h2>
            <p style={styles.modalText}>
              Detect suspicious <b>Fraud SMS</b> using Machine Learning, confidence score,
              risky keywords, history, and accuracy analytics.
            </p>

            <button style={styles.btnGreen} onClick={() => setScreen("choose")}>
              Start →
            </button>

            <div style={styles.modalFoot}>
              Tip: Keep Flask backend running on <b>127.0.0.1:5000</b>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================= CHOOSE MODE =========================
  if (screen === "choose") {
    return (
      <div style={styles.page}>
        <div style={styles.gridDots} />
        <div style={styles.glowGreen} />
        <div style={styles.glowPurple} />
        <div style={styles.blurLayer} />

        <div style={styles.centerWrap}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Choose Detector Mode</h2>
            <p style={styles.modalText}>Select what you want to analyze:</p>

            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              <button
                style={styles.modeCard}
                onClick={() =>
                  alert("Call Fraud Detector: Coming Soon ✅\n(We will add later)")
                }
              >
                <div style={styles.modeTop}>
                  <span style={styles.modeIcon}>📞</span>
                  <div>
                    <div style={styles.modeTitle}>AI Fraud Detector for Call</div>
                    <div style={styles.modeSub}>Coming soon (next update)</div>
                  </div>
                </div>
              </button>

              <button
                style={styles.modeCard}
                onClick={() => {
                  setScreen("sms");
                  setTab("detector");
                }}
              >
                <div style={styles.modeTop}>
                  <span style={styles.modeIcon}>💬</span>
                  <div>
                    <div style={styles.modeTitle}>AI Fraud Detector for SMS</div>
                    <div style={styles.modeSub}>
                      Start detecting suspicious SMS now
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={styles.btnPurple} onClick={() => setScreen("home")}>
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================= SMS APP =========================
  return (
    <div style={styles.page}>
      <div style={styles.gridDots} />
      <div style={styles.glowGreen} />
      <div style={styles.glowPurple} />

      <div style={styles.shell}>
        <header style={styles.header}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={styles.logo}>🛡️</div>
            <div>
              <h1 style={styles.title}>AI Fraud SMS Detector</h1>
              <p style={styles.sub}>
                Cyber-Neon UI • React+TS • Flask API • TF-IDF • Naive Bayes
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {/* BACK button to choose mode */}
            <button style={styles.btnOutlineGreen} onClick={() => setScreen("choose")}>
              ← Back
            </button>

            <div style={styles.tabs}>
              <button
                style={{ ...styles.tabBtn, ...(tab === "detector" ? styles.tabOn : {}) }}
                onClick={() => setTab("detector")}
              >
                Detector
              </button>
              <button
                style={{ ...styles.tabBtn, ...(tab === "metrics" ? styles.tabOn : {}) }}
                onClick={() => setTab("metrics")}
              >
                Accuracy & Matrix
              </button>
            </div>
          </div>
        </header>

        {tab === "detector" ? (
          <div style={styles.twoCol}>
            {/* Left */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.h3}>Check Message</h3>
                <span style={styles.pillGreen}>LIVE</span>
              </div>

              <textarea
                value={sms}
                onChange={(e) => setSms(e.target.value)}
                placeholder="URGENT! Your bank account is blocked. Click link now..."
                style={styles.textarea}
              />

              <div style={styles.row}>
                <button
                  onClick={checkSMS}
                  disabled={!sms.trim() || loading}
                  style={{
                    ...styles.btnGreen,
                    opacity: !sms.trim() || loading ? 0.6 : 1,
                    cursor: !sms.trim() || loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Scanning..." : "Check SMS"}
                </button>

                <button onClick={clearAll} style={styles.btnPurple}>
                  Clear
                </button>
              </div>

              {error && <div style={styles.alert}>{error}</div>}

              <div style={{ marginTop: 16 }}>
                <h3 style={styles.h3}>Result</h3>

                {!data ? (
                  <div style={styles.empty}>
                    No result yet. Paste SMS and press Check.
                  </div>
                ) : (
                  <div style={styles.resultBox}>
                    <div style={styles.resultTop}>
                      <span
                        style={{
                          ...styles.status,
                          borderColor: isFraud
                            ? "rgba(255,60,130,0.8)"
                            : "rgba(0,255,180,0.8)",
                          boxShadow: isFraud
                            ? "0 0 18px rgba(255,60,130,0.25)"
                            : "0 0 18px rgba(0,255,180,0.22)",
                        }}
                      >
                        {data.prediction}
                      </span>

                      <div style={styles.kv}>
                        <span style={styles.k}>Confidence</span>
                        <span style={styles.v}>{data.confidence.toFixed(2)}%</span>
                      </div>

                      <div style={styles.meter}>
                        <div style={{ ...styles.fill, width: `${confidenceWidth}%` }} />
                      </div>

                      {/* Risk Level */}
                      <div style={{ marginTop: 8, fontWeight: 950, fontSize: 13 }}>
                        Risk Level:{" "}
                        <span style={{ color: riskColor, textShadow: `0 0 12px ${riskColor}55` }}>
                          {riskLevel}
                        </span>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <div style={styles.smallLabel}>Risky Words</div>
                        {data.risky_words?.length ? (
                          <div style={styles.chips}>
                            {data.risky_words.map((w) => (
                              <Chip key={w} text={w} />
                            ))}
                          </div>
                        ) : (
                          <div style={styles.muted}>None found.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.h3}>History</h3>
                  <div style={styles.muted}>
                    Last {history.length} checks (saved on this PC)
                  </div>
                </div>
                <div style={styles.actions}>
                  <button onClick={downloadReport} style={styles.btnOutlineGreen}>
                    Download Report
                  </button>
                  <button onClick={clearHistory} style={styles.btnOutlinePink}>
                    Clear
                  </button>
                </div>
              </div>

              {history.length === 0 ? (
                <div style={styles.empty}>No history yet.</div>
              ) : (
                <div style={styles.historyList}>
                  {history.map((h, i) => {
                    const fraud = h.prediction.toUpperCase().includes("FRAUD");
                    return (
                      <div key={i} style={styles.historyItem}>
                        <div style={styles.historyTop}>
                          <span style={styles.time}>{h.time}</span>
                          <span
                            style={{
                              ...styles.miniTag,
                              borderColor: fraud
                                ? "rgba(255,60,130,0.8)"
                                : "rgba(0,255,180,0.8)",
                            }}
                          >
                            {h.prediction} • {h.confidence.toFixed(2)}%
                          </span>
                        </div>
                        <div style={styles.msg}>{h.message}</div>
                        <div style={styles.riskyLine}>
                          Risky: <b>{h.risky_words.join(", ") || "None"}</b>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.h3}>Accuracy & Confusion Matrix</h3>
                <div style={styles.muted}>
                  Computed from dataset using saved model + fixed test split
                </div>
              </div>
              <button onClick={loadMetrics} style={styles.btnOutlineGreen}>
                Refresh
              </button>
            </div>

            {metricsLoading && <div style={styles.muted}>Loading...</div>}
            {metricsErr && <div style={styles.alert}>{metricsErr}</div>}

            {metrics && (
              <div style={{ marginTop: 10 }}>
                <div style={styles.metricRow}>
                  <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>Accuracy</div>
                    <div style={styles.metricValue}>{metrics.accuracy}%</div>
                    <div style={styles.muted}>Overall correct predictions</div>
                  </div>

                  <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>Meaning</div>
                    <div style={styles.muted}>
                      TN/TP good • FP/FN are mistakes (explained in matrix)
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={styles.smallLabel}>Confusion Matrix</div>

                  <div style={styles.matrix}>
                    <div style={styles.matrixHead}>
                      <div />
                      <div style={styles.matrixTitle}>Pred Safe (0)</div>
                      <div style={styles.matrixTitle}>Pred Fraud (1)</div>
                    </div>

                    <div style={styles.matrixRow}>
                      <div style={styles.matrixSide}>Actual Safe (0)</div>
                      <div style={styles.cell}>
                        {metrics.confusion_matrix[0][0]}{" "}
                        <span style={styles.cellHint}>TN</span>
                      </div>
                      <div style={styles.cell}>
                        {metrics.confusion_matrix[0][1]}{" "}
                        <span style={styles.cellHint}>FP</span>
                      </div>
                    </div>

                    <div style={styles.matrixRow}>
                      <div style={styles.matrixSide}>Actual Fraud (1)</div>
                      <div style={styles.cell}>
                        {metrics.confusion_matrix[1][0]}{" "}
                        <span style={styles.cellHint}>FN</span>
                      </div>
                      <div style={styles.cell}>
                        {metrics.confusion_matrix[1][1]}{" "}
                        <span style={styles.cellHint}>TP</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, ...styles.muted }}>
                    TN: correctly safe • TP: correctly fraud • FP: safe predicted as fraud • FN: fraud predicted as safe
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <footer style={styles.footer}>
          Cyber-Neon Theme • Built for Mini Project Demo
        </footer>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 22,
    background: "linear-gradient(135deg, #050814 0%, #07071a 55%, #050814 100%)",
    color: "rgba(255,255,255,0.92)",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue", sans-serif',
    position: "relative",
    overflow: "hidden",
  },
  gridDots: {
    position: "absolute",
    inset: 0,
    backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
    backgroundSize: "26px 26px",
    opacity: 0.30,
    pointerEvents: "none",
  },
  glowGreen: {
    position: "absolute",
    width: 820,
    height: 820,
    borderRadius: 9999,
    left: -260,
    top: -320,
    background: "rgba(0,255,180,0.18)",
    filter: "blur(90px)",
    pointerEvents: "none",
  },
  glowPurple: {
    position: "absolute",
    width: 820,
    height: 820,
    borderRadius: 9999,
    right: -320,
    top: -260,
    background: "rgba(167,139,250,0.20)",
    filter: "blur(90px)",
    pointerEvents: "none",
  },

  blurLayer: {
    position: "absolute",
    inset: 0,
    backdropFilter: "blur(10px)",
    background: "rgba(0,0,0,0.35)",
  },
  centerWrap: {
    position: "relative",
    minHeight: "calc(100vh - 44px)",
    display: "grid",
    placeItems: "center",
  },
  modal: {
    width: "min(620px, 94vw)",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(8,10,22,0.75)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
    padding: 20,
    textAlign: "center",
  },
  modalIcon: {
    width: 60,
    height: 60,
    margin: "0 auto 10px",
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 0 18px rgba(0,255,180,0.12)",
    fontSize: 24,
  },

  // UPDATED (bigger text)
  modalTitle: { margin: 0, fontSize: 28, fontWeight: 950 },
  modalText: {
    margin: "10px 0 14px",
    color: "rgba(255,255,255,0.75)",
    fontSize: 16,
    lineHeight: 1.6,
  },
  modalFoot: { marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.55)" },

  modeCard: {
    width: "100%",
    textAlign: "left",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    padding: 16,
    cursor: "pointer",
  },
  modeTop: { display: "flex", gap: 12, alignItems: "center" },
  modeIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: 24, // UPDATED
  },
  modeTitle: { fontWeight: 950, fontSize: 18 }, // UPDATED
  modeSub: { fontSize: 14, color: "rgba(255,255,255,0.70)", marginTop: 6 }, // UPDATED

  shell: { maxWidth: 1120, margin: "0 auto", position: "relative" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 0 18px rgba(0,255,180,0.12)",
  },
  title: { margin: 0, fontSize: 28, letterSpacing: 0.2 },
  sub: { margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.68)" },

  tabs: { display: "flex", gap: 8 },
  tabBtn: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.78)",
    cursor: "pointer",
    fontWeight: 800,
  },
  tabOn: {
    borderColor: "rgba(0,255,180,0.45)",
    boxShadow: "0 0 16px rgba(0,255,180,0.12)",
  },

  twoCol: { display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 14 },

  card: {
    background: "rgba(8,10,22,0.60)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 16,
    backdropFilter: "blur(12px)",
    boxShadow: "0 22px 70px rgba(0,0,0,0.45)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  h3: { margin: 0, fontSize: 16, color: "rgba(255,255,255,0.92)" },
  muted: { fontSize: 12, color: "rgba(255,255,255,0.65)" },

  pillGreen: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,255,180,0.35)",
    color: "rgba(0,255,180,0.95)",
    background: "rgba(0,255,180,0.08)",
    fontSize: 12,
    fontWeight: 900,
  },

  textarea: {
    width: "100%",
    minHeight: 150,
    resize: "vertical",
    borderRadius: 16,
    padding: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    outline: "none",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    lineHeight: 1.45,
  },

  row: { display: "flex", gap: 10, marginTop: 12, alignItems: "center", flexWrap: "wrap" },

  btnGreen: {
    border: "1px solid rgba(0,255,180,0.35)",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 900,
    color: "rgba(0,255,180,0.95)",
    background: "rgba(0,255,180,0.08)",
    boxShadow: "0 0 18px rgba(0,255,180,0.12)",
    cursor: "pointer",
  },

  btnPurple: {
    border: "1px solid rgba(167,139,250,0.35)",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 900,
    color: "rgba(167,139,250,0.95)",
    background: "rgba(167,139,250,0.08)",
    boxShadow: "0 0 18px rgba(167,139,250,0.12)",
    cursor: "pointer",
  },

  btnOutlineGreen: {
    border: "1px solid rgba(0,255,180,0.35)",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 900,
    color: "rgba(0,255,180,0.95)",
    background: "rgba(0,255,180,0.06)",
    cursor: "pointer",
  },
  btnOutlinePink: {
    border: "1px solid rgba(255,60,130,0.40)",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 900,
    color: "rgba(255,60,130,0.95)",
    background: "rgba(255,60,130,0.07)",
    cursor: "pointer",
  },

  actions: { display: "flex", gap: 8, flexWrap: "wrap" },

  alert: {
    marginTop: 10,
    padding: 10,
    borderRadius: 14,
    border: "1px solid rgba(255,60,130,0.35)",
    background: "rgba(255,60,130,0.10)",
  },

  empty: {
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    border: "1px dashed rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.70)",
  },

  resultBox: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.16)",
    padding: 12,
  },
  resultTop: { display: "flex", flexDirection: "column", gap: 10 },

  status: {
    display: "inline-flex",
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.20)",
    fontWeight: 950,
    letterSpacing: 0.2,
  },

  kv: { display: "flex", justifyContent: "space-between", fontSize: 13 },
  k: { color: "rgba(255,255,255,0.70)" },
  v: { fontWeight: 950 },

  meter: {
    height: 10,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, rgba(0,255,180,0.95), rgba(167,139,250,0.95), rgba(255,60,130,0.90))",
    transition: "width 0.35s ease",
  },

  smallLabel: { fontSize: 12, color: "rgba(255,255,255,0.72)", fontWeight: 900 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,255,180,0.20)",
    background: "rgba(0,255,180,0.06)",
    fontSize: 12,
    color: "rgba(0,255,180,0.92)",
    fontWeight: 850,
  },

  historyList: { marginTop: 10, display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflow: "auto" },
  historyItem: { borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.16)", padding: 12 },
  historyTop: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  time: { fontSize: 12, color: "rgba(255,255,255,0.62)" },
  miniTag: { padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.20)", fontSize: 12, fontWeight: 950 },
  msg: { marginTop: 8, fontSize: 13, lineHeight: 1.35 },
  riskyLine: { marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.70)" },

  metricRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  metricCard: { borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.16)", padding: 14 },
  metricLabel: { fontSize: 12, color: "rgba(255,255,255,0.72)", fontWeight: 950 },
  metricValue: { marginTop: 8, fontSize: 28, fontWeight: 980 },

  matrix: { marginTop: 10, borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.16)", overflow: "hidden" },
  matrixHead: { display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.10)" },
  matrixTitle: { padding: 12, fontSize: 12, fontWeight: 950, color: "rgba(255,255,255,0.82)" },
  matrixRow: { display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.10)" },
  matrixSide: { padding: 12, fontSize: 12, fontWeight: 950, color: "rgba(255,255,255,0.80)" },
  cell: { padding: 12, fontSize: 14, fontWeight: 950 },
  cellHint: { marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 900 },

  footer: { marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.55)" },
};
