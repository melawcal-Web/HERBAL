import type { TherapistPaymentMethodId } from "@/lib/therapist-payments";

/** Official-style wordmarks, sized for mobile tap targets (min ~32px). */
export function PaymentMethodLogo({
  method,
  className = "h-8 w-auto sm:h-9",
}: {
  method: TherapistPaymentMethodId;
  className?: string;
}) {
  switch (method) {
    case "bit":
      return <BitLogo className={className} />;
    case "paybox":
      return <PayBoxLogo className={className} />;
    case "grow":
      return <GrowLogo className={className} />;
  }
}

function BitLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 88 36" role="img" aria-label="Bit">
      <rect width="88" height="36" rx="8" fill="#F5C400" />
      <text
        x="44"
        y="25"
        textAnchor="middle"
        fill="#111"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="20"
        fontWeight="800"
        letterSpacing="-0.04em"
      >
        bit
      </text>
    </svg>
  );
}

function PayBoxLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 132 36" role="img" aria-label="PayBox">
      <rect width="132" height="36" rx="8" fill="#0E8A7D" />
      <text
        x="66"
        y="24.5"
        textAnchor="middle"
        fill="#fff"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="16"
        fontWeight="800"
        letterSpacing="0.01em"
      >
        PayBox
      </text>
    </svg>
  );
}

function GrowLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 108 36" role="img" aria-label="Grow">
      <rect width="108" height="36" rx="8" fill="#5B4BFF" />
      <text
        x="54"
        y="24.5"
        textAnchor="middle"
        fill="#fff"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="16"
        fontWeight="800"
        letterSpacing="0.02em"
      >
        Grow
      </text>
    </svg>
  );
}
