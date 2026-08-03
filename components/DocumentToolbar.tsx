"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { DocStatus } from "@/lib/database.types";

const STATUSES: DocStatus[] = ["DRAFT", "ISSUED", "PAID", "VOID"];

export default function DocumentToolbar({
  documentId,
  status,
  financial,
}: {
  documentId: string;
  status: DocStatus;
  financial: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<DocStatus>(status);
  const [saving, setSaving] = useState(false);

  async function changeStatus(next: DocStatus) {
    setCurrent(next);
    setSaving(true);
    await createClient().from("documents").update({ status: next }).eq("id", documentId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-ink-soft">
        Status
        <select
          value={current}
          onChange={(e) => changeStatus(e.target.value as DocStatus)}
          disabled={saving}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </label>

      <button onClick={() => window.print()} className="btn-primary">
        ⬇ Export PDF
      </button>
    </div>
  );
}
