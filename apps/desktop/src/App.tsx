import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import QrCode from "./components/QrCode";
import FileList from "./components/FileList";
import "./App.css";

function getLocalIp() {
  return window.location.hostname === "localhost" ? "192.168.1.5" : window.location.hostname;
}

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [serverOn] = useState(true);
  const [pin, setPin] = useState("");
  const [expiry, setExpiry] = useState(60);
  const [logs] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const url = `http://${getLocalIp()}:3000`;

  async function fetchFiles() {
    const res = await fetch("/list");
    const text = await res.text();
    if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
      setFiles([]);
      return;
    }
    setFiles(text.split("\n").filter(Boolean));
  }

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 2000);
    return () => clearInterval(interval);
  }, []);

  function handleUpload(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    setUploadProgress(0);
    const form = new FormData();
    Array.from(files).forEach((file) => form.append("file", file));
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      setUploading(false);
      setUploadProgress(0);
      fetchFiles();
    };
    xhr.onerror = () => {
      setUploading(false);
      setUploadProgress(0);
    };
    xhr.send(form);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  }

  function copyUrl() {
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="app-root">
      <Sidebar active={active} setActive={setActive} />
      <main className="dashboard">
        {active === "dashboard" && (
          <section className="section">
            <div className="section-title">LAN File Share Host</div>
            <div className="live-link">
              <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6v12m-6-12v12" /></svg>
              <span>{url}</span>
              <button onClick={copyUrl} style={{ background: "none", border: "none", cursor: "pointer" }} title="Copy URL">
                <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>
              </button>
            </div>
            <div className="qr-section">
              <QrCode value={url} />
              <div>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>Scan to join (mobile):</div>
                <div style={{ color: serverOn ? '#2ecc40' : '#ff4136', fontWeight: 600 }}>
                  {serverOn ? "Server Running" : "Server Off"}
                </div>
              </div>
            </div>
          </section>
        )}
        {active === "files" && (
          <section className="section">
            <div className="section-title">Uploaded Files</div>
            <div
              className="dropzone"
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInput.current?.click()}
              style={{ border: "2px dashed #888", padding: 32, marginBottom: 24, cursor: "pointer" }}
            >
              <input
                type="file"
                multiple
                style={{ display: "none" }}
                ref={fileInput}
                onChange={(e) => handleUpload(e.target.files)}
              />
              <div>
                {uploading ? (
                  <div style={{ width: "100%", textAlign: "center" }}>
                    <div style={{ marginBottom: 8 }}>Uploading... {uploadProgress}%</div>
                    <div style={{ background: "#eee", borderRadius: 8, height: 8, width: "100%", overflow: "hidden" }}>
                      <div style={{ background: "#646cff", width: `${uploadProgress}%`, height: 8, transition: "width 0.2s" }} />
                    </div>
                  </div>
                ) : (
                  "Drag & drop or click to upload files"
                )}
              </div>
            </div>
            <FileList files={files} />
          </section>
        )}
        {active === "settings" && (
          <section className="section">
            <div className="section-title">Settings</div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Access PIN: </label>
              <input
                type="text"
                value={pin}
                onChange={e => setPin(e.target.value)}
                style={{ marginLeft: 8, width: 80, textAlign: "center" }}
                maxLength={8}
                placeholder="Optional"
              />
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>File Expiry (minutes): </label>
              <input
                type="number"
                value={expiry}
                onChange={e => setExpiry(Number(e.target.value))}
                style={{ marginLeft: 8, width: 60, textAlign: "center" }}
                min={1}
                max={1440}
              />
            </div>
          </section>
        )}
        {active === "logs" && (
          <section className="section">
            <div className="section-title">Transfer Logs</div>
            <ul style={{ fontSize: "0.98rem", color: "#444" }}>
              {logs.length === 0 && <li>No transfers yet.</li>}
              {logs.map((log, i) => <li key={i}>{log}</li>)}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
