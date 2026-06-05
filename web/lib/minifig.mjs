/**
 * Generated LEGO-minifig avatars for person nodes in the relationship graph.
 *
 * A minifig is a GENERIC, NON-IDENTIFYING bust — never a real likeness — so it stays inside the
 * archive's no-PII ethics guard (DISCLAIMER.md). It only ever replaces the initials fallback for
 * `person` nodes with no real linked icon.
 *
 * Selected by a compact code: group(p|b|c) gender(m|f) age(y|a|e). The code is canonicalised
 * (missing axes default to c/m/a) then matched to the nearest DRAWN figure by edit distance —
 * `young` is not drawn, so it degrades to the adult figure. Mirrors lib/brick-svg.mjs.
 */

const HEAD = `<rect x="28" y="22" width="24" height="27" rx="7" fill="#f2cd37"/>`;
const NECK = `<rect x="35.5" y="45" width="9" height="7" fill="#e3b81f"/>`;
const EYES =
  `<circle cx="35" cy="34" r="1.7" fill="#3a2c00"/><circle cx="45" cy="34" r="1.7" fill="#3a2c00"/>`;
const SMILE =
  `<path d="M34.5 39 Q40 43.5 45.5 39" stroke="#3a2c00" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
const LIPS =
  `<path d="M35.5 39 Q40 43.2 44.5 39" stroke="#c0392b" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
const LASHES =
  `<path d="M32.6 32.2 L34.4 33.2 M44.6 33.2 L46.4 32.2" stroke="#3a2c00" stroke-width="0.9" stroke-linecap="round"/>`;
const GLASSES =
  `<g fill="none" stroke="#34383e" stroke-width="1.25">` +
  `<circle cx="35" cy="34" r="3.1"/><circle cx="45" cy="34" r="3.1"/>` +
  `<line x1="38.1" y1="34" x2="41.9" y2="34"/>` +
  `<line x1="31.9" y1="33.4" x2="29.2" y2="32.6"/><line x1="48.1" y1="33.4" x2="50.8" y2="32.6"/></g>`;
const GREY_BROWS =
  `<path d="M32.4 30.6 Q35 29.8 37.6 30.6 M42.4 30.6 Q45 29.8 47.6 30.6" ` +
  `stroke="#b9bdc4" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
const POLICE_CAP =
  `<path d="M26 24 Q40 12 54 24 Z" fill="#16294b"/>` +
  `<rect x="24" y="23.5" width="32" height="4.5" rx="2.2" fill="#0d1b35"/>` +
  `<rect x="37" y="17.5" width="6" height="3.4" rx="1" fill="#0d1b35"/>` +
  `<circle cx="40" cy="20.5" r="1.7" fill="#f4c542"/>`;

const BG = { p: "#dfe7f2", b: "#ece6da", c: "#e6efe9" };

// Drawn catalog, ordered so edit-distance ties favour the defaults
// (adult before elder, male before female, c before b before p).
const DRAWN = ["cma", "cme", "cfa", "cfe", "bma", "bme", "bfa", "bfe", "pma", "pme", "pfa", "pfe"];

function torso(g, female) {
  if (g === "p") {
    return (
      `<path d="M14 80 L19 57 Q40 50 61 57 L66 80 Z" fill="#1f3f74"/>` +
      `<path d="M33 55 L40 67 L47 55 Z" fill="#e7edf6"/>` +
      `<rect x="38.4" y="56" width="3.2" height="12" fill="#10264a"/>` +
      `<circle cx="25" cy="68" r="3.4" fill="#f4c542"/>`
    );
  }
  if (g === "b") {
    const tie = female ? "#7a4ea0" : "#b23b3b";
    return (
      `<path d="M14 80 L19 57 Q40 50 61 57 L66 80 Z" fill="#2d323b"/>` +
      `<path d="M30 55 L40 60 L50 55 L47 80 L33 80 Z" fill="#f3f1ec"/>` +
      `<path d="M40 56 L43 60 L41.5 73 L40 76 L38.5 73 L37 60 Z" fill="${tie}"/>` +
      `<path d="M30 55 L40 67 L36 56 Z" fill="#23272e"/><path d="M50 55 L40 67 L44 56 Z" fill="#23272e"/>`
    );
  }
  const shirt = female ? "#c65d8a" : "#2f9e63";
  const fold = female ? "#a84a72" : "#268052";
  return (
    `<path d="M14 80 L19 57 Q40 50 61 57 L66 80 Z" fill="${shirt}"/>` +
    `<path d="M33 55 L40 62 L47 55 L45 58 L40 60 L35 58 Z" fill="${fold}"/>`
  );
}

// { behind, front }: hair behind the head (side locks) and in front (top).
function hair(g, female, elder) {
  if (female) {
    const top = elder ? "#d3d7dc" : "#3a2412";
    const lock = elder ? "#cdd1d6" : "#3a2412";
    const locks =
      `<path d="M25.5 31 Q24 54 32 58 L34.5 51 Q29 47 29.5 33 Z" fill="${lock}"/>` +
      `<path d="M54.5 31 Q56 54 48 58 L45.5 51 Q51 47 50.5 33 Z" fill="${lock}"/>`;
    const topHair =
      g === "p"
        ? "" // police cap hides the crown
        : `<path d="M27 31 Q27 18 40 18 Q53 18 53 31 L53 26 Q50 21.5 40 21.5 Q30 21.5 27 26 Z" fill="${top}"/>`;
    return { behind: locks, front: topHair };
  }
  if (g === "p") return { behind: "", front: "" }; // male/neutral hair hidden by cap
  const c = elder ? "#d3d7dc" : "#5b3a1d";
  return {
    behind: "",
    front: `<path d="M28 30 Q28 19 40 19 Q52 19 52 30 L52 26 Q49 22.5 40 22.5 Q31 22.5 28 26 Z" fill="${c}"/>`,
  };
}

// Parse tokens (first per axis wins); default missing axes to c / m / a.
function canonicalize(code) {
  let g, x, a;
  for (const ch of String(code || "").toLowerCase()) {
    if (g === undefined && "pbc".includes(ch)) g = ch;
    else if (x === undefined && "mf".includes(ch)) x = ch;
    else if (a === undefined && "yae".includes(ch)) a = ch;
  }
  return (g || "c") + (x || "m") + (a || "a");
}

function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return d[m][n];
}

function nearestDrawn(code) {
  let best = DRAWN[0], bestD = Infinity;
  for (const d of DRAWN) {
    const dist = lev(code, d);
    if (dist < bestD) { bestD = dist; best = d; } // first minimum wins (DRAWN is default-ordered)
  }
  return best;
}

export function minifigSvg(code) {
  const c = nearestDrawn(canonicalize(code));
  const g = c[0], female = c[1] === "f", elder = c[2] === "e";
  const h = hair(g, female, elder);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">` +
    `<rect width="80" height="80" fill="${BG[g]}"/>` +
    torso(g, female) +
    h.behind +
    NECK +
    HEAD +
    h.front +
    (g === "p" ? POLICE_CAP : "") +
    EYES +
    (elder ? GREY_BROWS : "") +
    (elder ? GLASSES : "") +
    (female ? LIPS : SMILE) +
    (female ? LASHES : "") +
    `</svg>`
  );
}

export function minifigDataUri(code) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(minifigSvg(code));
}
