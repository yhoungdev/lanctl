import { useState } from "react";

const SIDEBAR = [
  { key: "dashboard", label: "Dashboard", icon: (
    <svg className="icon" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75v-1.5A2.25 2.25 0 0 0 15 3h-6A2.25 2.25 0 0 0 6.75 5.25v1.5m10.5 0A2.25 2.25 0 0 1 19.5 9v9A2.25 2.25 0 0 1 17.25 20.25H6.75A2.25 2.25 0 0 1 4.5 18V9a2.25 2.25 0 0 1 2.25-2.25m10.5 0h-10.5" /></svg>
  ) },
  { key: "files", label: "Files", icon: (
    <svg className="icon" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V6.75A2.25 2.25 0 0 1 8.25 4.5h7.5A2.25 2.25 0 0 1 18 6.75v10.5A2.25 2.25 0 0 1 15.75 19.5h-7.5A2.25 2.25 0 0 1 6 17.25V16.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 15.75 6 12l3.75-3.75M14.25 8.25 18 12l-3.75 3.75" /></svg>
  ) },
  { key: "settings", label: "Settings", icon: (
    <svg className="icon" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75A3.75 3.75 0 1 0 12 8.25a3.75 3.75 0 0 0 0 7.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z" /></svg>
  ) },
  { key: "logs", label: "Logs", icon: (
    <svg className="icon" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m-7.5-7.5v15" /></svg>
  ) },
];

export default function Sidebar({ active, setActive }: { active: string, setActive: (k: string) => void }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  function toggleDark() {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }
  return (
    <aside className="sidebar">
      <img src="/tauri.svg" className="logo" alt="App logo" />
      <nav>
        {SIDEBAR.map((item) => (
          <button
            key={item.key}
            className={active === item.key ? "active" : ""}
            onClick={() => setActive(item.key)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
        <button onClick={toggleDark} className="dark-toggle">{dark ? "🌙" : "☀️"}</button>
      </nav>
    </aside>
  );
} 