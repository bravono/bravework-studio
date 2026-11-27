import fs from "fs";
import path from "path";
import os from "os";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { patchNextFont } = require("../scripts/patch-next-font");

describe("patchNextFont", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "patch-test-"));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("successfully patches unpatched loader file", () => {
    const fakeLoaderPath = path.join(tempDir, "loader.js");
    const unpatchedCode = `
      function someLoader() {
        const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];
        return ext;
      }
    `;
    fs.writeFileSync(fakeLoaderPath, unpatchedCode, "utf8");

    const result = patchNextFont(fakeLoaderPath);
    expect(result).toBe(true);

    const patchedContent = fs.readFileSync(fakeLoaderPath, "utf8");
    expect(patchedContent).toContain("const extMatch =");
    expect(patchedContent).toContain("const ext = extMatch ? extMatch[1] : 'woff2';");
    expect(patchedContent).not.toContain("const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];");
  });

  it("handles already patched loader file gracefully", () => {
    const fakeLoaderPath = path.join(tempDir, "loader.js");
    const alreadyPatchedCode = `
      function someLoader() {
        const extMatch = /\\.(woff|woff2|eot|ttf|otf)($|\\?)/.exec(googleFontFileUrl); const ext = extMatch ? extMatch[1] : 'woff2';
        return ext;
      }
    `;
    fs.writeFileSync(fakeLoaderPath, alreadyPatchedCode, "utf8");

    const result = patchNextFont(fakeLoaderPath);
    expect(result).toBe(true);
  });

  it("returns false if file does not exist", () => {
    const nonExistentPath = path.join(tempDir, "does-not-exist.js");
    const result = patchNextFont(nonExistentPath);
    expect(result).toBe(false);
  });

  it("returns false if target pattern is not found in file", () => {
    const fakeLoaderPath = path.join(tempDir, "loader.js");
    const arbitraryCode = `
      function unrelatedCode() {
        return 42;
      }
    `;
    fs.writeFileSync(fakeLoaderPath, arbitraryCode, "utf8");

    const result = patchNextFont(fakeLoaderPath);
    expect(result).toBe(false);
  });
});
