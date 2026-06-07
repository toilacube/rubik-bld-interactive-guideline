import { Alg } from 'cubing/alg'
import { cube3x3x3 } from 'cubing/puzzles'

export type PieceType = 'edge' | 'corner'

export type Sticker = {
  id: string
  letter: string
  piece: string
  type: PieceType
}

export type MemoStep = {
  letter: string
  sticker: string
  occupant: string
  cycleBreak: boolean
}

export type MemoResult = {
  edges: MemoStep[]
  corners: MemoStep[]
  edgePairs: string[]
  cornerPairs: string[]
  parity: boolean
}

export type Drill = {
  id: string
  title: string
  type: PieceType | 'parity'
  focus: string
  setup: string
  swap: string
  undo: string
  fullAlg: string
}

export const EDGE_SWAP =
  "R U R' U' R' F R2 U' R' U' R U R' F'"
export const CORNER_SWAP =
  "R U' R' U' R U R' F' R U R' U' R' F R"
export const PARITY_ALG =
  "R U' R' U' R U R D R' U' R D' R' U2 R' U'"

export const edgePositions = [
  ['UF', 'FU'],
  ['UR', 'RU'],
  ['UB', 'BU'],
  ['UL', 'LU'],
  ['DF', 'FD'],
  ['DR', 'RD'],
  ['DB', 'BD'],
  ['DL', 'LD'],
  ['FR', 'RF'],
  ['FL', 'LF'],
  ['BR', 'RB'],
  ['BL', 'LB'],
]

export const cornerPositions = [
  ['UFR', 'RUF', 'FUR'],
  ['UBR', 'BUR', 'RUB'],
  ['UBL', 'LUB', 'BUL'],
  ['UFL', 'FUL', 'LUF'],
  ['DFR', 'FDR', 'RDF'],
  ['DBR', 'RDB', 'BDR'],
  ['DBL', 'BDL', 'LBD'],
  ['DFL', 'LFD', 'FDL'],
]

const edgeLetterBySticker: Record<string, string> = {
  UB: 'A',
  UR: 'B',
  UF: 'C',
  UL: 'D',
  LU: 'E',
  LF: 'F',
  LD: 'G',
  LB: 'H',
  FU: 'I',
  FR: 'J',
  FD: 'K',
  FL: 'L',
  RU: 'M',
  RB: 'N',
  RD: 'O',
  RF: 'P',
  BU: 'Q',
  BL: 'R',
  BD: 'S',
  BR: 'T',
  DF: 'U',
  DR: 'V',
  DB: 'W',
  DL: 'X',
}

const cornerLetterBySticker: Record<string, string> = {
  UBL: 'A',
  UBR: 'B',
  UFR: 'C',
  UFL: 'D',
  LUB: 'E',
  LUF: 'F',
  LFD: 'G',
  LBD: 'H',
  FUL: 'I',
  FUR: 'J',
  FDR: 'K',
  FDL: 'L',
  RUF: 'M',
  RUB: 'N',
  RDB: 'O',
  RDF: 'P',
  BUR: 'Q',
  BUL: 'R',
  BDL: 'S',
  BDR: 'T',
  DFL: 'U',
  DFR: 'V',
  DBR: 'W',
  DBL: 'X',
}

export const edgeStickers: Sticker[] = edgePositions.flatMap((piece) =>
  piece.map((id) => ({
    id,
    letter: edgeLetterBySticker[id],
    piece: piece.join('/'),
    type: 'edge' as const,
  })),
)

export const cornerStickers: Sticker[] = cornerPositions.flatMap(
  (piece) =>
    piece.map((id) => ({
      id,
      letter: cornerLetterBySticker[id],
      piece: piece.join('/'),
      type: 'corner' as const,
    })),
)

export const edgeStickerById = new Map(edgeStickers.map((sticker) => [sticker.id, sticker]))
export const cornerStickerById = new Map(
  cornerStickers.map((sticker) => [sticker.id, sticker]),
)

export const edgeStickerByLetter = new Map(
  edgeStickers.map((sticker) => [sticker.letter, sticker]),
)
export const cornerStickerByLetter = new Map(
  cornerStickers.map((sticker) => [sticker.letter, sticker]),
)

export const setupMoves: Record<PieceType, Record<string, string>> = {
  edge: {
    A: "Lw2 D' L2",
    C: 'Lw2 D L2',
    D: '',
    E: "L Dw' L",
    F: "Dw' L",
    G: "L Dw L'",
    H: "Dw L'",
    I: "Lw D' L2",
    J: 'Dw2 L',
    K: 'Lw D L2',
    L: "L'",
    N: 'Dw L',
    O: "D' Lw D L2",
    P: "Dw' L'",
    Q: "Lw' D L2",
    R: 'L',
    S: "Lw' D' L2",
    T: "Dw2 L'",
    U: "D' L2",
    V: 'D2 L2',
    W: 'D L2',
    X: 'L2',
  },
  corner: {
    B: 'R2',
    C: 'F2 D',
    D: 'F2',
    F: "F' D",
    G: "D2 F'",
    H: "D' R",
    I: "F R'",
    J: "R'",
    K: "D' F'",
    L: 'R',
    M: 'F',
    N: "R' F",
    O: 'R2 F',
    P: 'R F',
    Q: "R D'",
    S: "D F'",
    T: 'D2 R',
    U: 'D',
    V: '',
    W: "D'",
    X: 'D2',
  },
}

export const drills: Drill[] = [
  makeDrill('edge-target', 'Edge target: buffer UR to UL', 'edge', 'D'),
  makeDrill('edge-layer', 'Edge setup: an E-layer target', 'edge', 'R'),
  makeDrill('edge-flip', 'Flipped edge: two letters on one piece', 'edge', 'D E'),
  makeDrill('corner-target', 'Corner target: buffer LBU to DFR', 'corner', 'V'),
  makeDrill('corner-setup', 'Corner setup: bring a target into DFR', 'corner', 'Q'),
  {
    id: 'parity',
    title: 'Odd parity: bridge edges to corners',
    type: 'parity',
    focus: 'Run after edges when both memo counts are odd.',
    setup: '',
    swap: PARITY_ALG,
    undo: '',
    fullAlg: PARITY_ALG,
  },
]

export const exampleScrambles = [
  "B2 R2 B2 L U2 R' B2 R2 B2 R' U' B' F L' B D R B2 D B' D' U",
  "U' L2 D' U R2 B' D' U' L2 B2 R' U' B' F' L U2 F R2 U'",
  "R U R' F2 D L2 U' B R2 F' U2 L' D2 B2 R",
]

function makeDrill(
  id: string,
  title: string,
  type: PieceType,
  letters: string,
): Drill {
  const setup = letters
    .split(/\s+/)
    .map((letter) => setupMoves[type][letter] ?? '')
    .filter(Boolean)
    .join(' ')
  const swap = type === 'edge' ? EDGE_SWAP : CORNER_SWAP
  const undo = invertAlg(setup)

  return {
    id,
    title,
    type,
    focus: letters,
    setup,
    swap,
    undo,
    fullAlg: [setup, swap, undo].filter(Boolean).join(' '),
  }
}

export function invertAlg(alg: string): string {
  if (!alg.trim()) return ''
  return new Alg(alg).invert().toString()
}

export function pairLetters(steps: MemoStep[]): string[] {
  const letters = steps.map((step) => step.letter)
  const pairs: string[] = []
  for (let index = 0; index < letters.length; index += 2) {
    pairs.push(letters.slice(index, index + 2).join(''))
  }
  return pairs
}

export function executionAlg(type: PieceType, letter: string): string {
  const setup = setupMoves[type][letter] ?? ''
  const swap = type === 'edge' ? EDGE_SWAP : CORNER_SWAP
  return [setup, swap, invertAlg(setup)].filter(Boolean).join(' ')
}

export async function memoFromScramble(scramble: string): Promise<MemoResult> {
  if (scramble.trim()) {
    new Alg(scramble)
  }

  const kpuzzle = await cube3x3x3.kpuzzle()
  const pattern = kpuzzle.defaultPattern().applyAlg(scramble)
  const edges = buildStickerState(
    edgePositions,
    pattern.patternData.EDGES.pieces,
    pattern.patternData.EDGES.orientation,
  )
  const corners = buildStickerState(
    cornerPositions,
    pattern.patternData.CORNERS.pieces,
    pattern.patternData.CORNERS.orientation,
  )

  const edgeSteps = traceMemo(edges, 'UR', ['UR', 'RU'], edgeStickerById)
  const cornerSteps = traceMemo(corners, 'LUB', ['LUB', 'BUL', 'UBL'], cornerStickerById)

  return {
    edges: edgeSteps,
    corners: cornerSteps,
    edgePairs: pairLetters(edgeSteps),
    cornerPairs: pairLetters(cornerSteps),
    parity: edgeSteps.length % 2 === 1 && cornerSteps.length % 2 === 1,
  }
}

function buildStickerState(
  positions: string[][],
  pieces: number[],
  orientations: number[],
): Map<string, string> {
  const state = new Map<string, string>()
  positions.forEach((positionStickers, positionIndex) => {
    const piece = positions[pieces[positionIndex]]
    const orientation = orientations[positionIndex]
    positionStickers.forEach((positionSticker, stickerIndex) => {
      const occupantIndex =
        piece.length === 2
          ? (stickerIndex + orientation) % 2
          : (stickerIndex - orientation + 3) % 3
      state.set(positionSticker, piece[occupantIndex])
    })
  })
  return state
}

function traceMemo(
  initialState: Map<string, string>,
  bufferSticker: string,
  bufferPiece: string[],
  stickerById: Map<string, Sticker>,
): MemoStep[] {
  const state = initialState
  const steps: MemoStep[] = []
  const visited = new Set(bufferPiece)

  traceCycle(state, bufferSticker, bufferPiece, false, visited, steps, stickerById)

  while (true) {
    const next = [...state.entries()].find(
      ([position, home]) =>
        position !== home && !visited.has(position) && !bufferPiece.includes(position),
    )
    if (!next) break

    const [cycleSticker] = next
    const cyclePiece = stickerById.get(cycleSticker)?.piece.split('/') ?? [cycleSticker]
    traceCycle(state, cycleSticker, cyclePiece, true, visited, steps, stickerById)
  }

  return steps
}

function traceCycle(
  state: Map<string, string>,
  startSticker: string,
  stopPiece: string[],
  includeStart: boolean,
  visited: Set<string>,
  steps: MemoStep[],
  stickerById: Map<string, Sticker>,
): void {
  let current = startSticker
  let guard = 0

  if (includeStart) {
    steps.push(makeMemoStep(startSticker, state.get(startSticker) ?? startSticker, true, stickerById))
    markPieceVisited(startSticker, visited, stickerById)
  }

  while (guard < 30) {
    guard += 1
    const occupant = state.get(current)
    if (!occupant) return

    if (stopPiece.includes(occupant)) {
      if (includeStart) {
        steps.push(makeMemoStep(occupant, occupant, false, stickerById))
        markPieceVisited(occupant, visited, stickerById)
      }
      return
    }

    steps.push(makeMemoStep(occupant, occupant, false, stickerById))
    markPieceVisited(occupant, visited, stickerById)
    current = occupant
  }
}

function markPieceVisited(
  sticker: string,
  visited: Set<string>,
  stickerById: Map<string, Sticker>,
): void {
  const piece = stickerById.get(sticker)?.piece.split('/') ?? [sticker]
  piece.forEach((pieceSticker) => visited.add(pieceSticker))
}

function makeMemoStep(
  sticker: string,
  occupant: string,
  cycleBreak: boolean,
  stickerById: Map<string, Sticker>,
): MemoStep {
  const target = stickerById.get(sticker)
  return {
    letter: target?.letter ?? '?',
    sticker,
    occupant,
    cycleBreak,
  }
}
