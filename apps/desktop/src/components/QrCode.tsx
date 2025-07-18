import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QrCode({ value, size = 120 }: { value: string, size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) {
      QRCode.toCanvas(ref.current, value, { width: size, margin: 1 });
    }
  }, [value, size]);
  return <canvas ref={ref} width={size} height={size} style={{ background: "#fff", borderRadius: 16 }} />;
} 