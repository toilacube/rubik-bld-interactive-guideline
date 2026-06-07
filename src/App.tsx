import { useEffect, useMemo, useState } from 'react'
import 'cubing/twisty'
import './App.css'
import {
  CORNER_SWAP,
  EDGE_SWAP,
  PARITY_ALG,
  cornerStickerById,
  cornerStickers,
  drills,
  edgeStickerById,
  edgeStickers,
  exampleScrambles,
  executionAlg,
  memoFromScramble,
  type Drill,
  type MemoResult,
  type PieceType,
} from './lib/oldPochmann'

type Mode = 'concepts' | 'guided' | 'trainer'

const lessons: Array<{
  id: Mode
  label: string
  title: string
  summary: string
}> = [
  {
    id: 'concepts',
    label: 'Concepts',
    title: 'Old Pochmann model',
    summary: 'Think in sticker cycles. Every letter is a setup, a swap, and an undo.',
  },
  {
    id: 'guided',
    label: 'Guided examples',
    title: 'Setup-swap-undo drills',
    summary: 'Replay edge, corner, flipped-piece, and parity examples with a live cube.',
  },
  {
    id: 'trainer',
    label: 'Scramble trainer',
    title: 'Memo and execution flow',
    summary: 'Enter a scramble, inspect memo pairs, parity, and the execution list.',
  },
]

function App() {
  const [mode, setMode] = useState<Mode>('concepts')
  const [selectedDrillId, setSelectedDrillId] = useState(drills[0].id)
  const [scramble, setScramble] = useState(exampleScrambles[0])
  const [memo, setMemo] = useState<MemoResult | null>(null)
  const [memoError, setMemoError] = useState('')
  const [selectedExecution, setSelectedExecution] = useState(0)

  const selectedLesson = lessons.find((lesson) => lesson.id === mode) ?? lessons[0]
  const selectedDrill =
    drills.find((drill) => drill.id === selectedDrillId) ?? drills[0]
  const executionSteps = useMemo(() => buildExecutionSteps(memo), [memo])
  const activeExecution = executionSteps[selectedExecution]

  useEffect(() => {
    let cancelled = false
    memoFromScramble(scramble)
      .then((result) => {
        if (!cancelled) {
          setMemo(result)
          setMemoError('')
          setSelectedExecution(0)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMemo(null)
          setMemoError(error instanceof Error ? error.message : 'Invalid scramble')
        }
      })

    return () => {
      cancelled = true
    }
  }, [scramble])

  const cubeAlg =
    mode === 'guided'
      ? selectedDrill.fullAlg
      : mode === 'trainer'
        ? (activeExecution?.alg ?? '')
        : EDGE_SWAP

  return (
    <main className="app-shell">
      <aside className="lesson-rail" aria-label="Learning modes">
        <div className="brand-mark">
          <span>3BLD</span>
          <strong>Old Pochmann</strong>
        </div>

        <nav className="mode-tabs">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              className={lesson.id === mode ? 'active' : ''}
              onClick={() => setMode(lesson.id)}
            >
              <span>{lesson.label}</span>
            </button>
          ))}
        </nav>

        <section className="source-panel">
          <h2>Method constants</h2>
          <dl>
            <div>
              <dt>Edge buffer</dt>
              <dd>UR</dd>
            </div>
            <div>
              <dt>Edge target</dt>
              <dd>UL</dd>
            </div>
            <div>
              <dt>Corner buffer</dt>
              <dd>LUB</dd>
            </div>
            <div>
              <dt>Corner target</dt>
              <dd>DFR</dd>
            </div>
          </dl>
        </section>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">For CFOP cubers learning blind</p>
            <h1>{selectedLesson.title}</h1>
            <p>{selectedLesson.summary}</p>
          </div>
          <div className="alg-chip">
            <span>Swap algs</span>
            <strong>2</strong>
          </div>
        </header>

        <section className="cube-stage" aria-label="3D cube guideline">
          <div className="cube-frame">
            <twisty-player
              key={`${mode}-${cubeAlg}-${scramble}`}
              puzzle="3x3x3"
              alg={cubeAlg}
              experimental-setup-alg={mode === 'trainer' ? scramble : undefined}
              experimental-setup-anchor="start"
              hint-facelets="floating"
              background="none"
              back-view="top-right"
            />
          </div>
          <div className="current-alg">
            <span>{mode === 'trainer' ? 'Active execution' : 'Visible algorithm'}</span>
            <code>{cubeAlg || 'Select a target letter'}</code>
          </div>
        </section>

        {mode === 'concepts' && <ConceptsPanel />}
        {mode === 'guided' && (
          <GuidedPanel
            selectedDrill={selectedDrill}
            onSelectDrill={setSelectedDrillId}
          />
        )}
        {mode === 'trainer' && (
          <TrainerPanel
            scramble={scramble}
            memo={memo}
            memoError={memoError}
            executionSteps={executionSteps}
            selectedExecution={selectedExecution}
            onScrambleChange={setScramble}
            onSelectExample={(value) => setScramble(value)}
            onSelectExecution={setSelectedExecution}
          />
        )}
      </section>
    </main>
  )
}

function ConceptsPanel() {
  return (
    <section className="content-grid">
      <LetterSchemeCube />

      <article className="learning-panel wide">
        <h2>Concept stack</h2>
        <ol className="concept-list">
          <li>
            <strong>Memo stickers, not cubies.</strong>
            The sticker in the buffer tells you where to shoot next.
          </li>
          <li>
            <strong>Execution is mechanical.</strong>
            For each letter, setup the target sticker, run the swap algorithm, undo
            setup.
          </li>
          <li>
            <strong>New cycles are explicit.</strong>
            When the buffer returns while other pieces remain unsolved, break into
            any unsolved sticker and continue.
          </li>
          <li>
            <strong>Orientation cases become memo pairs.</strong>
            Flipped edges and twisted corners show up as two letters on the same
            physical piece.
          </li>
          <li>
            <strong>Parity is predictable.</strong>
            Odd edge memo and odd corner memo means run the parity alg between the
            two phases.
          </li>
        </ol>
      </article>

      <AlgorithmCard title="Edge swap" label="UR to UL" alg={EDGE_SWAP} />
      <AlgorithmCard title="Corner swap" label="LBU to DFR" alg={CORNER_SWAP} />
      <AlgorithmCard title="Parity" label="Odd and odd" alg={PARITY_ALG} />

      <LetterMap title="Edge letter scheme" type="edge" />
      <LetterMap title="Corner letter scheme" type="corner" />
    </section>
  )
}

const cubeFaces = {
  U: [
    ['UBL', 'UB', 'UBR'],
    ['UL', 'U', 'UR'],
    ['UFL', 'UF', 'UFR'],
  ],
  L: [
    ['LUB', 'LU', 'LUF'],
    ['LB', 'L', 'LF'],
    ['LBD', 'LD', 'LFD'],
  ],
  F: [
    ['FUL', 'FU', 'FUR'],
    ['FL', 'F', 'FR'],
    ['FDL', 'FD', 'FDR'],
  ],
  R: [
    ['RUF', 'RU', 'RUB'],
    ['RF', 'R', 'RB'],
    ['RDF', 'RD', 'RDB'],
  ],
  B: [
    ['BUR', 'BU', 'BUL'],
    ['BR', 'B', 'BL'],
    ['BDR', 'BD', 'BDL'],
  ],
  D: [
    ['DFR', 'DF', 'DFL'],
    ['DR', 'D', 'DL'],
    ['DBR', 'DB', 'DBL'],
  ],
} satisfies Record<string, string[][]>

function LetterSchemeCube() {
  return (
    <article className="learning-panel wide letter-cube-panel">
      <div className="panel-heading">
        <div>
          <h2>Letter scheme cube</h2>
          <p>
            Centers stay as face names. Edge and corner stickers show their memo
            letters for the default white-top, green-front orientation.
          </p>
        </div>
        <span className="buffer-key">Buffer stickers highlighted</span>
      </div>

      <div className="scheme-net" aria-label="Full letter scheme net">
        <div />
        <CubeFace face="U" stickers={cubeFaces.U} />
        <div />
        <CubeFace face="L" stickers={cubeFaces.L} />
        <CubeFace face="F" stickers={cubeFaces.F} />
        <CubeFace face="R" stickers={cubeFaces.R} />
        <div />
        <CubeFace face="B" stickers={cubeFaces.B} />
        <div />
        <div />
        <CubeFace face="D" stickers={cubeFaces.D} />
        <div />
      </div>
    </article>
  )
}

function CubeFace({ face, stickers }: { face: string; stickers: string[][] }) {
  return (
    <div className={`cube-face face-${face}`} aria-label={`${face} face`}>
      {stickers.flat().map((sticker) => (
        <span key={`${face}-${sticker}`} className={isBuffer(sticker) ? 'buffer' : ''}>
          <strong>{letterForSticker(sticker)}</strong>
          <small>{sticker}</small>
        </span>
      ))}
    </div>
  )
}

function GuidedPanel({
  selectedDrill,
  onSelectDrill,
}: {
  selectedDrill: Drill
  onSelectDrill: (id: string) => void
}) {
  return (
    <section className="content-grid">
      <article className="learning-panel wide">
        <h2>Choose a drill</h2>
        <div className="drill-grid">
          {drills.map((drill) => (
            <button
              key={drill.id}
              type="button"
              className={drill.id === selectedDrill.id ? 'drill active' : 'drill'}
              onClick={() => onSelectDrill(drill.id)}
            >
              <span>{drill.title}</span>
              <strong>{drill.focus}</strong>
            </button>
          ))}
        </div>
      </article>

      <article className="learning-panel execution-card">
        <h2>{selectedDrill.title}</h2>
        <div className="execution-row">
          <span>Setup</span>
          <code>{selectedDrill.setup || 'none'}</code>
        </div>
        <div className="execution-row">
          <span>Swap</span>
          <code>{selectedDrill.swap}</code>
        </div>
        <div className="execution-row">
          <span>Undo</span>
          <code>{selectedDrill.undo || 'none'}</code>
        </div>
      </article>

      <article className="learning-panel">
        <h2>Practice cue</h2>
        <p>
          Watch the setup move the target into the swap slot. During real blind
          execution, the only conscious decision should be the letter you are
          currently resolving.
        </p>
      </article>
    </section>
  )
}

function TrainerPanel({
  scramble,
  memo,
  memoError,
  executionSteps,
  selectedExecution,
  onScrambleChange,
  onSelectExample,
  onSelectExecution,
}: {
  scramble: string
  memo: MemoResult | null
  memoError: string
  executionSteps: ExecutionStep[]
  selectedExecution: number
  onScrambleChange: (scramble: string) => void
  onSelectExample: (scramble: string) => void
  onSelectExecution: (index: number) => void
}) {
  return (
    <section className="content-grid trainer-grid">
      <article className="learning-panel wide">
        <div className="panel-heading">
          <h2>Scramble</h2>
          <select
            aria-label="Example scramble"
            value={scramble}
            onChange={(event) => onSelectExample(event.target.value)}
          >
            {exampleScrambles.map((example, index) => (
              <option key={example} value={example}>
                Example {index + 1}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={scramble}
          onChange={(event) => onScrambleChange(event.target.value)}
          aria-label="Scramble input"
          spellCheck={false}
        />
        {memoError && <p className="error-text">{memoError}</p>}
      </article>

      <MemoCard title="Edges" pairs={memo?.edgePairs ?? []} count={memo?.edges.length ?? 0} />
      <MemoCard
        title="Corners"
        pairs={memo?.cornerPairs ?? []}
        count={memo?.corners.length ?? 0}
      />

      <article className="learning-panel parity-panel">
        <h2>Parity</h2>
        <strong className={memo?.parity ? 'parity-on' : 'parity-off'}>
          {memo?.parity ? 'Run parity' : 'No parity'}
        </strong>
        <code>{memo?.parity ? PARITY_ALG : 'Edge and corner counts are not both odd.'}</code>
      </article>

      <article className="learning-panel wide">
        <h2>Execution list</h2>
        <div className="execution-list">
          {executionSteps.map((step, index) => (
            <button
              key={`${step.phase}-${step.letter}-${index}`}
              type="button"
              className={index === selectedExecution ? 'active' : ''}
              onClick={() => onSelectExecution(index)}
            >
              <span>{step.phase}</span>
              <strong>{step.letter}</strong>
              <code>{step.alg}</code>
            </button>
          ))}
        </div>
      </article>
    </section>
  )
}

function AlgorithmCard({
  title,
  label,
  alg,
}: {
  title: string
  label: string
  alg: string
}) {
  return (
    <article className="learning-panel alg-card">
      <span>{label}</span>
      <h2>{title}</h2>
      <code>{alg}</code>
    </article>
  )
}

function LetterMap({ title, type }: { title: string; type: PieceType }) {
  const stickers = type === 'edge' ? edgeStickers : cornerStickers

  return (
    <article className="learning-panel wide">
      <h2>{title}</h2>
      <div className="letter-map">
        {stickers.map((sticker) => (
          <span key={sticker.id} className={isBuffer(sticker.id) ? 'buffer' : ''}>
            <strong>{sticker.letter}</strong>
            {sticker.id}
          </span>
        ))}
      </div>
    </article>
  )
}

function MemoCard({
  title,
  pairs,
  count,
}: {
  title: string
  pairs: string[]
  count: number
}) {
  return (
    <article className="learning-panel memo-card">
      <div>
        <h2>{title}</h2>
        <span>{count} letters</span>
      </div>
      <p>{pairs.length ? pairs.join(' ') : 'Solved'}</p>
    </article>
  )
}

type ExecutionStep = {
  phase: 'edge' | 'corner' | 'parity'
  letter: string
  alg: string
}

function buildExecutionSteps(memo: MemoResult | null): ExecutionStep[] {
  if (!memo) return []
  const edges = memo.edges.map((step) => ({
    phase: 'edge' as const,
    letter: step.letter,
    alg: executionAlg('edge', step.letter),
  }))
  const parity = memo.parity
    ? [{ phase: 'parity' as const, letter: 'P', alg: PARITY_ALG }]
    : []
  const corners = memo.corners.map((step) => ({
    phase: 'corner' as const,
    letter: step.letter,
    alg: executionAlg('corner', step.letter),
  }))

  return [...edges, ...parity, ...corners]
}

function isBuffer(sticker: string): boolean {
  return ['UR', 'RU', 'LUB', 'BUL', 'UBL'].includes(sticker)
}

function letterForSticker(sticker: string): string {
  return edgeStickerById.get(sticker)?.letter ?? cornerStickerById.get(sticker)?.letter ?? sticker
}

export default App
