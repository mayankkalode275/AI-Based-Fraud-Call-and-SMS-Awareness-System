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
    <div style={{ padding: "20px" }}>

      <h2>AI Scam Call Detector</h2>

      <input type="file" accept="audio/*" onChange={handleFileChange} />

      <br /><br />

      <button onClick={uploadCall} disabled={loading}>
        {loading ? "Processing..." : "Detect Scam Call"}
      </button>

      <br /><br />

      {result && (
        <h3>
          Prediction: <span style={{ color: "red" }}>{result}</span>
        </h3>
      )}

    </div>
  );
};

export default CallDetector;