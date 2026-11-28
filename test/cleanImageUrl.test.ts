import { cleanImageUrl } from "@/lib/utils/cleanImageUrl";

describe("cleanImageUrl utility", () => {
  const fallback = "/assets/Bravework_Studio-Logo-Color.png";

  it("should return the original URL when it is already a clean https URL", () => {
    const url = "https://live.staticflickr.com/65535/54854647075_a0993fef95.jpg";
    assertClean(cleanImageUrl(url), url);
  });

  it("should extract pure URL when given a Flickr embed snippet with HTML attributes", () => {
    const rawSnippet =
      '"\\https://live.staticflickr.com/65535/55269372986_042d362ed0_b.jpg\\\\" width=\\1024\\ height=\\572\\ alt=\\Unreal Engine + AI Professional Production Build Polished Releasable Games"';
    const expected = "https://live.staticflickr.com/65535/55269372986_042d362ed0_b.jpg";
    assertClean(cleanImageUrl(rawSnippet), expected);
  });

  it("should extract URL when wrapped in standard HTML img attributes", () => {
    const rawHtml =
      'https://live.staticflickr.com/65535/54869433903_ef1ca24998_b.jpg" width="956" height="1024" alt="Parker Van Lawrence';
    const expected = "https://live.staticflickr.com/65535/54869433903_ef1ca24998_b.jpg";
    assertClean(cleanImageUrl(rawHtml), expected);
  });

  it("should clean trailing backslashes and quotes", () => {
    const raw = '"https://example.com/image.png\\\\"';
    const expected = "https://example.com/image.png";
    assertClean(cleanImageUrl(raw), expected);
  });

  it("should preserve valid relative paths", () => {
    const relative = "/assets/kids/hero_character.png";
    assertClean(cleanImageUrl(relative), relative);
  });

  it("should return default fallback logo on empty, null, undefined, or invalid inputs", () => {
    assertClean(cleanImageUrl(""), fallback);
    assertClean(cleanImageUrl(null), fallback);
    assertClean(cleanImageUrl(undefined), fallback);
    assertClean(cleanImageUrl("   "), fallback);
    assertClean(cleanImageUrl(12345), fallback);
    assertClean(cleanImageUrl({}), fallback);
  });
});

function assertClean(actual: string, expected: string) {
  expect(actual).toBe(expected);
}
