import {
  buildFacebookHref,
  buildInstagramHref,
  buildMailto,
  buildTelHref,
  buildWebsiteHref,
  buildWhatsAppHref,
  isProbablyValidEmail,
  type ParsedContactInfo,
  type ParsedSocialLinks,
} from "@/lib/therapist-contact";

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const btnBase =
  "inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-600 sm:w-auto sm:min-w-[200px]";

export function TherapistProfileContact({
  contact,
  social,
}: {
  contact: ParsedContactInfo;
  social: ParsedSocialLinks;
}) {
  const wa = contact.whatsapp ? buildWhatsAppHref(contact.whatsapp) : null;
  const phone = contact.phone?.trim();
  const email = contact.email?.trim();
  const emailOk = email && isProbablyValidEmail(email);
  const web = social.website ? buildWebsiteHref(social.website) : null;
  const ig = social.instagram ? buildInstagramHref(social.instagram) : null;
  const fb = social.facebook ? buildFacebookHref(social.facebook) : null;

  const hasAny = !!(wa || phone || emailOk || web || ig || fb);

  if (!hasAny) {
    return null;
  }

  return (
    <section className="mt-10 border-t border-herbal-100/90 pt-8">
      <h2 className="font-display text-xl text-herbal-900">יצירת קשר</h2>
      <p className="mt-1 text-sm text-slate-600">בחרו את ערוץ התקשורת הנוח לכם.</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBase} border-emerald-600/30 bg-emerald-600 text-white shadow-md hover:bg-emerald-500`}
          >
            <IconWhatsApp className="h-5 w-5 shrink-0" />
            WhatsApp
          </a>
        )}
        {phone && (
          <a href={buildTelHref(phone)} className={`${btnBase} border-herbal-200 bg-white text-herbal-900 hover:border-herbal-300 hover:bg-herbal-50`}>
            <IconPhone className="h-5 w-5 shrink-0 text-herbal-600" />
            חיוג
          </a>
        )}
        {emailOk && (
          <a href={buildMailto(email!)} className={`${btnBase} border-herbal-200 bg-white text-herbal-900 hover:border-herbal-300 hover:bg-herbal-50`}>
            <IconMail className="h-5 w-5 shrink-0 text-herbal-600" />
            אימייל
          </a>
        )}
        {ig && (
          <a
            href={ig}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBase} border-herbal-200 bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:opacity-95`}
          >
            <IconInstagram className="h-5 w-5 shrink-0" />
            Instagram
          </a>
        )}
        {fb && (
          <a
            href={fb}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBase} border-blue-700/40 bg-[#1877F2] text-white hover:bg-[#166fe5]`}
          >
            <IconFacebook className="h-5 w-5 shrink-0" />
            Facebook
          </a>
        )}
        {web && (
          <a
            href={web}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBase} border-herbal-200 bg-herbal-700 text-white hover:bg-herbal-600`}
          >
            <IconGlobe className="h-5 w-5 shrink-0" />
            אתר
          </a>
        )}
      </div>
      {contact.city?.trim() && (
        <p className="mt-4 text-sm text-slate-600">
          <span className="font-medium text-herbal-800">אזור פעילות: </span>
          {contact.city.trim()}
        </p>
      )}
    </section>
  );
}
