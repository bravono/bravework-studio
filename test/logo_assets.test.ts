import fs from "fs";
import path from "path";

describe("Web Logo Assets Suite", () => {
  const assetsDir = path.resolve(__dirname, "../public/assets");

  const requiredLogos = [
    {
      fileName: "Bravework_Studio-Logo-Color.png",
      variant: "green primary",
      expectedMinSize: 5000,
    },
    {
      fileName: "Bravework_Studio-Logo-Black.png",
      variant: "black monochrome",
      expectedMinSize: 5000,
    },
    {
      fileName: "Bravework_Studio-Logo-White.png",
      variant: "white dark-mode",
      expectedMinSize: 5000,
    },
    {
      fileName: "logo-green.png",
      variant: "clean alias green",
      expectedMinSize: 5000,
    },
    {
      fileName: "logo-black.png",
      variant: "clean alias black",
      expectedMinSize: 5000,
    },
    {
      fileName: "logo-white.png",
      variant: "clean alias white",
      expectedMinSize: 5000,
    },
  ];

  requiredLogos.forEach(({ fileName, variant, expectedMinSize }) => {
    it(`should have existing and non-empty asset for ${variant} (${fileName})`, () => {
      const filePath = path.join(assetsDir, fileName);
      expect(fs.existsSync(filePath)).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThanOrEqual(expectedMinSize);
    });
  });

  it("should have correct PNG header magic numbers for all logo files", () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    requiredLogos.forEach(({ fileName }) => {
      const filePath = path.join(assetsDir, fileName);
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(filePath, "r");
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);
      expect(buffer.equals(pngHeader)).toBe(true);
    });
  });
});
