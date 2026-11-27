const fs = require("fs");
const path = require("path");

function patchNextFont(customPath) {
  const loaderPath =
    customPath ||
    path.join(
      __dirname,
      "..",
      "node_modules",
      "next",
      "dist",
      "compiled",
      "@next",
      "font",
      "dist",
      "google",
      "loader.js"
    );

  if (!fs.existsSync(loaderPath)) {
    console.warn("[patch-next-font] loader.js not found at:", loaderPath);
    return false;
  }

  let content = fs.readFileSync(loaderPath, "utf8");
  const target =
    "const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];";
  const replacement =
    "const extMatch = /\\.(woff|woff2|eot|ttf|otf)($|\\?)/.exec(googleFontFileUrl); const ext = extMatch ? extMatch[1] : 'woff2';";

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(loaderPath, content, "utf8");
    console.log("[patch-next-font] Successfully patched @next/font loader.js");
    return true;
  } else if (content.includes("const extMatch =")) {
    console.log("[patch-next-font] @next/font loader.js is already patched");
    return true;
  } else {
    console.warn("[patch-next-font] Target regex pattern not found in loader.js");
    return false;
  }
}

if (require.main === module) {
  patchNextFont();
}

module.exports = { patchNextFont };
