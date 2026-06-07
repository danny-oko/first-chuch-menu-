export function normalizeImageUrls(
  imageUrls: string[] | undefined,
  imageUrl?: string | null
): string[] {
  const fromList = (imageUrls ?? []).map((url) => url.trim()).filter(Boolean);
  if (fromList.length) return fromList;
  const single = imageUrl?.trim();
  return single ? [single] : [];
}

export function serializeImageUrls(urls: string[]): string {
  return JSON.stringify(urls.map((url) => url.trim()).filter(Boolean));
}

export function parseImageUrls(
  imageUrlsJson: string | null | undefined,
  imageUrl?: string | null
): string[] {
  if (imageUrlsJson) {
    try {
      const parsed = JSON.parse(imageUrlsJson) as unknown;
      if (Array.isArray(parsed)) {
        const urls = parsed
          .filter((value): value is string => typeof value === "string")
          .map((url) => url.trim())
          .filter(Boolean);
        if (urls.length) return urls;
      }
    } catch {
      /* fall through */
    }
  }
  return normalizeImageUrls(undefined, imageUrl);
}

export function formatDishResponse<
  T extends {
    imageUrl: string;
    imageUrls?: string | null;
  },
>(dish: T) {
  const imageUrls = parseImageUrls(dish.imageUrls, dish.imageUrl);
  return {
    ...dish,
    imageUrl: imageUrls[0] ?? dish.imageUrl,
    imageUrls,
  };
}
