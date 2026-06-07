import { useEffect, useMemo, useState, createContext, useContext, useRef } from 'react'
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
import { translations, type Language } from './translations'

type Mode = 'concepts' | 'guided' | 'trainer'

const LanguageContext = createContext<{
  lang: Language
  t: typeof translations['en']
  setLang: (lang: Language) => void
}>({
  lang: 'en',
  t: translations.en,
  setLang: () => {},
})

function useTranslation() {
  return useContext(LanguageContext)
}

function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('rubik-bld-lang')
    return saved === 'vi' || saved === 'en' ? saved : 'en'
  })

  const handleLangChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('rubik-bld-lang', newLang)
  }

  const t = translations[lang]

  const [mode, setMode] = useState<Mode>('concepts')
  const [scramble, setScramble] = useState(exampleScrambles[0])
  const [memo, setMemo] = useState<MemoResult | null>(null)
  const [guidedMemo, setGuidedMemo] = useState<MemoResult | null>(null)
  const [memoError, setMemoError] = useState('')
  const [selectedExecution, setSelectedExecution] = useState(0)
  const [selectedGuidedStep, setSelectedGuidedStep] = useState(0)

  const lessons = useMemo(() => [
    {
      id: 'concepts' as const,
      label: t.conceptsLabel,
      title: t.conceptsTitle,
      summary: t.conceptsSummary,
    },
    {
      id: 'guided' as const,
      label: t.guidedLabel,
      title: t.guidedTitle,
      summary: t.guidedSummary,
    },
    {
      id: 'trainer' as const,
      label: t.trainerLabel,
      title: t.trainerTitle,
      summary: t.trainerSummary,
    },
  ], [t])

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
          setMemoError(error instanceof Error ? error.message : t.invalidScramble)
        }
      })

    return () => {
      cancelled = true
    }
  }, [scramble, t.invalidScramble])

  const cubeAlg =
    mode === 'guided'
      ? (activeGuidedExecution?.alg ?? '')
      : mode === 'trainer'
        ? (activeExecution?.alg ?? '')
        : EDGE_SWAP

  return (
    <LanguageContext.Provider value={{ lang, t, setLang: handleLangChange }}>
      <main className="app-shell">
        <aside className="lesson-rail" aria-label="Learning modes">
          <div className="brand-mark">
            <span>3BLD</span>
            <strong>{t.brandMark}</strong>
            <div className="lang-switcher">
              <button
                type="button"
                className={lang === 'en' ? 'active' : ''}
                onClick={() => handleLangChange('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={lang === 'vi' ? 'active' : ''}
                onClick={() => handleLangChange('vi')}
              >
                VI
              </button>
            </div>
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
            <h2>{t.methodConstants}</h2>
            <dl>
              <div>
                <dt>{t.edgeBuffer}</dt>
                <dd>UR</dd>
              </div>
              <div>
                <dt>{t.edgeTarget}</dt>
                <dd>UL</dd>
              </div>
              <div>
                <dt>{t.cornerBuffer}</dt>
                <dd>LUB</dd>
              </div>
              <div>
                <dt>{t.cornerTarget}</dt>
                <dd>DFR</dd>
              </div>
            </dl>
          </section>
        </aside>

        <section className="workspace">
          <header className="workspace-header">
            <div>
              <p className="eyebrow">{t.eyebrow}</p>
              <h1>{selectedLesson.title}</h1>
              <p>{selectedLesson.summary}</p>
            </div>
            <div className="alg-chip">
              <span>{t.swapAlgs}</span>
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
              <span>{mode === 'trainer' ? t.activeExecution : t.visibleAlgorithm}</span>
              <code>{cubeAlg || t.selectTargetLetter}</code>
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
    </LanguageContext.Provider>
  )
}

function ConceptsPanel() {
  const { t } = useTranslation()
  const [activeAlgSticker, setActiveAlgSticker] = useState<Sticker | null>(null)
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (activeAlgSticker) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [activeAlgSticker])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return

      const rect = dialog.getBoundingClientRect()
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      )

      if (!isDialogContent) {
        dialog.close()
        setActiveAlgSticker(null)
      }
    }

    dialog.addEventListener('click', handleBackdropClick)
    return () => {
      dialog.removeEventListener('click', handleBackdropClick)
    }
  }, [activeAlgSticker])

  return (
    <section className="content-grid">
      <LetterSchemeCube onOpenDialog={setActiveAlgSticker} />

      <article className="learning-panel wide">
        <h2>{t.conceptStack}</h2>
        <ol className="concept-list">
          {t.conceptsList.map((concept, index) => (
            <li key={index}>
              <strong>{concept.title} </strong>
              {concept.desc}
            </li>
          ))}
        </ol>
      </article>

      <AlgorithmCard title={t.edgeSwap} label={t.urToUl} alg={EDGE_SWAP} />
      <AlgorithmCard title={t.cornerSwap} label={t.lubToDfr} alg={CORNER_SWAP} />
      <AlgorithmCard title={t.parity} label={t.oddAndOdd} alg={PARITY_ALG} />

      <div className="letter-schemes">
        <LetterMap title={t.edgeLetterScheme} type="edge" onRowClick={setActiveAlgSticker} />
        <LetterMap title={t.cornerLetterScheme} type="corner" onRowClick={setActiveAlgSticker} />
      </div>
      <SlowLearningGuide />

      {activeAlgSticker && (
        <dialog
          ref={dialogRef}
          className="alg-dialog"
          {...({ closedby: 'any' } as Record<string, string>)}
          aria-labelledby="dialog-title"
          onClose={() => setActiveAlgSticker(null)}
        >
          <div className="dialog-header">
            <h2 id="dialog-title">
              {t.fullAlgorithmDialogTitle
                .replace('{letter}', activeAlgSticker.letter)
                .replace('{sticker}', activeAlgSticker.id)}
            </h2>
            <button
              type="button"
              className="dialog-close-btn"
              onClick={() => {
                dialogRef.current?.close()
                setActiveAlgSticker(null)
              }}
              aria-label={t.closeDialog}
            >
              &times;
            </button>
          </div>
          <div className="dialog-body">
            <div className="dialog-cube-frame">
              <twisty-player
                key={`dialog-${activeAlgSticker.type}-${activeAlgSticker.letter}`}
                puzzle="3x3x3"
                alg={executionAlg(activeAlgSticker.type, activeAlgSticker.letter)}
                experimental-setup-anchor="start"
                hint-facelets="floating"
                background="none"
                back-view="top-right"
              />
            </div>
            <div className="dialog-alg-details">
              <div className="dialog-alg-chip">
                <span>{t.visibleAlgorithm}</span>
                <code>{executionAlg(activeAlgSticker.type, activeAlgSticker.letter)}</code>
              </div>
              <div className="dialog-alg-steps">
                <div>
                  <strong>{t.setupMovesLabel}:</strong>
                  <code>{setupMoves[activeAlgSticker.type][activeAlgSticker.letter] || t.none}</code>
                </div>
                <div>
                  <strong>{activeAlgSticker.type === 'edge' ? t.edgeSwap : t.cornerSwap}:</strong>
                  <code>{activeAlgSticker.type === 'edge' ? EDGE_SWAP : CORNER_SWAP}</code>
                </div>
                <div>
                  <strong>{t.undoMovesLabel}:</strong>
                  <code>{invertAlg(setupMoves[activeAlgSticker.type][activeAlgSticker.letter] ?? '') || t.none}</code>
                </div>
              </div>
            </div>
          </div>
        </dialog>
      )}
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

function LetterSchemeCube({ onOpenDialog }: { onOpenDialog: (sticker: Sticker) => void }) {
  const { t } = useTranslation()
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)

  const stickerData = selectedSticker
    ? (edgeStickerById.get(selectedSticker) || cornerStickerById.get(selectedSticker))
    : null

  return (
    <article className="learning-panel wide letter-cube-panel">
      <div className="panel-heading">
        <div>
          <h2>{t.letterSchemeCube}</h2>
          <p>{t.letterSchemeCubeDesc}</p>
        </div>
        <span className="buffer-key">{t.bufferStickersHighlighted}</span>
      </div>

      <div className="cube-interaction-layout">
        <div className="scheme-net" aria-label="Full letter scheme net">
          <div />
          <CubeFace
            face="U"
            stickers={cubeFaces.U}
            selectedSticker={selectedSticker}
            onSelectSticker={setSelectedSticker}
          />
          <div />
          <CubeFace
            face="L"
            stickers={cubeFaces.L}
            selectedSticker={selectedSticker}
            onSelectSticker={setSelectedSticker}
          />
          <CubeFace
            face="F"
            stickers={cubeFaces.F}
            selectedSticker={selectedSticker}
            onSelectSticker={setSelectedSticker}
          />
          <CubeFace
            face="R"
            stickers={cubeFaces.R}
            selectedSticker={selectedSticker}
            onSelectSticker={setSelectedSticker}
          />
          <div />
          <CubeFace
            face="B"
            stickers={cubeFaces.B}
            selectedSticker={selectedSticker}
            onSelectSticker={setSelectedSticker}
          />
          <div />
          <div />
          <CubeFace
            face="D"
            stickers={cubeFaces.D}
            selectedSticker={selectedSticker}
            onSelectSticker={setSelectedSticker}
          />
          <div />
        </div>

        <div className="sticker-details-container">
          {stickerData ? (
            <div className="sticker-details-card">
              <div className="details-header">
                <div className="sticker-info">
                  <span className="sticker-label">{t.selectedStickerLabel}</span>
                  <div className="sticker-badge-row">
                    <span className={`sticker-letter-bubble face-${stickerData.id[0]}`}>{stickerData.letter}</span>
                    <span className="sticker-id-pill">{stickerData.id}</span>
                    <span className={`piece-type-pill ${stickerData.type}`}>
                      {stickerData.type === 'edge' ? t.edgesCard.toLowerCase() : t.cornersCard.toLowerCase()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="close-details-btn"
                  onClick={() => setSelectedSticker(null)}
                  aria-label="Close details"
                >
                  &times;
                </button>
              </div>
              <div className="details-body">
                <div className="move-card">
                  <span className="move-label">{t.setupMovesLabel}</span>
                  <code className="move-code">
                    {isBuffer(stickerData.id)
                      ? t.bufferLabel
                      : (setupMoves[stickerData.type][stickerData.letter] || t.none)}
                  </code>
                </div>
                <div className="move-card">
                  <span className="move-label">{t.undoMovesLabel}</span>
                  <code className="move-code">
                    {isBuffer(stickerData.id)
                      ? t.bufferLabel
                      : (invertAlg(setupMoves[stickerData.type][stickerData.letter] ?? '') || t.none)}
                  </code>
                </div>
                {!isBuffer(stickerData.id) && (
                  <button
                    type="button"
                    className="play-alg-btn"
                    onClick={() => onOpenDialog(stickerData)}
                  >
                    <span>▶</span> {t.runAlgorithm}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="sticker-details-placeholder">
              <p>💡 {t.clickToViewSetup}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function CubeFace({
  face,
  stickers,
  selectedSticker,
  onSelectSticker,
}: {
  face: string
  stickers: string[][]
  selectedSticker: string | null
  onSelectSticker: (sticker: string | null) => void
}) {
  return (
    <div className={`cube-face face-${face}`} aria-label={`${face} face`}>
      {stickers.flat().map((sticker) => {
        const isLetter = sticker.length > 1
        const isSelected = selectedSticker === sticker
        const isBuf = isBuffer(sticker)
        const className = [
          isLetter ? 'clickable-sticker' : '',
          isBuf ? 'buffer' : '',
          isSelected ? 'selected' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <span
            key={`${face}-${sticker}`}
            className={className}
            onClick={() => isLetter && onSelectSticker(sticker)}
          >
            <strong>{letterForSticker(sticker)}</strong>
            <small>{sticker}</small>
          </span>
        )
      })}
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
  const { t } = useTranslation()
  const edgeSteps = executionSteps.filter((step) => step.phase === 'edge')
  const cornerSteps = executionSteps.filter((step) => step.phase === 'corner')

  return (
    <section className="content-grid guided-grid">
      <article className="learning-panel wide guided-intro">
        <h2>{t.workedExampleScramble}</h2>
        <code>{exampleScrambles[0]}</code>
        <p>{t.guidedIntro}</p>
      </article>

      <article className="learning-panel">
        <h2>{t.step1EdgeMemo}</h2>
        <p>{t.edgeMemoDesc}</p>
        <strong className="memo-line">{memo?.edgePairs.join(' ') || 'Loading...'}</strong>
        <ol className="detail-list">
          <li>{t.edgeMemoTip1}</li>
          <li>{t.edgeMemoTip2}</li>
          <li>{t.edgeMemoTip3}</li>
        </ol>
      </article>

      <article className="learning-panel">
        <h2>{t.step2CornerMemo}</h2>
        <p>{t.cornerMemoDesc}</p>
        <strong className="memo-line">{memo?.cornerPairs.join(' ') || 'Loading...'}</strong>
        <ol className="detail-list">
          <li>{t.cornerMemoTip1}</li>
          <li>{t.cornerMemoTip2}</li>
          <li>{t.cornerMemoTip3}</li>
        </ol>
      </article>

      <article className="learning-panel">
        <h2>{t.step3CheckParity}</h2>
        <strong className={memo?.parity ? 'parity-on' : 'parity-off'}>
          {memo?.parity ? t.runParityAfterEdges : t.noParityInExample}
        </strong>
        <p>{t.parityDesc}</p>
      </article>

      <article className="learning-panel">
        <h2>{t.step4ExecuteEdges}</h2>
        <p>{t.executeEdgesDesc}</p>
        <strong className="step-count">{edgeSteps.length} {t.edgeLettersCount}</strong>
      </article>

      <article className="learning-panel">
        <h2>{t.step5ExecuteCorners}</h2>
        <p>{t.executeCornersDesc}</p>
        <strong className="step-count">{cornerSteps.length} {t.cornerLettersCount}</strong>
      </article>

      <article className="learning-panel wide">
        <h2>{t.numberedExecutionWalkthrough}</h2>
        <div className="guided-execution-list">
          {executionSteps.map((step, index) => (
            <button
              key={`${step.phase}-${step.letter}-${index}`}
              type="button"
              className={index === selectedExecution ? 'active' : ''}
              onClick={() => onSelectExecution(index)}
            >
              <span className="step-number">{index + 1}</span>
              <span>{step.phase === 'edge' ? t.edgesCard.toLowerCase() : step.phase === 'corner' ? t.cornersCard.toLowerCase() : step.phase}</span>
              <strong>{step.letter}</strong>
              <ExecutionParts step={step} />
            </button>
          ))}
        </div>
      </article>

      <article className="learning-panel wide">
        <h2>{t.howToUsePage}</h2>
        <ol className="detail-list">
          {t.howToUseTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
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
  const { t } = useTranslation()
  return (
    <section className="content-grid trainer-grid">
      <article className="learning-panel wide">
        <div className="panel-heading">
          <h2>{t.scrambleTitle}</h2>
          <select
            aria-label={t.exampleScrambleSelect}
            value={scramble}
            onChange={(event) => onSelectExample(event.target.value)}
          >
            {exampleScrambles.map((example, index) => (
              <option key={example} value={example}>
                {langSelectText(t.exampleScrambleSelect, index + 1)}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={scramble}
          onChange={(event) => onScrambleChange(event.target.value)}
          aria-label={t.scrambleInputLabel}
          spellCheck={false}
        />
        {memoError && <p className="error-text">{memoError}</p>}
      </article>

      <MemoCard title={t.edgesCard} pairs={memo?.edgePairs ?? []} count={memo?.edges.length ?? 0} />
      <MemoCard
        title={t.cornersCard}
        pairs={memo?.cornerPairs ?? []}
        count={memo?.corners.length ?? 0}
      />

      <article className="learning-panel parity-panel">
        <h2>{t.parity}</h2>
        <strong className={memo?.parity ? 'parity-on' : 'parity-off'}>
          {memo?.parity ? t.runParity : t.noParity}
        </strong>
        <code>{memo?.parity ? PARITY_ALG : t.parityConditionMuted}</code>
      </article>

      <article className="learning-panel wide">
        <h2>{t.executionList}</h2>
        <div className="execution-list">
          {executionSteps.map((step, index) => (
            <button
              key={`${step.phase}-${step.letter}-${index}`}
              type="button"
              className={index === selectedExecution ? 'active' : ''}
              onClick={() => onSelectExecution(index)}
            >
              <span>{step.phase === 'edge' ? t.edgesCard.toLowerCase() : step.phase === 'corner' ? t.cornersCard.toLowerCase() : step.phase}</span>
              <strong>{step.letter}</strong>
              <ExecutionParts step={step} />
            </button>
          ))}
        </div>
      </article>

      <article className="learning-panel wide">
        <h2>{t.slowSolveProtocol}</h2>
        <div className="protocol-grid">
          <section>
            <h3>{t.protocolMemoTitle}</h3>
            <p>{t.protocolMemoDesc}</p>
          </section>
          <section>
            <h3>{t.protocolExecTitle}</h3>
            <p>{t.protocolExecDesc}</p>
          </section>
          <section>
            <h3>{t.protocolErrorTitle}</h3>
            <p>{t.protocolErrorDesc}</p>
          </section>
        </div>
      </article>
    </section>
  )
}

function langSelectText(prefix: string, index: number): string {
  if (prefix === 'Lượt xáo ví dụ') {
    return `Ví dụ ${index}`
  }
  return `Example ${index}`
}

function SlowLearningGuide() {
  const { t } = useTranslation()
  return (
    <>
      <article className="learning-panel wide">
        <h2>{t.slowLearnerRoadmap}</h2>
        <div className="roadmap-grid">
          {t.roadmap.map((item) => (
            <section key={item.title} className="roadmap-step">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </section>
          ))}
        </div>
      </article>

      <article className="learning-panel">
        <h2>{t.readinessChecklist}</h2>
        <ul className="check-list">
          {t.beginnerChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="learning-panel">
        <h2>{t.practiceSchedule}</h2>
        <ol className="detail-list">
          {t.slowPracticePlan.map((item) => (
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

function LetterMap({
  title,
  type,
  onRowClick,
}: {
  title: string
  type: PieceType
  onRowClick: (sticker: Sticker) => void
}) {
  const { t } = useTranslation()
  const stickers = [...(type === 'edge' ? edgeStickers : cornerStickers)].sort(
    (a, b) => a.letter.localeCompare(b.letter),
  )

  return (
    <article className="learning-panel letter-scheme-panel">
      <h2>{title}</h2>
      <div className="letter-table">
        <div className="letter-table-head" aria-hidden="true">
          <span>{t.letterTableHead.letter}</span>
          <span>{t.letterTableHead.sticker}</span>
          <span>{t.letterTableHead.setup}</span>
          <span>{t.letterTableHead.undo}</span>
        </div>
        {stickers.map((sticker) => (
          <LetterSetupRow
            key={sticker.id}
            sticker={sticker}
            onClick={() => onRowClick(sticker)}
          />
        ))}
      </div>
    </article>
  )
}

function LetterSetupRow({
  sticker,
  onClick,
}: {
  sticker: Sticker
  onClick: () => void
}) {
  const { t } = useTranslation()
  const setup = setupForSticker(sticker)
  const undo = setup.kind === 'target' ? invertAlg(setup.setup) : setup.setup
  const isBuf = isBuffer(sticker.id)

  return (
    <div
      className={isBuf ? 'letter-row buffer' : 'letter-row clickable'}
      onClick={!isBuf ? onClick : undefined}
      role={!isBuf ? 'button' : undefined}
      tabIndex={!isBuf ? 0 : undefined}
      onKeyDown={
        !isBuf
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <strong>{sticker.letter}</strong>
      <span>{sticker.id}</span>
      <code>{setup.setup || t.none}</code>
      <code>{undo || t.none}</code>
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
  const { t } = useTranslation()
  return (
    <article className="learning-panel memo-card">
      <div>
        <h2>{title}</h2>
        <span>{count} {t.lettersUnit}</span>
      </div>
      <p>{pairs.length ? pairs.join(' ') : t.solved}</p>
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
  const { t } = useTranslation()
  return (
    <div className="execution-parts">
      <span className="part setup">
        <em>setup</em>
        <code>{step.setup || t.none}</code>
      </span>
      <span className="part swap">
        <em>{step.phase === 'parity' ? 'parity' : 'swap'}</em>
        <code>{step.swap}</code>
      </span>
      <span className="part undo">
        <em>undo</em>
        <code>{step.undo || t.none}</code>
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
