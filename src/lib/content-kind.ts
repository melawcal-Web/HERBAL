import type { ContentKind, ProductType } from "@prisma/client";

export function productTypeToContentKind(type: ProductType): ContentKind {
  switch (type) {
    case "workshop":
      return "course";
    case "zoom":
      return "zoom";
    case "supervision":
      return "supervision";
    case "video":
      return "video";
    case "podcast":
      return "podcast";
    case "recipe":
      return "recipe";
    case "lecture":
      return "lecture";
    default:
      return "shelf_product";
  }
}
