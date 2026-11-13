import fs from "fs";
import path from "path";

const ROOT = "client/src";
const SKIP = ["pages/Login.jsx", "components/auth", "pages\\Login.jsx", "components\\auth"];

const RULES = [
  [/#38d5f0/gi, "#DBC9FA"],
  [/#7ee8fa/gi, "#EBDDFF"],
  [/#c084fc/gi, "#B79CF0"],
  [/rgba\(\s*56,\s*213,\s*240/g, "rgba(219, 201, 250"],
  [/rgba\(\s*126,\s*232,\s*250/g, "rgba(219, 201, 250"],
  [/rgba\(\s*168,\s*85,\s*247/g, "rgba(127, 255, 0"],
  [/rgba\(\s*6,\s*26,\s*43/g, "rgba(0, 24, 120"],
  [/rgba\(\s*6,\s*34,\s*53/g, "rgba(0, 24, 120"],
  [/from-aqua-400 to-neon-violet/g, "from-lav to-lav-200"],
  [/bg-aqua-500\/(\d+)/g, "bg-lav/$1"],
  [/from-aqua-500\/(\d+)/g, "from-lav/$1"],
  [/bg-neon-violet\/(\d+)/g, "bg-lav/$1"],
  [/text-white\/(?:35|40|45|50|55)\b/g, "text-white/70"],
  [/text-white\/60\b/g, "text-white/75"],
  [/text-white\/65\b/g, "text-white/80"],
];

let changed = 0;
const walk = (dir) => {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(jsx?|mjs)$/.test(f) && !SKIP.some((s) => p.includes(s))) {
      const before = fs.readFileSync(p, "utf8");
      let after = before;
      for (const [re, rep] of RULES) after = after.replace(re, rep);
      if (after !== before) {
        fs.writeFileSync(p, after);
        changed++;
        console.log("updated", p);
      }
    }
  }
};
walk(ROOT);
console.log(`Done: ${changed} files updated`);