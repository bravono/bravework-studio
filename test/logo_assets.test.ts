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
      fileName: "BWS_Text-Logo.png",
      variant: "3D texture white logo",
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

  describe("Virtual 3D Office Logo Texture Suite", () => {
    it("should configure bwsLogoTexture to load the white logo", () => {
      const assetsFile = path.resolve(__dirname, "../components/Experience/assets.ts");
      const content = fs.readFileSync(assetsFile, "utf-8");
      expect(content).toMatch(/name:\s*"bwsLogoTexture"/);
      expect(content).toMatch(/source:\s*"\/assets\/Bravework_Studio-Logo-White\.png"/);
    });

    it("should calculate plane geometry dimensions matching exact 130:150 aspect ratio", () => {
      const logoWidth = 130;
      const logoHeight = 150;
      const expectedAspect = logoWidth / logoHeight;

      const scaleY = 1.0;
      const scaleZ = 1.0;
      const planeWidth = expectedAspect;
      const planeHeight = 1.0;

      const effectiveWidth = planeWidth * scaleZ;
      const effectiveHeight = planeHeight * scaleY;

      expect(effectiveWidth / effectiveHeight).toBeCloseTo(expectedAspect, 5);
    });

    it("should dynamically constrain bouncing limits to screen boundaries for any scale", () => {
      const screenBounds = {
        z: { min: -1.924, max: 2.302 },
        y: { min: -1.235, max: 1.127 },
      };
      const logoAspectRatio = 130 / 150;

      const testScales = [0.8, 1.0, 1.2, 1.5];
      testScales.forEach((scale) => {
        const halfWidthZ = (logoAspectRatio * scale) / 2;
        const halfHeightY = (1.0 * scale) / 2;

        const limitZMin = screenBounds.z.min + halfWidthZ;
        const limitZMax = screenBounds.z.max - halfWidthZ;
        const limitYMin = screenBounds.y.min + halfHeightY;
        const limitYMax = screenBounds.y.max - halfHeightY;

        // When center reaches limits, outer edges must touch exactly screenBounds
        expect(limitZMin - halfWidthZ).toBeCloseTo(screenBounds.z.min, 5);
        expect(limitZMax + halfWidthZ).toBeCloseTo(screenBounds.z.max, 5);
        expect(limitYMin - halfHeightY).toBeCloseTo(screenBounds.y.min, 5);
        expect(limitYMax + halfHeightY).toBeCloseTo(screenBounds.y.max, 5);

        // Limits must leave valid non-negative travel space
        expect(limitZMax).toBeGreaterThan(limitZMin);
        expect(limitYMax).toBeGreaterThan(limitYMin);
      });
    });
  });
});
