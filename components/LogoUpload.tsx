"use client";

import { useRef, useState } from "react";

/**
 * Reads an image, downscales it on a canvas (longest side ≤ MAX_PX) and
 * returns a compact embedded data URL via onChange. Logos live inside the
 * document itself — no external storage, so uploads always work and the
 * image is guaranteed to fit the invoice.
 */
const MAX_PX = 360; // display size in docs is ~160px, so this stays crisp
const MAX_INPUT_BYTES = 8 * 1024 * 1024; // reject > 8MB source files

export default function LogoUpload({
  value,
  onChange,
  label = "Logo",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  /** @deprecated kept for call-site compatibility; storage is no longer used */
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);

    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setErr("Image is too large (max 8MB).");
      return;
    }

    setBusy(true);
    try {
      const dataUrl = await resizeToDataUrl(file);
      onChange(dataUrl);
    } catch {
      setErr("Could not read that image. Try a PNG or JPG.");
    } finally {
      setBusy(false);
      // allow re-selecting the same file
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 p-1 text-[10px] text-slate-400">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="logo preview" className="h-full w-full object-contain" />
          ) : (
            "No logo"
          )}
        </div>
        <div className="space-y-1">
          <label className="btn-subtle cursor-pointer">
            {busy ? "Processing…" : value ? "Replace" : "Upload"}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              disabled={busy}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="ml-2 text-xs text-rose-600 hover:underline"
            >
              Remove
            </button>
          )}
          {err && <p className="text-xs text-rose-600">{err}</p>}
        </div>
      </div>
    </div>
  );
}

/** Downscale an image file to a data URL, preserving transparency. */
function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read error"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode error"));
      img.onload = () => {
        const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        // PNG keeps logo transparency; small dimensions keep the string light.
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
