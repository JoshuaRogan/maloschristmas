import styled, { keyframes } from 'styled-components';

// Festive shimmer animation
const shimmer = keyframes`
  0% { transform: translateX(-60%); opacity: 0.15; }
  50% { opacity: 0.35; }
  100% { transform: translateX(120%); opacity: 0; }
`;
const sparkle = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.35); }
`;
export const AllTimeTotalBar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  padding: 0.85rem 1.6rem 0.9rem;
  margin: 0 auto 1.05rem;
  border-radius: 26px;
  background:
    radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.15), transparent 70%),
    linear-gradient(135deg, #1c4d30, #144026 55%, #123325);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 8px 22px -10px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  overflow: hidden;
  max-width: 760px;
  .label {
    text-transform: uppercase;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 1.6px;
    opacity: 0.8;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  strong {
    font-size: 2.2rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 1px;
    background: linear-gradient(90deg, #ffe8a3, #fff5d2 45%, #ffe8a3 90%);
    -webkit-background-clip: text;
    color: transparent;
    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.45);
    position: relative;
  }
  .emoji {
    font-size: 1.55rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  }
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -35%;
    width: 40%;
    height: 100%;
    background: linear-gradient(
      100deg,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.25) 45%,
      rgba(255, 255, 255, 0)
    );
    animation: ${shimmer} 5.5s linear infinite;
    pointer-events: none;
  }
  &:after {
    content: '';
    position: absolute;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #fff, rgba(255, 255, 255, 0));
    top: 14px;
    right: 22px;
    opacity: 0.65;
    animation: ${sparkle} 3.4s ease-in-out infinite 0.6s;
    pointer-events: none;
  }
  @media (max-width: 700px) {
    strong {
      font-size: 1.9rem;
    }
    padding: 0.75rem 1.2rem 0.8rem;
  }
`;
export const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  padding: 1.2rem 1.75rem 4.5rem;
  background:
    radial-gradient(circle at 20% 15%, rgba(220, 40, 40, 0.15), transparent 60%),
    radial-gradient(circle at 80% 85%, rgba(220, 40, 40, 0.08), transparent 55%),
    linear-gradient(135deg, #0c2817, #0f3a22 55%, #102c33 85%);
  color: #f6fbf7;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 19px;
  overflow-x: hidden;
  @media (max-width: 700px) {
    padding: 1rem 1rem 3.5rem;
    font-size: 17px;
  }
`;
export const Title = styled.h1`
  margin: 0 0 1.1rem;
  font-size: 3rem;
  text-align: center;
  letter-spacing: 1.5px;
  font-weight: 700;
  background: linear-gradient(90deg, #e8d5a6, #f5f1e3);
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  @media (max-width: 900px) {
    font-size: 2.55rem;
  }
  @media (max-width: 700px) {
    font-size: 2.25rem;
  }
  @media (max-width: 420px) {
    font-size: 1.9rem;
  }
`;
export const Card = styled.div`
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.04));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  padding: 1.05rem 1.35rem 1.35rem;
  box-shadow: 0 6px 18px -6px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  @media (max-width: 700px) {
    padding: 0.95rem 1rem 1.05rem;
    border-radius: 14px;
  }
`;
export const CardTitle = styled.h2`
  font-size: 1.3rem;
  margin: 0 0 0.85rem;
  font-weight: 600;
  letter-spacing: 0.75px;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: #f3f8f4;
`;
export const Select = styled.select`
  background: linear-gradient(140deg, #185c38, #134d30);
  /* Windows (some Edge/Chrome builds) were dropping gradient & keeping light system bg, causing white-on-white.
     Provide solid fallback + option styling to ensure contrast. */
  background-color: #185c38; /* fallback solid color */
  color: #f7fff9;
  border: 1px solid #2a7a4d;
  padding: 0.75rem 2.75rem 0.75rem 1rem;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  outline: none;
  margin-left: 0;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.05) inset,
    0 2px 6px -2px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  line-height: 1.1;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  color-scheme: dark; /* hint for Windows */
  transition:
    background 0.3s,
    box-shadow 0.3s,
    border-color 0.3s;
  &::-ms-expand {
    /* hide old IE/Edge arrow */
    display: none;
  }
  option {
    background: #134d30; /* ensure dark menu */
    color: #f7fff9;
  }
  &:hover {
    background: linear-gradient(140deg, #1d7146, #155836);
  }
  &:focus {
    box-shadow:
      0 0 0 2px #2fa567,
      0 2px 8px -2px rgba(0, 0, 0, 0.55);
  }
  @media (forced-colors: active) {
    /* High contrast mode (Windows) */
    background: Canvas;
    color: CanvasText;
    border-color: ButtonBorder;
    option {
      background: Canvas;
      color: CanvasText;
    }
  }
`;
export const YearSelectWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: stretch;
  &:after {
    content: '';
    position: absolute;
    pointer-events: none;
    right: 14px;
    top: 50%;
    width: 10px;
    height: 10px;
    margin-top: -5px;
    background: linear-gradient(135deg, #f0f9f2, #d3efe0);
    clip-path: polygon(50% 65%, 0 0, 100% 0);
    opacity: 0.9;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
    transition: transform 0.25s;
  }
  &:focus-within:after {
    transform: translateY(2px) rotate(180deg);
  }
`;
export const YearNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  flex-wrap: wrap;
`;
export const YearArrow = styled.button`
  background: linear-gradient(140deg, #1d6d42, #155232);
  color: #fff;
  border: 1px solid #248553;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px -2px rgba(0, 0, 0, 0.5);
  transition:
    background 0.25s,
    transform 0.15s,
    box-shadow 0.25s;
  &:hover:not(:disabled) {
    background: #208a52;
    box-shadow: 0 4px 10px -4px rgba(0, 0, 0, 0.55);
  }
  &:active:not(:disabled) {
    transform: scale(0.92);
  }
  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;
export const WinnerHighlight = styled.div`
  grid-column: 1 / -1;
  position: relative;
  padding: 1rem 1.2rem 1.1rem;
  border-radius: 18px;
  background:
    radial-gradient(circle at 78% 22%, rgba(255, 255, 255, 0.15), transparent 65%),
    linear-gradient(120deg, #246a3e, #1c5230 55%, #154427);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 10px 28px -10px rgba(0, 0, 0, 0.65),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: flex-start;
  overflow: visible;
  &:before,
  &:after {
    content: '';
    position: absolute;
    width: 260px;
    height: 260px;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25), transparent 70%);
    top: -140px;
    right: -120px;
    opacity: 0.25;
    pointer-events: none;
    filter: blur(2px);
  }
  &:after {
    top: auto;
    bottom: -150px;
    left: -120px;
    right: auto;
    background: radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.18), transparent 75%);
  }
`;
export const WinnerTitle = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  background: linear-gradient(90deg, #ffe8a3, #fff1c9);
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
`;
export const WinnerNames = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
`;
export const WinnerBadge = styled.span`
  background: linear-gradient(145deg, #ffcf4d, #ffb347);
  color: #2b2b1a;
  padding: 0.4rem 0.75rem 0.45rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  box-shadow: 0 4px 10px -4px rgba(0, 0, 0, 0.6);
`;
export const WinnerPerson = styled.div`
  position: relative;
  padding: 0.55rem 0.85rem 0.6rem 1rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #2b9348, #1d6d34);
  font-size: 0.95rem;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  box-shadow:
    0 6px 14px -6px rgba(0, 0, 0, 0.65),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  min-width: 160px;
`;
export const WinnerMeta = styled.div`
  font-size: 0.6rem;
  letter-spacing: 0.6px;
  opacity: 0.8;
  text-transform: uppercase;
  font-weight: 600;
`;
export const WinnerGuess = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
`;
export const WinnersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 1rem 1.1rem;
`;
export const StatBoxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.65rem 0.75rem;
  margin-top: 0.4rem;
`;
export const StatBox = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 0.55rem 0.6rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
  overflow: hidden;
  min-height: 70px;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 42px;
    height: 42px;
    background: radial-gradient(circle at 65% 35%, rgba(255, 255, 255, 0.18), transparent 70%);
    opacity: 0.35;
    pointer-events: none;
  }
`;
export const StatLabel = styled.div`
  font-size: 0.7rem;
  letter-spacing: 1px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.7;
`;
export const StatValue = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.6px;
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  flex-wrap: wrap;
  @media (max-width: 600px) {
    font-size: 1.15rem;
  }
`;
export const StatMeta = styled.div`
  font-size: 0.7rem;
  opacity: 0.6;
  line-height: 1.25;
  letter-spacing: 0.5px;
`;
export const Stat = styled.div`
  font-size: 1rem;
  margin-top: 0.35rem;
  opacity: 0.9;
`;
export const Footer = styled.footer`
  text-align: center;
  margin-top: 2.4rem;
  font-size: 0.75rem;
  opacity: 0.65;
  letter-spacing: 0.5px;
`;
export const Loading = styled.div`
  text-align: center;
  padding: 3.25rem 1rem;
  font-size: 1.25rem;
  letter-spacing: 1.2px;
`;
export const TableScroll = styled.div`
  overflow-y: auto;
  max-height: ${(props) => props.$maxHeight || 320}px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #2c6d89 transparent;
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(#245a72, #1d485b);
    border-radius: 20px;
  }
`;
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  th,
  td {
    padding: 6px 8px;
  }
  thead tr {
    position: sticky;
    top: 0;
    z-index: 5;
    background: #10344c;
    box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.55);
  }
  thead th {
    font-weight: 600;
    font-size: 0.7rem;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    opacity: 0.9;
  }
  tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.035);
  }
  tbody tr:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  tbody tr.highlight {
    background: linear-gradient(90deg, #2b9348, #1d6d34);
  }
  tbody tr.highlight.over {
    background: linear-gradient(90deg, #b3541e, #8a3f15);
  }
`;
export const TooltipBox = styled.div`
  background: #114229;
  color: #fff;
  border: 1px solid #2d7a4d;
  padding: 0.6rem 0.7rem 0.65rem;
  font-size: 0.8rem;
  line-height: 1.25;
  border-radius: 10px;
  box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.6);
  max-width: 200px;
`;
export const GroupWrapper = styled.div`
  margin-top: 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 1rem 1.1rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  @media (max-width: 700px) {
    padding: 0.85rem 0.75rem 1rem;
    border-radius: 12px;
  }
`;
export const YearGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  align-items: stretch;
  gap: 1rem 1.1rem;
  @media (min-width: 1200px) {
    grid-template-columns: minmax(320px, 380px) 1fr;
  }
`;
export const YearLeaderboardLayout = styled.div`
  display: flex;
  gap: 1.1rem;
  align-items: stretch;
  flex: 1 1 auto;
  min-height: 0;
`;
export const WinnerImageBox = styled.div`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 6px 14px -6px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  border-radius: 18px;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  width: 170px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  &:hover {
    transform: scale(1.02);
    box-shadow:
      0 8px 18px -6px rgba(0, 0, 0, 0.65),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }
  &:active {
    transform: scale(0.97);
  }
  &.portrait {
    width: 130px;
  }
  @media (max-width: 600px) {
    width: 140px;
    &.portrait {
      width: 120px;
    }
  }
`;
export const WinnerImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  max-width: 100%;
  border-radius: calc(18px - 4px); /* match container radius minus padding for clean alignment */
`;
// New loading indicator for winner image (non-carousel)
const winnerImgSpin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
export const ImageLoadingIndicator = styled.div`
  position: absolute;
  inset: 4px; /* align with padding of box */
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.05));
  border-radius: 14px;
  &:before {
    content: '';
    width: 34px;
    height: 34px;
    border: 3px solid rgba(255, 255, 255, 0.25);
    border-top-color: #ffe8a3;
    border-radius: 50%;
    animation: ${winnerImgSpin} 0.85s linear infinite;
    box-shadow: 0 0 8px -2px rgba(0, 0, 0, 0.6);
  }
`;
export const LeaderboardTableCol = styled.div`
  flex: 1 1 320px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;
export const CarouselOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.2rem;
`;
export const CarouselContent = styled.div`
  position: relative;
  max-width: 95vw;
  max-height: 90vh;
  width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;
export const CarouselImageWrap = styled.div`
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: #0b2416;
  box-shadow: 0 12px 32px -10px rgba(0, 0, 0, 0.75);
  img {
    max-width: 100%;
    max-height: 75vh;
    object-fit: contain;
  }
`;
export const CarouselNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  width: 54px;
  height: 54px;
  border-radius: 50%;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition:
    background 0.25s,
    transform 0.25s;
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  &:active {
    transform: translateY(-50%) scale(0.9);
  }
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;
export const CarouselCloseButton = styled.button`
  position: absolute;
  top: -14px;
  right: -14px;
  background: #e04242;
  color: #fff;
  border: none;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.25s,
    transform 0.25s;
  &:hover {
    background: #ff5d5d;
  }
  &:active {
    transform: scale(0.9);
  }
`;
export const CarouselYear = styled.div`
  font-size: 0.8rem;
  letter-spacing: 1px;
  font-weight: 600;
  text-transform: uppercase;
  color: #ffe6a8;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
`;
