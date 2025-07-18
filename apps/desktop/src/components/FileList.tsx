export default function FileList({ files, onDelete }: { files: string[], onDelete?: (f: string) => void }) {
  return (
    <ul className="file-list">
      {files.map((f) => (
        <li key={f}>
          <a href={`/download/${encodeURIComponent(f)}`}>{f}</a>
          {onDelete && (
            <button style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }} title="Delete" onClick={() => onDelete(f)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
} 