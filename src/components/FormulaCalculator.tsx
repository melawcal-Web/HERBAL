"use client";

import { useMemo } from "react";
import type { FormulaIngredient, FormulaJson } from "@/lib/formula";
import { computeFormulaPercentages } from "@/lib/formula";

const emptyIngredient = (): FormulaIngredient => ({ name: "", grams: 0 });

export function FormulaCalculator({
  value,
  onChange,
}: {
  value: FormulaJson;
  onChange: (value: FormulaJson) => void;
}) {
  const ingredients = useMemo(
    () => (value.ingredients?.length ? value.ingredients : [emptyIngredient()]),
    [value.ingredients],
  );
  const note = value.note ?? "";

  const formula: FormulaJson = useMemo(
    () => ({ ingredients, note: note || undefined }),
    [ingredients, note],
  );

  const rows = useMemo(() => computeFormulaPercentages(formula), [formula]);

  function emit(nextIngredients: FormulaIngredient[], nextNote: string) {
    onChange({
      ingredients: nextIngredients,
      note: nextNote || undefined,
    });
  }

  function updateRow(index: number, patch: Partial<FormulaIngredient>) {
    const next = ingredients.map((row, i) => (i === index ? { ...row, ...patch } : row));
    emit(next, note);
  }

  function addRow() {
    emit([...ingredients, emptyIngredient()], note);
  }

  function removeRow(index: number) {
    if (ingredients.length <= 1) return;
    emit(
      ingredients.filter((_, i) => i !== index),
      note,
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-herbal-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-herbal-900">מחשבון אחוזי נוסחה</h3>
        <button
          type="button"
          onClick={addRow}
          className="min-h-[44px] rounded-full bg-herbal-100 px-4 text-sm font-medium text-herbal-800 hover:bg-herbal-200"
        >
          + צמח
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-right text-sm">
          <thead>
            <tr className="text-xs uppercase text-slate-500">
              <th className="pb-2">צמח</th>
              <th className="pb-2">גרם</th>
              <th className="pb-2">%</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-herbal-100">
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="py-2 pr-2">
                  <input
                    className="w-full min-h-[44px] rounded-lg border border-herbal-200 px-2 py-2"
                    value={row.name}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    placeholder="שם צמח"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    className="w-24 min-h-[44px] rounded-lg border border-herbal-200 px-2 py-2"
                    value={Number.isFinite(row.grams) ? row.grams : 0}
                    onChange={(e) => updateRow(i, { grams: parseFloat(e.target.value) || 0 })}
                  />
                </td>
                <td className="py-2 font-mono text-herbal-800">{row.percent.toFixed(2)}%</td>
                <td className="py-2 text-left">
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] rounded-full text-rose-600 hover:bg-rose-50"
                    onClick={() => removeRow(i)}
                    aria-label="הסר שורה"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">הערות לנוסחה</label>
        <textarea
          className="mt-1 w-full min-h-[88px] rounded-xl border border-herbal-200 px-3 py-2"
          value={note}
          onChange={(e) => emit(ingredients, e.target.value)}
        />
      </div>
    </div>
  );
}
