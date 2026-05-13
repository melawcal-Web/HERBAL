"use client";

import { jsPDF } from "jspdf";
import type { FormulaJson } from "@/lib/formula";
import { computeFormulaPercentages } from "@/lib/formula";

type Props = {
  therapistName: string;
  clientName: string;
  dateIso: string;
  summary: string;
  formula: FormulaJson;
};

export function ExportClinicalSummary({ therapistName, clientName, dateIso, summary, formula }: Props) {
  function buildDocText() {
    const lines = [
      "סיכום טיפול / Treatment summary",
      `תאריך: ${new Date(dateIso).toLocaleDateString("he-IL")}`,
      `מטפל: ${therapistName}`,
      `לקוח: ${clientName}`,
      "",
      "סיכום:",
      summary,
      "",
      "נוסחה:",
      ...computeFormulaPercentages(formula).map(
        (i) => `- ${i.name || "(ללא שם)"}: ${i.grams}g (${i.percent.toFixed(2)}%)`,
      ),
    ];
    return lines.join("\n");
  }

  async function copyForGoogleDocs() {
    await navigator.clipboard.writeText(buildDocText());
    alert("הטקסט הועתק. פתחו Google Docs והדביקו (Ctrl/Cmd+V).");
  }

  function downloadPdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;
    doc.setFontSize(14);
    doc.text("Treatment summary / סיכום טיפול", margin, y);
    y += 24;
    doc.setFontSize(11);
    const blocks = [
      `Date: ${new Date(dateIso).toLocaleDateString("he-IL")}`,
      `Therapist: ${therapistName}`,
      `Client: ${clientName}`,
      "",
      "Summary:",
      summary,
      "",
      "Formula:",
      ...computeFormulaPercentages(formula).map(
        (i) => `${i.name || "(unnamed)"}: ${i.grams}g — ${i.percent.toFixed(2)}%`,
      ),
    ];
    for (const line of blocks) {
      const wrapped = doc.splitTextToSize(line, 500);
      doc.text(wrapped, margin, y);
      y += Array.isArray(wrapped) ? wrapped.length * 14 : 14;
      if (y > 760) {
        doc.addPage();
        y = margin;
      }
    }
    doc.save(`clinical-summary-${dateIso.slice(0, 10)}.pdf`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={downloadPdf}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-herbal-600 px-5 text-sm text-white hover:bg-herbal-500"
      >
        הורד PDF
      </button>
      <button
        type="button"
        onClick={copyForGoogleDocs}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-herbal-300 bg-white px-5 text-sm text-herbal-900 hover:bg-herbal-50"
      >
        העתקה ל-Google Docs
      </button>
    </div>
  );
}
