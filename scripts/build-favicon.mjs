import fs from "fs";

const pngPath = "public/favicon.png";
const b64 = fs.readFileSync(pngPath).toString("base64");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Эпоха">
  <style>
    .favicon-icon { filter: none; }
    @media (prefers-color-scheme: dark) {
      .favicon-icon {
        filter: invert(0.93) sepia(0.15) saturate(0.35) hue-rotate(5deg) brightness(1.08);
      }
    }
  </style>
  <image class="favicon-icon" href="data:image/png;base64,${b64}" width="32" height="32" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

fs.writeFileSync("public/favicon.svg", svg);
console.log("Favicon SVG written to public/favicon.svg");
