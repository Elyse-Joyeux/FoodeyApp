const makeAvatar = (bg: string, fg: string, accent: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="32" fill="url(#bg)"/>
  <circle cx="64" cy="48" r="22" fill="${fg}" opacity=".92"/>
  <path d="M24 111c6-24 21-38 40-38s34 14 40 38" fill="${fg}" opacity=".92"/>
  <path d="M37 102c7-12 16-18 27-18s20 6 27 18" fill="none" stroke="#fff7ed" stroke-width="6" stroke-linecap="round" opacity=".7"/>
</svg>
`)}`;

export const AVATAR_PRESETS = [
  makeAvatar('#ffb84d', '#1f1308', '#f97316'),
  makeAvatar('#38bdf8', '#082f49', '#2563eb'),
  makeAvatar('#86efac', '#052e16', '#16a34a'),
  makeAvatar('#f0abfc', '#3b0764', '#9333ea'),
  makeAvatar('#fde68a', '#422006', '#d97706'),
];

export const DEFAULT_AVATAR = AVATAR_PRESETS[0];
