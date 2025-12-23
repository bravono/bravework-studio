import { createTrackingId } from "@/lib/utils/tracking";

test("should create a tracking ID with first 3 characters of service type as prefix and first 6 digits of current timestamp as suffix", () => {
  expect(createTrackingId("Courier")).toMatch(/^[A-Za-z]{3}-\d{6}$/g);
});
