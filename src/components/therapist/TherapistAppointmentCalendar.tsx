"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { requestAppointment, submitOpenMeetingInquiry } from "@/app/actions/appointments";
import { AppointmentWeekDiary } from "@/components/calendar/AppointmentWeekDiary";
import { buildPublicOpenSlots, parseCalendarSlotDefinitions } from "@/lib/calendar-slot-definitions";
import type { WeeklyAvailability } from "@/lib/therapist-availability";

type Props = {
  therapistUserId: string;
  therapistProfileId: string;
  availability: WeeklyAvailability;
  calendarDefinitionsRaw: unknown;
  openUntil?: Date | null;
  booked?: { start: Date; end: Date }[];
  /** רק כש־true — המטפל בחר להציג יומן ציבורי */
  enabled: boolean;
};

export function TherapistAppointmentCalendar({
  therapistUserId,
  therapistProfileId,
  availability,
  calendarDefinitionsRaw,
  openUntil,
  booked = [],
  enabled,
}: Props) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defCount = useMemo(() => parseCalendarSlotDefinitions(calendarDefinitionsRaw).length, [calendarDefinitionsRaw]);
  const hasWeeklyTemplate = useMemo(() => Object.keys(availability).length > 0, [availability]);
  const hasAvailability = defCount > 0 || hasWeeklyTemplate;

  const hasOpenSlots = useMemo(() => {
    if (!hasAvailability) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const slots = buildPublicOpenSlots(availability, calendarDefinitionsRaw, {
      weeksAhead: 8,
      weekStart: now,
      openUntil: openUntil ?? null,
      booked,
    });
    return slots.length > 0;
  }, [availability, calendarDefinitionsRaw, hasAvailability, openUntil, booked]);

  const [selected, setSelected] = useState<{ start: Date; end: Date } | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [openMsg, setOpenMsg] = useState<string | null>(null);
  const [openErr, setOpenErr] = useState<string | null>(null);

  const signInHref = useMemo(() => {
    const q = searchParams.toString();
    const returnTo = q ? `${pathname}?${q}` : pathname;
    return `/auth/signin?callbackUrl=${encodeURIComponent(returnTo)}`;
  }, [pathname, searchParams]);

  const isLoggedIn = status === "authenticated" && !!session?.user;

  if (!enabled) return null;

  return (
    <section id="therapist-booking" className="mt-14 scroll-mt-24 border-t border-neutral-200/90 pt-12" aria-labelledby="calendar-heading">
      <div className="flex flex-wrap items-center gap-3">
        <svg className="h-8 w-8 shrink-0 text-herbal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <div>
          <p id="calendar-heading" className="text-[11px] font-bold uppercase tracking-[0.36em] text-herbal-800/80">
            יומן ותיאום
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {hasOpenSlots
              ? "בחרו מועד פנוי (שעה אחת) או שלחו בקשה כללית למטה אם אין התאמה."
              : "אין מועדים פנויים לבחירה — ניתן לשלוח בקשת פגישה בטקסט חופשי."}
          </p>
        </div>
      </div>

      {openUntil ? (
        <p className="mt-2 text-xs text-slate-500">פתוח להזמנות עד {openUntil.toLocaleDateString("he-IL")}</p>
      ) : null}

      {hasAvailability && hasOpenSlots ? (
        <div className="mt-4">
          <AppointmentWeekDiary
            weeklyAvailability={availability}
            calendarDefinitionsRaw={calendarDefinitionsRaw}
            openUntil={openUntil}
            booked={booked}
            selected={isLoggedIn ? selected : null}
            onSelect={(slot) => {
              if (!isLoggedIn) return;
              setSelected(slot);
            }}
          />
        </div>
      ) : null}

      {!hasOpenSlots ? (
        <div className="mt-6 rounded-2xl border border-dashed border-herbal-200/90 bg-herbal-50/50 px-4 py-8 sm:py-10">
          <p className="text-center text-sm text-slate-700">
            {hasAvailability
              ? "אין כרגע מועדים פנויים בחלון הזמינות. ניתן לשלוח בקשת פגישה ונחזור אליכם."
              : "המטפל/ת עדיין לא הגדיר/ה מועדים ביומן — ניתן לשלוח בקשה ונתאם ישירות."}
          </p>
          {isLoggedIn && session?.user ? (
            <form
              className="mx-auto mt-6 max-w-md space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setOpenErr(null);
                setOpenMsg(null);
                const fd = new FormData(e.currentTarget);
                startTransition(async () => {
                  try {
                    const r = await submitOpenMeetingInquiry({
                      therapistUserId,
                      therapistProfileId,
                      message: String(fd.get("message") ?? ""),
                      guestPhone: String(fd.get("phone") ?? "") || undefined,
                    });
                    setOpenMsg(
                      r.emailSent ? "הבקשה נשלחה — המטפל/ת קיבלו הודעה במייל." : "הבקשה נשמרה במערכת. שליחת מייל אוטומטית תתאפשר כשהמערכת מוגדרת (Resend).",
                    );
                    (e.target as HTMLFormElement).reset();
                  } catch (ex) {
                    setOpenErr(ex instanceof Error ? ex.message : "שגיאה");
                  }
                });
              }}
            >
              <label className="block text-sm font-medium text-herbal-900">בקשת פגישה</label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="מתי נוח לכם, נושא הפגישה וכל פרט רלוונטי…"
                className="mt-1 w-full rounded-xl border border-herbal-200 px-3 py-2 text-sm"
              />
              <input
                name="phone"
                placeholder="נייד (אם שונה מהפרופיל)"
                className="w-full rounded-xl border border-herbal-200 px-3 py-2 text-sm"
                dir="ltr"
              />
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-herbal-600 py-2.5 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-60"
              >
                {pending ? "שולח…" : "שליחת בקשה"}
              </button>
              {openMsg ? <p className="text-center text-xs text-herbal-700">{openMsg}</p> : null}
              {openErr ? <p className="text-center text-xs text-rose-600">{openErr}</p> : null}
            </form>
          ) : (
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-center">
              <p className="text-sm text-amber-950">כדי לשלוח בקשת פגישה יש להתחבר.</p>
              <Link
                href={signInHref}
                className="mt-3 inline-flex rounded-full bg-herbal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-herbal-500"
              >
                התחברות
              </Link>
            </div>
          )}
        </div>
      ) : null}

      {!isLoggedIn && status !== "loading" && hasOpenSlots ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-center">
          <p className="text-sm text-amber-950">כדי לקבוע פגישה ממועד ביומן יש להתחבר.</p>
          <Link
            href={signInHref}
            className="mt-3 inline-flex rounded-full bg-herbal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-herbal-500"
          >
            התחברות
          </Link>
        </div>
      ) : null}

      {isLoggedIn && selected && session?.user && hasOpenSlots ? (
        <form
          key={`${session.user.email}-${selected.start.toISOString()}`}
          className="mt-6 max-w-md space-y-3 rounded-2xl border border-herbal-100 bg-herbal-50/40 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setErr(null);
            setMsg(null);
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              try {
                await requestAppointment({
                  therapistUserId,
                  therapistProfileId,
                  slotStart: selected.start.toISOString(),
                  slotEnd: selected.end.toISOString(),
                  guestName: String(fd.get("name") ?? ""),
                  guestEmail: String(fd.get("email") ?? ""),
                  guestPhone: String(fd.get("phone") ?? "") || undefined,
                  note: String(fd.get("note") ?? "") || undefined,
                });
                setMsg("הבקשה נשלחה — ממתין לאישור.");
                setSelected(null);
              } catch (ex) {
                setErr(ex instanceof Error ? ex.message : "שגיאה");
              }
            });
          }}
        >
          <p className="text-sm font-semibold text-herbal-900">
            בקשת פגישה ·{" "}
            {selected.start.toLocaleString("he-IL", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <input
            name="name"
            required
            readOnly
            defaultValue={session.user.name ?? ""}
            placeholder="שם"
            className="w-full rounded-lg border border-herbal-200 bg-white px-3 py-2 text-sm"
          />
          <input
            name="email"
            type="email"
            required
            readOnly
            defaultValue={session.user.email ?? ""}
            placeholder="אימייל"
            className="w-full rounded-lg border border-herbal-200 bg-white px-3 py-2 text-sm"
            dir="ltr"
          />
          <input name="phone" placeholder="טלפון (אופציונלי)" className="w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm" />
          <textarea name="note" rows={2} placeholder="הערה" className="w-full rounded-lg border border-herbal-200 px-3 py-2 text-sm" />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-herbal-600 py-2.5 text-sm font-semibold text-white hover:bg-herbal-500 disabled:opacity-60"
          >
            {pending ? "שולח…" : "בקשת פגישה"}
          </button>
          {msg ? <p className="text-xs text-herbal-700">{msg}</p> : null}
          {err ? <p className="text-xs text-rose-600">{err}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
