import { useEffect, useMemo, useState } from 'react'
import 'cubing/twisty'
import './App.css'
import {
  CORNER_SWAP,
  EDGE_SWAP,
  PARITY_ALG,
  cornerStickerById,
  cornerStickers,
  edgeStickerById,
  edgeStickers,
  exampleScrambles,
  executionAlg,
  invertAlg,
  memoFromScramble,
  setupMoves,
  type MemoResult,
  type PieceType,
  type Sticker,
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
    label: 'Guided example',
    title: 'One complete example solve',
    summary: 'Follow a single scramble from memo to execution, one slow step at a time.',
  },
  {
    id: 'trainer',
    label: 'Scramble trainer',
    title: 'Memo and execution flow',
    summary: 'Enter a scramble, inspect memo pairs, parity, and the execution list.',
  },
]

const roadmap = [
  {
    title: '1. Learn what a sticker target means',
    detail:
      'A target is not just a cubie. It is the exact sticker currently sitting in your buffer. If the edge buffer sticker shows Q, you execute the Q target, even if the cubie name feels different.',
  },
  {
    title: '2. Memorize edges and corners separately',
    detail:
      'Write edge letters first, then corner letters. Pair them two letters at a time only after the raw sequence is correct. Do not try to invent images while you are still unsure about the letters.',
  },
  {
    title: '3. Execute one letter at a time',
    detail:
      'For every letter say: setup, swap, undo. Pause after the undo and confirm that you are ready for the next letter. Speed does not matter while learning.',
  },
  {
    title: '4. Add cycle breaks slowly',
    detail:
      'When the buffer comes home but pieces are still unsolved, pick an unsolved sticker, add that letter, and continue until that same physical piece returns.',
  },
  {
    title: '5. Add parity only after edges',
    detail:
      'If the edge memo count is odd and the corner memo count is odd, run the parity algorithm after edges and before corners. Do not run parity at the end.',
  },
]

const beginnerChecks = [
  'I can point to the edge buffer UR and the corner buffer LUB on the net.',
  'I can explain why UL is edge letter D and DFR is corner letter V.',
  'I can execute the edge swap and corner swap from muscle memory while looking.',
  'I can do one setup, swap, undo, then reverse back to a solved cube.',
  'I can identify when a memo has odd edge and odd corner counts.',
]

const slowPracticePlan = [
  'Day 1: learn the letter net only. No blindfold. Touch each sticker and say its letter.',
  'Day 2: drill direct targets D for edges and V for corners until setupless swaps feel normal.',
  'Day 3: drill five setup targets. Say the setup aloud, execute the swap, undo immediately.',
  'Day 4: trace short scrambles on paper. Stop after memo; do not execute yet.',
  'Day 5: do sighted BLD solves. Read memo from the page and execute one letter at a time.',
  'Day 6+: try blindfolded only when sighted BLD solves are boring and repeatable.',
]

function App() {
  const [mode, setMode] = useState<Mode>('concepts')
  const [scramble, setScramble] = useState(exampleScrambles[0])
  const [memo, setMemo] = useState<MemoResult | null>(null)
  const [guidedMemo, setGuidedMemo] = useState<MemoResult | null>(null)
  const [memoError, setMemoError] = useState('')
  const [selectedExecution, setSelectedExecution] = useState(0)
  const [selectedGuidedStep, setSelectedGuidedStep] = useState(0)

  const selectedLesson = lessons.find((lesson) => lesson.id === mode) ?? lessons[0]
  const executionSteps = useMemo(() => buildExecutionSteps(memo), [memo])
  const guidedExecutionSteps = useMemo(
    () => buildExecutionSteps(guidedMemo),
    [guidedMemo],
  )
  const activeExecution = executionSteps[selectedExecution]
  const activeGuidedExecution = guidedExecutionSteps[selectedGuidedStep]

  useEffect(() => {
    let cancelled = false
    memoFromScramble(exampleScrambles[0]).then((result) => {
      if (!cancelled) {
        setGuidedMemo(result)
        setSelectedGuidedStep(0)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

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
      ? (activeGuidedExecution?.alg ?? '')
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
            memo={guidedMemo}
            executionSteps={guidedExecutionSteps}
            selectedExecution={selectedGuidedStep}
            onSelectExecution={setSelectedGuidedStep}
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
      <AlgorithmCard title="Corner swap" label="LUB to DFR" alg={CORNER_SWAP} />
      <AlgorithmCard title="Parity" label="Odd and odd" alg={PARITY_ALG} />

      <div className="letter-schemes">
        <LetterMap title="Edge letter scheme" type="edge" />
        <LetterMap title="Corner letter scheme" type="corner" />
      </div>
      <SlowLearningGuide />
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
  memo,
  executionSteps,
  selectedExecution,
  onSelectExecution,
}: {
  memo: MemoResult | null
  executionSteps: ExecutionStep[]
  selectedExecution: number
  onSelectExecution: (index: number) => void
}) {
  const edgeSteps = executionSteps.filter((step) => step.phase === 'edge')
  const cornerSteps = executionSteps.filter((step) => step.phase === 'corner')

  return (
    <section className="content-grid guided-grid">
      <article className="learning-panel wide guided-intro">
        <h2>Worked example scramble</h2>
        <code>{exampleScrambles[0]}</code>
        <p>
          This page is not a random trainer. It is one complete sighted BLD solve.
          Read each section in order, click the current execution letter, and watch
          only that step on the cube above.
        </p>
      </article>

      <article className="learning-panel">
        <h2>Step 1: write edge memo</h2>
        <p>
          Start from the edge buffer `UR`. The letter sequence below is paired only
          to make it easier to read.
        </p>
        <strong className="memo-line">{memo?.edgePairs.join(' ') || 'Loading...'}</strong>
        <ol className="detail-list">
          <li>Say the first pair slowly.</li>
          <li>Point to each target letter on the letter scheme table if needed.</li>
          <li>Do not execute yet. This step is only memo.</li>
        </ol>
      </article>

      <article className="learning-panel">
        <h2>Step 2: write corner memo</h2>
        <p>
          After edges, move to the corner buffer `LUB`. Treat corners as a separate
          list.
        </p>
        <strong className="memo-line">{memo?.cornerPairs.join(' ') || 'Loading...'}</strong>
        <ol className="detail-list">
          <li>Read corners after edges, not mixed with edges.</li>
          <li>Every corner letter still means setup, swap, undo.</li>
          <li>Keep the corner memo separate until execution.</li>
        </ol>
      </article>

      <article className="learning-panel">
        <h2>Step 3: check parity</h2>
        <strong className={memo?.parity ? 'parity-on' : 'parity-off'}>
          {memo?.parity ? 'Run parity after edges' : 'No parity in this example'}
        </strong>
        <p>
          Count the raw edge letters and raw corner letters. If both counts are
          odd, parity is inserted after all edges and before the first corner.
        </p>
      </article>

      <article className="learning-panel">
        <h2>Step 4: execute edges first</h2>
        <p>
          Click edge step 1. Do its setup, swap, and undo. Then move to the next
          edge letter. Do not start corners until every edge row is done.
        </p>
        <strong className="step-count">{edgeSteps.length} edge letters</strong>
      </article>

      <article className="learning-panel">
        <h2>Step 5: execute corners last</h2>
        <p>
          Corners use the corner swap and their own setup table. If there is
          parity, do parity before this section.
        </p>
        <strong className="step-count">{cornerSteps.length} corner letters</strong>
      </article>

      <article className="learning-panel wide">
        <h2>Numbered execution walkthrough</h2>
        <div className="guided-execution-list">
          {executionSteps.map((step, index) => (
            <button
              key={`${step.phase}-${step.letter}-${index}`}
              type="button"
              className={index === selectedExecution ? 'active' : ''}
              onClick={() => onSelectExecution(index)}
            >
              <span className="step-number">{index + 1}</span>
              <span>{step.phase}</span>
              <strong>{step.letter}</strong>
              <ExecutionParts step={step} />
            </button>
          ))}
        </div>
      </article>

      <article className="learning-panel wide">
        <h2>How to use this page</h2>
        <ol className="detail-list">
          <li>First read the memo cards without touching the cube.</li>
          <li>Then click execution row 1 and perform only that row.</li>
          <li>After the undo, pause and click the next row.</li>
          <li>If the cube above looks confusing, ignore animation and read the row chips.</li>
          <li>Repeat this exact example until the order feels boring.</li>
        </ol>
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
              <ExecutionParts step={step} />
            </button>
          ))}
        </div>
      </article>

      <article className="learning-panel wide">
        <h2>Slow solve protocol</h2>
        <div className="protocol-grid">
          <section>
            <h3>Memo pass</h3>
            <p>
              Read the edge memo from left to right. Mark every cycle break mentally
              as a fresh start, not as a mistake. Then repeat the same process for
              corners.
            </p>
          </section>
          <section>
            <h3>Execution pass</h3>
            <p>
              Click the first execution row, do only that algorithm, then move to
              the next row. Do not look ahead while your hands are moving.
            </p>
          </section>
          <section>
            <h3>Error recovery</h3>
            <p>
              If you lose your place, stop immediately. Find the last completed
              letter in the execution list instead of guessing the next algorithm.
            </p>
          </section>
        </div>
      </article>
    </section>
  )
}

function SlowLearningGuide() {
  return (
    <>
      <article className="learning-panel wide">
        <h2>Slow learner roadmap</h2>
        <div className="roadmap-grid">
          {roadmap.map((item) => (
            <section key={item.title} className="roadmap-step">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </section>
          ))}
        </div>
      </article>

      <article className="learning-panel">
        <h2>Readiness checklist</h2>
        <ul className="check-list">
          {beginnerChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="learning-panel">
        <h2>Practice schedule</h2>
        <ol className="detail-list">
          {slowPracticePlan.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </article>
    </>
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
  const stickers = [...(type === 'edge' ? edgeStickers : cornerStickers)].sort(
    (a, b) => a.letter.localeCompare(b.letter),
  )

  return (
    <article className="learning-panel letter-scheme-panel">
      <h2>{title}</h2>
      <div className="letter-table">
        <div className="letter-table-head" aria-hidden="true">
          <span>Letter</span>
          <span>Sticker</span>
          <span>Setup</span>
          <span>Undo</span>
        </div>
        {stickers.map((sticker) => (
          <LetterSetupRow key={sticker.id} sticker={sticker} />
        ))}
      </div>
    </article>
  )
}

function LetterSetupRow({ sticker }: { sticker: Sticker }) {
  const setup = setupForSticker(sticker)
  const undo = setup.kind === 'target' ? invertAlg(setup.setup) : setup.setup

  return (
    <div className={isBuffer(sticker.id) ? 'letter-row buffer' : 'letter-row'}>
      <strong>{sticker.letter}</strong>
      <span>{sticker.id}</span>
      <code>{setup.setup || 'none'}</code>
      <code>{undo || 'none'}</code>
    </div>
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
  setup: string
  swap: string
  undo: string
  alg: string
}

function buildExecutionSteps(memo: MemoResult | null): ExecutionStep[] {
  if (!memo) return []
  const edges = memo.edges.map((step) => ({
    phase: 'edge' as const,
    letter: step.letter,
    ...executionParts('edge', step.letter),
  }))
  const parity = memo.parity
    ? [
        {
          phase: 'parity' as const,
          letter: 'P',
          setup: '',
          swap: PARITY_ALG,
          undo: '',
          alg: PARITY_ALG,
        },
      ]
    : []
  const corners = memo.corners.map((step) => ({
    phase: 'corner' as const,
    letter: step.letter,
    ...executionParts('corner', step.letter),
  }))

  return [...edges, ...parity, ...corners]
}

function ExecutionParts({ step }: { step: ExecutionStep }) {
  return (
    <div className="execution-parts">
      <span className="part setup">
        <em>setup</em>
        <code>{step.setup || 'none'}</code>
      </span>
      <span className="part swap">
        <em>{step.phase === 'parity' ? 'parity' : 'swap'}</em>
        <code>{step.swap}</code>
      </span>
      <span className="part undo">
        <em>undo</em>
        <code>{step.undo || 'none'}</code>
      </span>
    </div>
  )
}

function executionParts(type: PieceType, letter: string) {
  const setup = setupMoves[type][letter] ?? ''
  const swap = type === 'edge' ? EDGE_SWAP : CORNER_SWAP
  const undo = invertAlg(setup)

  return {
    setup,
    swap,
    undo,
    alg: executionAlg(type, letter),
  }
}

function setupForSticker(sticker: Sticker): { kind: 'buffer' | 'target'; setup: string } {
  if (isBuffer(sticker.id)) {
    return { kind: 'buffer', setup: 'buffer' }
  }

  return { kind: 'target', setup: setupMoves[sticker.type][sticker.letter] ?? '' }
}

function isBuffer(sticker: string): boolean {
  return ['UR', 'RU', 'LUB', 'BUL', 'UBL'].includes(sticker)
}

function letterForSticker(sticker: string): string {
  return edgeStickerById.get(sticker)?.letter ?? cornerStickerById.get(sticker)?.letter ?? sticker
}

export default App
