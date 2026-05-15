"use client";

import { CONTENT_AUDIENCE_OPTIONS, type ContentAudienceId } from "@/lib/content-audience";

export function AudienceMultiSelect({
  value,
  onChange,
  disabled,
}: {
  value: ContentAudienceId[];
  onChange: (next: ContentAudienceId[]) => void;
  disabled?: boolean;
}) {
  const toggle = (id: ContentAudienceId) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-herbal-900">קהל יעד</legend>
      <div className="flex flex-wrap gap-2">
        {CONTENT_AUDIENCE_OPTIONS.map((o) => {
          const on = value.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(o.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                on
                  ? "border-herbal-600 bg-herbal-600 text-white"
                  : "border-herbal-200 bg-white text-herbal-800 hover:border-herbal-400"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
