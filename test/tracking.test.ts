import { createTrackingId } from "@/lib/utils/tracking";

test("createTrackingId - should create a tracking ID with 3 alphanumeric characters, a dash followed by 6 digits", () => {
  expect(createTrackingId("3D Animation")).toMatch(/^[A-Za-z0-9]{3}-\d{6}$/g);
});
