import { describe, expect, it } from 'vitest'
import {
  EDGE_SWAP,
  cornerStickerById,
  edgeStickerById,
  executionAlg,
  invertAlg,
  memoFromScramble,
  pairLetters,
  setupMoves,
} from './oldPochmann'

describe('Old Pochmann helpers', () => {
  it('inverts setup algorithms with cubing.js notation support', () => {
    expect(invertAlg("Lw' D L2")).toBe("L2' D' Lw")
  })

  it('pairs memo letters and preserves a final odd single', () => {
    expect(
      pairLetters([
        { letter: 'Q', sticker: 'LU', occupant: 'LU', cycleBreak: false },
        { letter: 'U', sticker: 'DF', occupant: 'DF', cycleBreak: false },
        { letter: 'S', sticker: 'LD', occupant: 'LD', cycleBreak: true },
      ]),
    ).toEqual(['QU', 'S'])
  })

  it('wraps setup, swap, and undo for an execution letter', () => {
    const alg = executionAlg('edge', 'Q')
    expect(alg.startsWith("Lw' D L2")).toBe(true)
    expect(alg).toContain(EDGE_SWAP)
    expect(alg.endsWith("L2' D' Lw")).toBe(true)
  })

  it('uses the Speffz/J Perm sticker lettering for Old Pochmann targets', () => {
    expect(edgeStickerById.get('UL')?.letter).toBe('D')
    expect(edgeStickerById.get('LU')?.letter).toBe('E')
    expect(edgeStickerById.get('FL')?.letter).toBe('L')
    expect(edgeStickerById.get('DF')?.letter).toBe('U')
    expect(cornerStickerById.get('LUB')?.letter).toBe('E')
    expect(cornerStickerById.get('DFR')?.letter).toBe('V')
    expect(cornerStickerById.get('DFL')?.letter).toBe('U')
  })

  it('keeps setup moves and undo moves available for target letters', () => {
    expect(setupMoves.edge.E).toBe("L Dw' L")
    expect(invertAlg(setupMoves.edge.E)).toBe("L' Dw L'")
    expect(setupMoves.edge.D).toBe('')
    expect(setupMoves.corner.Q).toBe("R D'")
    expect(invertAlg(setupMoves.corner.Q)).toBe("D R'")
    expect(setupMoves.corner.V).toBe('')
  })

  it('generates bounded memo for J Perm example solves', async () => {
    const memo = await memoFromScramble(
      "B2 R2 B2 L U2 R' B2 R2 B2 R' U' B' F L' B D R B2 D B' D' U",
    )
    expect(memo.edgePairs[0]).toBe('QU')
    expect(memo.edges.length).toBeLessThanOrEqual(24)
    expect(memo.corners.length).toBeLessThanOrEqual(24)
    expect(memo.edges.every((step) => step.letter !== '?')).toBe(true)
    expect(memo.corners.every((step) => step.letter !== '?')).toBe(true)
    expect(memo.parity).toBe(false)
  })

  it('detects parity for J Perm odd-parity example', async () => {
    const memo = await memoFromScramble(
      "U' L2 D' U R2 B' D' U' L2 B2 R' U' B' F' L U2 F R2 U'",
    )
    expect(memo.edgePairs[0]).toBe('KC')
    expect(memo.edges.length % 2).toBe(1)
    expect(memo.corners.length % 2).toBe(1)
    expect(memo.parity).toBe(true)
  })
})
