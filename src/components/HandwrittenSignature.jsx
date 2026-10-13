import { useId } from "react";
import "../styles/handwritten-signature.scss";

// Trace the original ink, then reveal the unchanged bitmap in full.
const strokes = [
  { d: "M185 194 C190 228 177 258 107 310 L42 397 C15 437 75 398 130 381 C211 350 233 383 232 430", duration: .5, delay: 0 },
  { d: "M84 594 C260 389 481 207 625 133 C669 107 505 430 473 612", duration: .95, delay: .45 },
  { d: "M984 158 C949 155 922 185 902 228 C855 279 760 336 771 371 C791 408 975 259 1063 306 C1101 329 951 481 979 525 C1000 551 1173 410 1261 351", duration: 1, delay: 1.35 },
  { d: "M1461 197 C1464 242 1435 280 1410 344 C1470 263 1558 177 1585 203 L1560 285", duration: .45, delay: 2.3 },
  { d: "M1559 279 C1724 131 1920 24 1990 28 C2069 -3 1961 221 1891 432 C1852 547 1824 644 1816 708", duration: .85, delay: 2.7 },
];

export default function HandwrittenSignature({ label = "위운미 서명" }) {
  const maskId = `signature-${useId().replaceAll(":", "")}`;

  return (
    <svg className="signiture signature_draw" viewBox="0 0 7899 2809" role="img" aria-label={label}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="7899" height="2809">
          <g transform="scale(3.85693359375 3.8585164835)" fill="none" stroke="white" strokeWidth="200" strokeLinecap="round" strokeLinejoin="round">
            {strokes.map((stroke, index) => (
              <path key={index} className="signature_stroke" d={stroke.d} pathLength="1" style={{ "--stroke-duration": `${stroke.duration}s`, "--stroke-delay": `${stroke.delay}s` }} />
            ))}
          </g>
        </mask>
      </defs>
      <image href="/img/about_4_sig_2.png" width="7899" height="2809" mask={`url(#${maskId})`} />
      <image className="signature_complete" href="/img/about_4_sig_2.png" width="7899" height="2809" />
    </svg>
  );
}
