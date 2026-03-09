import React, { useEffect, useMemo, useRef, useState } from "react";

const SYSTEMS = {
  "Stopper Master": {
    belts: 1,
    band: { h_mm: 50, l_mm: 2980 },
    logoMax: { h_mm: 28, w_mm: 150 },
    colors: ["blau", "rot", "schwarz", "rot-weiß", "gelb-schwarz"],
    styleLines: "standard",
  },
  "Stopper Point": {
    belts: 1,
    band: { h_mm: 50, l_mm: 2480 },
    logoMax: { h_mm: 28, w_mm: 150 },
    colors: ["blau", "rot", "schwarz"],
    styleLines: "standard",
  },
  "Stopper Twin": {
    belts: 2,
    band: { h_mm: 50, l_mm: 2480 },
    logoMax: { h_mm: 28, w_mm: 150 },
    colors: ["blau", "rot", "schwarz", "rot-weiß", "gelb-schwarz"],
    styleLines: "standard",
  },
  Tempaline: {
    belts: 1,
    band: { h_mm: 50, l_mm: 2080 },
    logoMax: { h_mm: 28, w_mm: 150 },
    colors: ["blau", "rot-weiß", "gelb-schwarz"],
    styleLines: "standard",
  },
  "Tempaline Style": {
    belts: 1,
    band: { h_mm: 27, l_mm: 2080 },
    logoMax: { h_mm: 23, w_mm: 150 },
    colors: ["rot", "schwarz"],
    styleLines: "none",
  },
};

const MAX_LOGOS = 4;
const SHOP_PRIMARY = "#009eaf";
const SHOP_PRIMARY_DARK = "#007f8c";
const CLAMP_OFFSET_MM = 200;

const COLOR_TRANSLATIONS = {
  blau: { de: "blau", en: "blue" },
  rot: { de: "rot", en: "red" },
  schwarz: { de: "schwarz", en: "black" },
  "rot-weiß": { de: "rot-weiß", en: "red / white" },
  "gelb-schwarz": { de: "gelb-schwarz", en: "yellow / black" },
};

function translateColor(color, lang) {
  const entry = COLOR_TRANSLATIONS[color];
  return entry?.[lang] || color;
}

const UI = {
  de: {
    pageTitle: "Absperrsystem mit Ihrem Logo konfigurieren",
    pageSubtitle1: "Laden Sie Ihr Logo hoch und gestalten Sie Ihr individuelles Absperrband.",
    pageSubtitle2: "Sehen Sie sofort eine Vorschau Ihres Systems und passen Sie Farben, Logoanzahl und Abstände nach Wunsch an.",
    system: "Absperrsystem",
    belts: "Bänder",
    length: "Länge",
    height: "Höhe",
    maxLogo: "Max. Logo",
    beltColor: "Gurtband-Farbe",
    logoCount: "Anzahl Logos (max. 4)",
    spacing: "Abstand zwischen Logos (mm)",
    reserved: "Die ersten {mm} mm ab Klemme sind reserviert.",
    print: "Druck: ein- oder beidseitig",
    oneSided: "Einseitig",
    twoSided: "Beidseitig",
    upload: "Logo hochladen",
    chooseLogo: "Logo auswählen (PNG/JPG/SVG)",
    selected: "Ausgewählt",
    logoSize: "Logo-Größe eingeben (mm)",
    logoHeight: "Höhe (mm)",
    logoWidth: "Breite (mm)",
    maxLogoHint: "Max. {h}×{w} mm. Überschreitungen werden proportional angepasst.",
    maxExceeded: "Hinweis: Maximale Logo-Größe überschritten – die Vorschau zeigt Ihre eingegebenen Maße, das Logo wird jedoch auf die erlaubte Größe skaliert.",
    totalLength: "Gesamtlänge benötigt",
    available: "verfügbar",
    reduceHint: "→ Abstand oder Anzahl verringern",
    ok: "(ok)",
    preview: "Vorschau",
    systemPhoto: "Foto des ausgewählten Systems",
    photo: "Foto",
    miniPreview: "Mini-Vorschau Gurtband",
    fullPreview: "Gesamt-Vorschau Gurtband",
    backside: "Rückseite (spiegelgleiche Platzierung)",
    summary: "Zusammenfassung",
    color: "Farbe",
    logos: "Logos",
    effectiveLogo: "Logo effektiv",
    scaled: "(skaliert)",
    pdfError: "PDF-Vorschau ist in dieser Umgebung nicht verfügbar. Bitte PNG/JPG/SVG hochladen.",
    imageError: "Bild konnte nicht geladen werden",
    loadError: "Ladefehler",
    noImage: "Kein Bild",
    language: "Sprache",
    german: "DE",
    english: "EN",
  },
  en: {
    pageTitle: "Configure your barrier system with your logo",
    pageSubtitle1: "Upload your logo and create your individual barrier belt.",
    pageSubtitle2: "See an instant preview of your system and adjust colors, number of logos and spacing as needed.",
    system: "Barrier system",
    belts: "Belts",
    length: "Length",
    height: "Height",
    maxLogo: "Max. logo",
    beltColor: "Belt color",
    logoCount: "Number of logos (max. 4)",
    spacing: "Spacing between logos (mm)",
    reserved: "The first {mm} mm from the cassette are reserved.",
    print: "Print: single- or double-sided",
    oneSided: "Single-sided",
    twoSided: "Double-sided",
    upload: "Upload logo",
    chooseLogo: "Choose logo (PNG/JPG/SVG)",
    selected: "Selected",
    logoSize: "Enter logo size (mm)",
    logoHeight: "Height (mm)",
    logoWidth: "Width (mm)",
    maxLogoHint: "Max. {h}×{w} mm. Oversized logos are scaled proportionally.",
    maxExceeded: "Note: Maximum logo size exceeded – the preview shows your entered dimensions, but the logo is scaled to the allowed size.",
    totalLength: "Total length required",
    available: "available",
    reduceHint: "→ reduce spacing or quantity",
    ok: "(ok)",
    preview: "Preview",
    systemPhoto: "Photo of the selected system",
    photo: "Photo",
    miniPreview: "Mini preview belt",
    fullPreview: "Full preview belt",
    backside: "Back side (mirrored placement)",
    summary: "Summary",
    color: "Color",
    logos: "Logos",
    effectiveLogo: "Effective logo",
    scaled: "(scaled)",
    pdfError: "PDF preview is not available in this environment. Please upload PNG/JPG/SVG.",
    imageError: "Image could not be loaded",
    loadError: "Loading error",
    noImage: "No image",
    language: "Language",
    german: "DE",
    english: "EN",
  },
};

function fmt(text, vars) {
  return String(text).replace(/\{(\w+)\}/g, (_, key) => (vars?.[key] !== undefined ? vars[key] : `{${key}}`));
}

const cls = (...s) => s.filter(Boolean).join(" ");

function fitLogoSize(origWmm, origHmm, maxWmm, maxHmm, bandH_mm) {
  if (!origWmm || !origHmm) return { w_mm: 0, h_mm: 0, scaled: false };
  const wr = maxWmm / origWmm;
  const hr = maxHmm / origHmm;
  const r = Math.min(1, wr, hr);
  let w_mm = origWmm * r;
  let h_mm = origHmm * r;
  let scaled = r < 1;
  const minMarginTotal = 2;
  const maxLogoHByBand = Math.max(1, bandH_mm - minMarginTotal);
  if (h_mm > maxLogoHByBand) {
    const f = maxLogoHByBand / h_mm;
    w_mm *= f;
    h_mm *= f;
    scaled = true;
  }
  return { w_mm, h_mm, scaled };
}

function useImageFromFile(file, t) {
  const [url, setUrl] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setErr(null);
    setUrl(null);
    if (!file) return;
    try {
      if (file.type === "application/pdf") {
        setErr(t.pdfError);
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => setErr(t.imageError);
      reader.onload = () => setUrl(typeof reader.result === "string" ? reader.result : null);
      reader.readAsDataURL(file);
    } catch (e) {
      setErr(e?.message || t.loadError);
    }
  }, [file, t]);

  return { url, error: err };
}

function BeltSVG({ bandH_mm, bandL_mm, color, styleLines, logos = [], scale }) {
  const width = Math.round(bandL_mm * scale);
  const height = Math.round(bandH_mm * scale);
  const stripesId = useMemo(() => `stripes-${color}-${Math.random().toString(36).slice(2, 7)}`, [color]);
  const stripePx = 35 * scale;

  const baseFill = (() => {
    if (color === "rot-weiß" || color === "gelb-schwarz") return `url(#${stripesId})`;
    if (color === "rot") return "#e11";
    if (color === "blau") return "#15c";
    if (color === "schwarz") return "#222";
    return "#888";
  })();

  const topBottom = (() => {
    if (styleLines !== "standard") return null;
    if (color === "rot" || color === "blau") return { color: "#000", t_mm: 5, offset_mm: 5 };
    if (color === "schwarz") return { color: "#fff", t_mm: 5, offset_mm: 5 };
    return null;
  })();

  return (
    <svg width={width} height={height} className="border rounded bg-white shadow">
      <defs>
        <pattern id={stripesId} width={stripePx * 2} height={stripePx * 2} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          {color === "rot-weiß" ? (
            <>
              <rect width={stripePx} height={stripePx * 2} fill="#e11" />
              <rect x={stripePx} width={stripePx} height={stripePx * 2} fill="#fff" />
            </>
          ) : (
            <>
              <rect width={stripePx} height={stripePx * 2} fill="#ff0" />
              <rect x={stripePx} width={stripePx} height={stripePx * 2} fill="#000" />
            </>
          )}
        </pattern>
      </defs>

      <rect x={0} y={0} width={width} height={height} fill={baseFill} />
      {topBottom && (
        <>
          <rect x={0} y={topBottom.offset_mm * scale} width={width} height={topBottom.t_mm * scale} fill={topBottom.color} />
          <rect x={0} y={height - (topBottom.offset_mm + topBottom.t_mm) * scale} width={width} height={topBottom.t_mm * scale} fill={topBottom.color} />
        </>
      )}
      <rect x={0} y={0} width={CLAMP_OFFSET_MM * scale} height={height} fill="rgba(0,0,0,0.08)" />

      {logos.map((lg, i) => (
        typeof lg?.imgUrl === "string" ? (
          <image
            key={i}
            href={lg.imgUrl}
            x={Math.round(lg.x_mm * scale)}
            y={Math.round(((bandH_mm - lg.h_mm) / 2) * scale)}
            width={Math.round(lg.w_mm * scale)}
            height={Math.round(lg.h_mm * scale)}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : null
      ))}
    </svg>
  );
}

function SpacingOverlay({ bandH_mm, bandL_mm, logos, spacingMm, scale, yOffset = 30 }) {
  const width = Math.round(bandL_mm * scale);
  const height = Math.round(bandH_mm * scale);
  const y = height + yOffset;
  const textY = y + 12;
  const segments = [];

  for (let i = 0; i < logos.length - 1; i++) {
    const aW = Number(logos[i]?.reqW_mm ?? logos[i]?.w_mm ?? 0);
    const aEnd = logos[i].x_mm + aW;
    const bStart = logos[i + 1].x_mm;
    segments.push({ x1: aEnd, x2: bStart, label: `${spacingMm} mm` });
  }

  if (logos.length > 0) {
    const last = logos[logos.length - 1];
    const lastW = Number(last?.reqW_mm ?? last?.w_mm ?? 0);
    const lastEnd = last.x_mm + lastW;
    if (lastEnd < bandL_mm) segments.push({ x1: lastEnd, x2: bandL_mm, label: `${Math.round(bandL_mm - lastEnd)} mm` });
  }

  return (
    <svg width={width} height={height + yOffset + 24} style={{ overflow: "visible" }}>
      <line x1={0} y1={y} x2={CLAMP_OFFSET_MM * scale} y2={y} stroke="#d00" strokeWidth={2} />
      <line x1={0} y1={y - 4} x2={0} y2={y + 4} stroke="#d00" strokeWidth={2} />
      <line x1={CLAMP_OFFSET_MM * scale} y1={y - 4} x2={CLAMP_OFFSET_MM * scale} y2={y + 4} stroke="#d00" strokeWidth={2} />
      <text x={(CLAMP_OFFSET_MM * scale) / 2} y={textY} fontSize={12} fill="#d00" textAnchor="middle">{`${CLAMP_OFFSET_MM} mm`}</text>
      {segments.map((s, idx) => {
        const x1 = Math.round(s.x1 * scale);
        const x2 = Math.round(s.x2 * scale);
        const mid = (x1 + x2) / 2;
        return (
          <g key={idx}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke="#d00" strokeWidth={2} />
            <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke="#d00" strokeWidth={2} />
            <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke="#d00" strokeWidth={2} />
            <text x={mid} y={textY} fontSize={12} fill="#d00" textAnchor="middle">{s.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function MiniPreview({ cfg, color, styleLines, logoUrl, logoDims, miniWidthPx }) {
  const miniL_mm = Math.min(900, cfg.band.l_mm);
  const scale = miniWidthPx / miniL_mm;
  const reqW = Number(logoDims?.w_mm ?? 0);
  const reqH = Number(logoDims?.h_mm ?? 0);
  const fitted = fitLogoSize(reqW, reqH, cfg.logoMax.w_mm, cfg.logoMax.h_mm, cfg.band.h_mm);
  const w_mm = fitted.w_mm;
  const h_mm = fitted.h_mm;
  const exceedsMax = reqW > cfg.logoMax.w_mm || reqH > cfg.logoMax.h_mm;

  const safeLogoUrl = typeof logoUrl === "string" ? logoUrl : null;
  const hasLogo = !!safeLogoUrl && w_mm > 0 && h_mm > 0;
  const logos = hasLogo ? [{ x_mm: (miniL_mm - w_mm) / 2, w_mm, h_mm, imgUrl: safeLogoUrl }] : [];

  const gaugeW = 150;
  const outerX = 70;
  const bandHeightPx = Math.round(cfg.band.h_mm * scale);
  const extraBottom = 26;
  const logoLeft = Math.round(((miniL_mm - w_mm) / 2) * scale);
  const logoRight = Math.round(((miniL_mm + w_mm) / 2) * scale);

  return (
    <div className="flex items-start gap-6 mt-4">
      <svg width={gaugeW} height={bandHeightPx + extraBottom}>
        <line x1={outerX} y1={extraBottom / 2} x2={outerX} y2={extraBottom / 2 + bandHeightPx} stroke="#d00" strokeWidth={2} />
        <line x1={outerX - 10} y1={extraBottom / 2} x2={outerX + 10} y2={extraBottom / 2} stroke="#d00" strokeWidth={2} />
        <line x1={outerX - 10} y1={extraBottom / 2 + bandHeightPx} x2={outerX + 10} y2={extraBottom / 2 + bandHeightPx} stroke="#d00" strokeWidth={2} />
        <text x={outerX - 40} y={extraBottom / 2 + bandHeightPx / 2} fill="#d00" fontSize={12} textAnchor="middle" transform={`rotate(-90 ${outerX - 40} ${extraBottom / 2 + bandHeightPx / 2})`}>
          {`${cfg.band.h_mm} mm`}
        </text>
      </svg>
      <div>
        <BeltSVG bandH_mm={cfg.band.h_mm} bandL_mm={miniL_mm} color={color} styleLines={styleLines} logos={logos} scale={scale} />
        {hasLogo && (
          <svg width={Math.round(miniL_mm * scale)} height={exceedsMax ? 44 : extraBottom}>
            <line x1={logoLeft} y1={12} x2={logoRight} y2={12} stroke="#d00" strokeWidth={2} />
            <line x1={logoLeft} y1={8} x2={logoLeft} y2={16} stroke="#d00" strokeWidth={2} />
            <line x1={logoRight} y1={8} x2={logoRight} y2={16} stroke="#d00" strokeWidth={2} />
            <text x={(logoLeft + logoRight) / 2} y={22} fontSize={12} fill={exceedsMax ? "#b45309" : "#d00"} textAnchor="middle">{`${Math.round(reqW)} mm`}</text>
            {exceedsMax && <text x={(logoLeft + logoRight) / 2} y={36} fontSize={11} fill="#666" textAnchor="middle">{`eff. ${Math.round(w_mm)} mm`}</text>}
          </svg>
        )}
      </div>
    </div>
  );
}

function SystemPhoto({ system, color, lang, t }) {
  const baseMap = {
    "Stopper Master": "/system-images/stopper-master.jpg",
    "Stopper Point": "/system-images/stopper-point.jpg",
    "Stopper Twin": "/system-images/stopper-twin.jpg",
    Tempaline: "/system-images/tempaline.jpg",
    "Tempaline Style": "/system-images/tempaline-style.jpg",
  };

  const slug = String(system).toLowerCase().replaceAll(" ", "-");
  const colorSlug = String(color).toLowerCase().replaceAll(" ", "-");
  const candidateColor = `/system-images/${slug}-${colorSlug}.jpg`;
  const fallback = baseMap[system] || null;

  const [src, setSrc] = useState(candidateColor);
  useEffect(() => setSrc(candidateColor), [candidateColor]);

  const handleErr = () => {
    if (fallback && src !== fallback) setSrc(fallback);
  };

  return (
    <div className="flex items-center gap-3">
      {src ? (
        <img src={src} onError={handleErr} alt={`${system} ${color}`} className="w-40 h-40 object-contain border rounded bg-white" />
      ) : (
        <div className="w-40 h-40 grid place-items-center border rounded text-xs text-gray-500">{t.noImage}</div>
      )}
      <div className="text-xs text-slate-500">{t.photo}: {system} – {translateColor(color, lang)}</div>
    </div>
  );
}

function SummaryFooter({ system, color, twoSided, logosCount, spacingMm, fitW, fitH, scaled, t, lang }) {
  return (
    <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-semibold mb-2 text-slate-900">{t.summary}</h3>
      <div className="text-sm grid grid-cols-2 md:grid-cols-3 gap-3">
        <div><span className="text-slate-500">{t.system}:</span> {system}</div>
        <div><span className="text-slate-500">{t.color}:</span> {translateColor(color, lang)}</div>
        <div><span className="text-slate-500">{t.print}:</span> {twoSided ? t.twoSided : t.oneSided}</div>
        <div><span className="text-slate-500">{t.logos}:</span> {logosCount}×</div>
        <div><span className="text-slate-500">{t.spacing}:</span> {spacingMm} mm</div>
        <div><span className="text-slate-500">{t.effectiveLogo}:</span> {Math.round(fitH)}×{Math.round(fitW)} mm {scaled ? t.scaled : ""}</div>
      </div>
    </div>
  );
}

export default function App() {
  const previewRef = useRef(null);
  const [bandPx, setBandPx] = useState(1100);
  const [lang, setLang] = useState("de");
  const t = UI[lang];

  useEffect(() => {
  const onR = () => {
    if (!previewRef.current) return;
    const w = previewRef.current.clientWidth || 1000;

    // verfügbare Breite im Preview-Container
    const available = Math.max(320, w - 64);

    setBandPx(Math.min(1750, available));
  };

  onR();
  window.addEventListener("resize", onR);
  return () => window.removeEventListener("resize", onR);
}, []);

  const [system, setSystem] = useState("Stopper Master");
  const cfg = SYSTEMS[system];
  const [color, setColor] = useState(cfg.colors[0]);
  const [logosCount, setLogosCount] = useState(1);
  const [spacingMm, setSpacingMm] = useState(200);
  const [twoSided, setTwoSided] = useState(false);
  const [upload, setUpload] = useState(null);
  const { url: logoUrl, error: logoErr } = useImageFromFile(upload, t);
  const [logoDimsMm, setLogoDimsMm] = useState(cfg.logoMax);

  useEffect(() => {
    setColor(SYSTEMS[system].colors[0]);
    setLogoDimsMm(SYSTEMS[system].logoMax);
  }, [system]);

  const scaleFull = bandPx / cfg.band.l_mm;
  const miniWidthPx = Math.max(520, Math.min(860, Math.floor(bandPx * 0.78)));

  const reqW = Number(logoDimsMm.w_mm || 0);
  const reqH = Number(logoDimsMm.h_mm || 0);
  const { w_mm: fitW, h_mm: fitH, scaled } = fitLogoSize(reqW, reqH, cfg.logoMax.w_mm, cfg.logoMax.h_mm, cfg.band.h_mm);

  const frontLogos = [];
  if (typeof logoUrl === "string" && reqW > 0 && reqH > 0 && fitW > 0 && fitH > 0) {
    let cursor = CLAMP_OFFSET_MM;
    for (let i = 0; i < Math.min(logosCount, MAX_LOGOS); i++) {
      frontLogos.push({ x_mm: cursor, w_mm: fitW, h_mm: fitH, reqW_mm: reqW, reqH_mm: reqH, imgUrl: logoUrl });
      cursor += reqW + (i < logosCount - 1 ? spacingMm : 0);
    }
  }

  const beltsToRender = cfg.belts === 2 ? [0, 1] : [0];
  const occupiedByLogos = reqW * Math.min(logosCount, MAX_LOGOS) + spacingMm * Math.max(0, Math.min(logosCount, MAX_LOGOS) - 1);
  const totalNeeded = CLAMP_OFFSET_MM + occupiedByLogos;
  const lengthExceeded = totalNeeded > cfg.band.l_mm;
  const dimsExceed = reqW > cfg.logoMax.w_mm || reqH > cfg.logoMax.h_mm;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbfc_0%,#eef7f8_100%)] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.pageTitle}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-500">{t.language}</span>
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button type="button" onClick={() => setLang("de")} className={cls("px-3 py-1 text-sm rounded-lg transition-colors", lang === "de" ? "text-white" : "text-slate-700")} style={lang === "de" ? { backgroundColor: SHOP_PRIMARY } : undefined}>{UI.de.german}</button>
              <button type="button" onClick={() => setLang("en")} className={cls("px-3 py-1 text-sm rounded-lg transition-colors", lang === "en" ? "text-white" : "text-slate-700")} style={lang === "en" ? { backgroundColor: SHOP_PRIMARY } : undefined}>{UI.en.english}</button>
            </div>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-600 mb-6 max-w-3xl">
          {t.pageSubtitle1}<br />{t.pageSubtitle2}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 rounded-2xl border border-slate-200 shadow-sm bg-white">
              <label className="block text-sm font-semibold mb-1">{t.system}</label>
              <select className="w-full border rounded p-2" value={system} onChange={(e) => setSystem(e.target.value)}>
                {Object.keys(SYSTEMS).map((name) => <option key={name}>{name}</option>)}
              </select>
              <div className="mt-2 text-xs text-slate-500">{t.belts}: {cfg.belts} · {t.length}: {cfg.band.l_mm} mm · {t.height}: {cfg.band.h_mm} mm · {t.maxLogo}: {cfg.logoMax.h_mm}×{cfg.logoMax.w_mm} mm</div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 shadow-sm bg-white">
              <label className="block text-sm font-semibold mb-1">{t.beltColor}</label>
              <div className="flex flex-wrap gap-2">
                {cfg.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cls("px-3 py-1 rounded-full border text-sm transition-all", color === c ? "ring-2 ring-offset-2 text-white border-transparent" : "border-slate-300 text-slate-700 bg-white hover:border-slate-400")}
                    style={color === c ? { backgroundColor: SHOP_PRIMARY } : undefined}
                    title={translateColor(c, lang)}
                  >
                    {translateColor(c, lang)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 shadow-sm bg-white space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">{t.logoCount}</label>
                <input type="number" min={0} max={MAX_LOGOS} value={logosCount} onChange={(e) => setLogosCount(parseInt(e.target.value || "0", 10))} className="w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t.spacing}</label>
                <input type="number" min={0} value={spacingMm} onChange={(e) => setSpacingMm(parseInt(e.target.value || "0", 10))} className="w-full border rounded p-2" />
                <p className="text-xs text-slate-500 mt-1">{fmt(t.reserved, { mm: CLAMP_OFFSET_MM })}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t.print}</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2"><input type="radio" name="side" checked={!twoSided} onChange={() => setTwoSided(false)} />{t.oneSided}</label>
                  <label className="flex items-center gap-2"><input type="radio" name="side" checked={twoSided} onChange={() => setTwoSided(true)} />{t.twoSided}</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">{t.upload}</label>
                <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-white font-medium cursor-pointer transition-colors shadow-sm hover:shadow" style={{ backgroundColor: SHOP_PRIMARY }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SHOP_PRIMARY_DARK)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SHOP_PRIMARY)}>
                  <span>{t.chooseLogo}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setUpload(e.target.files?.[0] || null)} />
                </label>
                {upload && <p className="text-xs text-slate-500 mt-2">{t.selected}: {upload.name}</p>}
                {logoErr && <p className="text-xs text-red-600 mt-1">{logoErr}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t.logoSize}</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" className="border rounded p-2" value={logoDimsMm.h_mm} onChange={(e) => setLogoDimsMm((d) => ({ ...d, h_mm: parseFloat(e.target.value || "0") }))} placeholder={t.logoHeight} min={1} />
                  <input type="number" className="border rounded p-2" value={logoDimsMm.w_mm} onChange={(e) => setLogoDimsMm((d) => ({ ...d, w_mm: parseFloat(e.target.value || "0") }))} placeholder={t.logoWidth} min={1} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{fmt(t.maxLogoHint, { h: cfg.logoMax.h_mm, w: cfg.logoMax.w_mm })}</p>
                {dimsExceed && <p className="text-xs text-amber-700 mt-1">{t.maxExceeded}</p>}
              </div>

              <div className="text-xs">
                <div className={lengthExceeded ? "text-red-600" : "text-green-700"}>{t.totalLength}: {Math.round(totalNeeded)} mm / {t.available}: {cfg.band.l_mm} mm {lengthExceeded ? t.reduceHint : t.ok}</div>
              </div>
            </div>
          </div>

          <div ref={previewRef} className="p-5 rounded-3xl border border-slate-200 shadow-sm bg-white overflow-hidden">
            <h2 className="font-semibold mb-3 text-slate-900">{t.preview}</h2>
            <div className="mb-6 border border-slate-200 rounded-2xl p-4 min-h-[180px] flex items-start gap-6 overflow-hidden bg-slate-50">
              <div className="w-[260px] h-[160px] border border-slate-200 rounded-xl grid place-items-center overflow-hidden bg-white">
                <SystemPhoto system={system} color={color} lang={lang} t={t} />
              </div>
              <div className="text-sm text-slate-500 self-center">{t.systemPhoto}</div>
            </div>

            {beltsToRender.map((idx) => (
              <div key={`mini-${idx}`} className="mb-6">
                <div className="text-xs font-medium text-slate-600 mb-1">{t.miniPreview} {idx + 1}</div>
                <MiniPreview cfg={cfg} color={color} styleLines={cfg.styleLines} logoUrl={logoUrl} logoDims={logoDimsMm} miniWidthPx={miniWidthPx} />
              </div>
            ))}

            <div className="h-px bg-slate-200 my-5" />

            {beltsToRender.map((idx) => (
              <div key={`full-${idx}`} className="mb-10">
                <div className="text-xs font-medium text-slate-600 mb-1">{t.fullPreview} {idx + 1}</div>
                <div className="relative max-w-full" style={{ overflow: "hidden", paddingBottom: "64px" }}>
                  <BeltSVG bandH_mm={cfg.band.h_mm} bandL_mm={cfg.band.l_mm} color={color} styleLines={cfg.styleLines} logos={logoUrl ? frontLogos : []} scale={scaleFull} />
                  {logoUrl && frontLogos.length > 0 && (
                    <div className="absolute left-0 top-0 pointer-events-none">
                      <SpacingOverlay bandH_mm={cfg.band.h_mm} bandL_mm={cfg.band.l_mm} logos={frontLogos} spacingMm={spacingMm} scale={scaleFull} />
                    </div>
                  )}
                </div>
                {twoSided && (
                  <div className="mt-6">
                    <div className="text-xs font-medium text-slate-600 mb-1">{t.backside}</div>
                    <BeltSVG bandH_mm={cfg.band.h_mm} bandL_mm={cfg.band.l_mm} color={color} styleLines={cfg.styleLines} logos={logoUrl ? frontLogos : []} scale={scaleFull} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <SummaryFooter system={system} color={color} twoSided={twoSided} logosCount={logosCount} spacingMm={spacingMm} fitW={fitW} fitH={fitH} scaled={scaled} t={t} lang={lang} />
      </div>
    </div>
  );
}
