import type React from 'react';
import { useMemo } from 'react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
  label?: string;
  fgColor?: string;
  bgColor?: string;
}

// GF(256) tables for Reed-Solomon computation
const EXP: number[] = new Array(512);
const LOG: number[] = new Array(256);
let x = 1;
for (let i = 0; i < 255; i++) {
  EXP[i] = x;
  EXP[i + 255] = x;
  LOG[x] = i;
  x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

function rsPoly(numEc: number): number[] {
  let poly = [1];
  for (let i = 0; i < numEc; i++) {
    const factor = [1, EXP[i]];
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], factor[0]);
      next[j + 1] ^= gfMul(poly[j], factor[1]);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: number[], numEc: number): number[] {
  const poly = rsPoly(numEc);
  const remainder = new Array(numEc).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    for (let j = 0; j < numEc - 1; j++) {
      remainder[j] = remainder[j + 1] ^ gfMul(poly[j + 1], factor);
    }
    remainder[numEc - 1] = gfMul(poly[numEc], factor);
  }
  return remainder;
}

function getFormatBits(ecLevelBits: number, mask: number): number {
  const data = (ecLevelBits << 3) | mask;
  let rem = data << 10;
  for (let i = 4; i >= 0; i--) {
    if ((rem >> (i + 10)) & 1) {
      rem ^= 0x537 << i;
    }
  }
  return ((data << 10) | rem) ^ 0x5412;
}

interface VersionSpec {
  version: number;
  size: number;
  totalCodewords: number;
  dataCodewords: number;
  ecCodewords: number;
  alignPos?: number;
}

const VERSIONS: VersionSpec[] = [
  { version: 1, size: 21, totalCodewords: 26, dataCodewords: 19, ecCodewords: 7 },
  { version: 2, size: 25, totalCodewords: 44, dataCodewords: 34, ecCodewords: 10, alignPos: 18 },
  { version: 3, size: 29, totalCodewords: 70, dataCodewords: 55, ecCodewords: 15, alignPos: 22 },
  { version: 4, size: 33, totalCodewords: 100, dataCodewords: 80, ecCodewords: 20, alignPos: 26 },
];

function generateQrMatrix(text: string): { matrix: boolean[][]; size: number } {
  const bytes = new TextEncoder().encode(text);
  const dataLen = bytes.length;

  // Select smallest version that fits
  const spec =
    VERSIONS.find((v) => dataLen <= v.dataCodewords - 3) || VERSIONS[VERSIONS.length - 1];
  const { size, dataCodewords, ecCodewords, alignPos } = spec;

  // Build bitstream: Mode (0100 for byte) + Count (8 bits) + Bytes
  const bitStream: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  };

  pushBits(0b0100, 4); // Byte mode
  pushBits(Math.min(dataLen, dataCodewords - 3), 8); // Length indicator

  for (let i = 0; i < Math.min(dataLen, dataCodewords - 3); i++) {
    pushBits(bytes[i], 8);
  }

  // Terminator (up to 4 zero bits)
  const remainingBits = dataCodewords * 8 - bitStream.length;
  const termLen = Math.min(4, Math.max(0, remainingBits));
  pushBits(0, termLen);

  // Pad to byte boundary
  while (bitStream.length % 8 !== 0) {
    bitStream.push(0);
  }

  // Convert bitstream to data codewords
  const dataCodewordArray: number[] = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitStream[i + b];
    }
    dataCodewordArray.push(byteVal);
  }

  // Pad bytes: alternate 0xEC, 0x11
  let padToggle = false;
  while (dataCodewordArray.length < dataCodewords) {
    dataCodewordArray.push(padToggle ? 0x11 : 0xec);
    padToggle = !padToggle;
  }

  // Compute Reed-Solomon Error Correction codewords
  const ecCodewordArray = rsEncode(dataCodewordArray, ecCodewords);
  const finalCodewords = [...dataCodewordArray, ...ecCodewordArray];

  // Initialize Matrix and Reserved Mask
  const matrix: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  const setModule = (r: number, c: number, val: boolean, fn = true) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      if (fn) isFunction[r][c] = true;
    }
  };

  // Place Finder Pattern
  const placeFinder = (startR: number, startC: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = startR + r;
        const col = startC + c;
        if (row < 0 || row >= size || col < 0 || col >= size) continue;

        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          setModule(row, col, isEdge || isInner, true);
        } else {
          // Separator
          setModule(row, col, false, true);
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setModule(6, i, i % 2 === 0, true);
    setModule(i, 6, i % 2 === 0, true);
  }

  // Alignment pattern if version >= 2
  if (alignPos) {
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
        const isCenter = r === 0 && c === 0;
        setModule(alignPos + r, alignPos + c, isBorder || isCenter, true);
      }
    }
  }

  // Dark module
  setModule(size - 8, 8, true, true);

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      isFunction[8][i] = true;
      isFunction[i][8] = true;
    }
  }
  for (let i = size - 8; i < size; i++) {
    isFunction[8][i] = true;
    isFunction[i][8] = true;
  }

  // Place Codewords into Data Grid (Zigzag pattern)
  let bitIndex = 0;
  const totalDataBits = finalCodewords.length * 8;

  let col = size - 1;
  let dir = -1; // -1 = moving upward, +1 = moving downward

  while (col > 0) {
    if (col === 6) col--; // Skip vertical timing column

    for (let i = 0; i < size; i++) {
      const row = dir === -1 ? size - 1 - i : i;

      for (let c = 0; c < 2; c++) {
        const targetCol = col - c;
        if (!isFunction[row][targetCol]) {
          let bit = false;
          if (bitIndex < totalDataBits) {
            const bytePos = Math.floor(bitIndex / 8);
            const bitPos = 7 - (bitIndex % 8);
            bit = ((finalCodewords[bytePos] >> bitPos) & 1) === 1;
            bitIndex++;
          }

          // Apply Mask 0: (row + col) % 2 === 0
          if ((row + targetCol) % 2 === 0) {
            bit = !bit;
          }

          matrix[row][targetCol] = bit;
        }
      }
    }
    col -= 2;
    dir = -dir;
  }

  // Place Format Information (Level L = 01, Mask 0 = 000)
  const formatBits = getFormatBits(0b01, 0b000);
  const fmtBit = (bitPos: number) => ((formatBits >> bitPos) & 1) === 1;

  // Along top-left finder
  setModule(8, 0, fmtBit(0), true);
  setModule(8, 1, fmtBit(1), true);
  setModule(8, 2, fmtBit(2), true);
  setModule(8, 3, fmtBit(3), true);
  setModule(8, 4, fmtBit(4), true);
  setModule(8, 5, fmtBit(5), true);
  setModule(8, 7, fmtBit(6), true);
  setModule(8, 8, fmtBit(7), true);
  setModule(7, 8, fmtBit(8), true);
  setModule(5, 8, fmtBit(9), true);
  setModule(4, 8, fmtBit(10), true);
  setModule(3, 8, fmtBit(11), true);
  setModule(2, 8, fmtBit(12), true);
  setModule(1, 8, fmtBit(13), true);
  setModule(0, 8, fmtBit(14), true);

  // Along top-right and bottom-left finders
  for (let i = 0; i < 7; i++) {
    setModule(size - 1 - i, 8, fmtBit(i), true);
  }
  for (let i = 0; i < 8; i++) {
    setModule(8, size - 8 + i, fmtBit(7 + i), true);
  }

  return { matrix, size };
}

/**
 * Zero-dependency, accessible, crisp SVG QR Code component.
 * Renders pure SVG paths for maximum performance and sharpness at any resolution.
 */
export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  value,
  size = 200,
  className = '',
  label,
  fgColor = 'currentColor',
  bgColor = 'transparent',
}) => {
  const { matrix, size: matrixSize } = useMemo(() => generateQrMatrix(value), [value]);

  const pathData = useMemo(() => {
    let d = '';
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r][c]) {
          d += `M${c},${r}h1v1h-1z `;
        }
      }
    }
    return d;
  }, [matrix, matrixSize]);

  const ariaLabel = label || `QR Code for ticket ${value}`;

  return (
    <svg
      viewBox={`0 0 ${matrixSize} ${matrixSize}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={ariaLabel}
      shapeRendering="crispEdges"
    >
      <title>{ariaLabel}</title>
      {bgColor !== 'transparent' && <rect width={matrixSize} height={matrixSize} fill={bgColor} />}
      <path d={pathData} fill={fgColor} />
    </svg>
  );
};
