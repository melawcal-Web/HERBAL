/** Public detail page for a catalog / digital product. */
export function publicProductHref(productId: string): string {
  return `/products/${encodeURIComponent(productId)}`;
}

export function productAccessHref(accessToken: string): string {
  return `/access/${encodeURIComponent(accessToken)}`;
}
