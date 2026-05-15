"use client";

import { useEffect, useRef } from "react";
import { logContentEvent } from "@/app/actions/commerce";
import type { ContentKind, PriceCategory } from "@prisma/client";

type Props = {
  therapistId: string;
  contentKind: ContentKind;
  contentId: string;
  contentTitle: string;
  priceCategory: PriceCategory;
};

/** רושם צפייה אחת בטעינת דף תוכן */
export function ContentAccessLogger({ therapistId, contentKind, contentId, contentTitle, priceCategory }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void logContentEvent({
      therapistId,
      contentKind,
      contentId,
      contentTitle,
      eventType: "view",
      priceCategory,
      amountNis: 0,
    }).catch(() => {
      sent.current = false;
    });
  }, [therapistId, contentKind, contentId, contentTitle, priceCategory]);

  return null;
}
