import { useMemo, useState } from 'react'
import './App.css'

type TraitOption = {
  genotype: string
  label: string
  phenotype: string
}

type InheritancePattern = {
  id: string
  title: string
  summary: string
  example: string
  whyItMatters: string
}

type QuizQuestion = {
  prompt: string
  options: string[]
  answer: string
  explanation: string
}

const glossary = [
  {
    term: 'Gene',
    meaning: 'A section of DNA that contains instructions for a trait or function.',
  },
  {
    term: 'Allele',
    meaning: 'A version of a gene. Different allele combinations can change how a trait appears.',
  },
  {
    term: 'Genotype',
    meaning: 'The allele combination an organism carries, such as Bb or bb.',
  },
  {
    term: 'Phenotype',
    meaning: 'The observable outcome of the genotype, such as purple flowers.',
  },
  {
    term: 'Homozygous',
    meaning: 'Having two matching alleles, like BB or bb.',
  },
  {
    term: 'Heterozygous',
    meaning: 'Having two different alleles, like Bb.',
  },
]

const inheritancePatterns: InheritancePattern[] = [
  {
    id: 'dominant',
    title: 'Complete Dominance',
    summary:
      'One dominant allele is enough for the dominant phenotype to appear in a heterozygous organism.',
    example: 'Example classroom model: purple flowers (B) can mask white flowers (b).',
    whyItMatters: 'This is the classic model used in many intro Punnett square examples.',
  },
  {
    id: 'incomplete',
    title: 'Incomplete Dominance',
    summary:
      'Neither allele fully masks the other, so the phenotype appears blended in the heterozygous state.',
    example: 'Red and white flowers can produce pink flowers in some species.',
    whyItMatters: 'It shows that inheritance is not always a simple dominant-vs-recessive switch.',
  },
  {
    id: 'codominance',
    title: 'Codominance',
    summary:
      'Both alleles are expressed clearly in the phenotype instead of one hiding the other.',
    example: 'AB blood type expresses both A and B antigens.',
    whyItMatters: 'It helps explain why multiple trait signals can appear at the same time.',
  },
  {
    id: 'polygenic',
    title: 'Polygenic Traits',
    summary:
      'Multiple genes contribute to one phenotype, creating a wide range of outcomes.',
    example: 'Human height and skin tone are influenced by many genes and environmental factors.',
    whyItMatters: 'It explains why many real-world human traits do not fit a one-gene chart.',
  },
]

const timeline = [
  {
    year: '1860s',
    title: 'Mendel studies pea plants',
    text: 'Gregor Mendel tracked how visible traits passed from parent plants to offspring.',
  },
  {
    year: '1905',
    title: 'Punnett square introduced',
    text: 'Reginald Punnett created a simple diagram for predicting possible allele combinations.',
  },
  {
    year: '1953',
    title: 'DNA structure described',
    text: 'The double-helix model helped connect heredity to a physical molecule.',
  },
  {
    year: 'Today',
    title: 'Genomics expands genetics',
    text: 'Scientists study whole genomes, disease risk, gene regulation, and inherited variation.',
  },
]

const applications = [
  'Explaining inherited disorders and family risk patterns',
  'Breeding plants for crop color, disease resistance, and yield',
  'Using DNA evidence in forensics and ancestry studies',
  'Understanding how mutations and regulation affect health',
]

const quizQuestions: QuizQuestion[] = [
  {
    prompt: 'If an organism has genotype Bb in a complete dominance model, what is it?',
    options: ['Homozygous dominant', 'Heterozygous', 'Homozygous recessive'],
    answer: 'Heterozygous',
    explanation: 'Bb contains two different alleles, so it is heterozygous.',
  },
  {
    prompt: 'What does a Punnett square predict?',
    options: ['Guaranteed outcomes', 'Probable genotype combinations', 'DNA sequence length'],
    answer: 'Probable genotype combinations',
    explanation: 'Punnett squares show probabilities for inherited allele combinations.',
  },
  {
    prompt: 'Which statement is most accurate?',
    options: [
      'All traits follow one-gene dominant/recessive rules',
      'Many traits are shaped by multiple genes and environment',
      'Phenotype never depends on genotype',
    ],
    answer: 'Many traits are shaped by multiple genes and environment',
    explanation: 'Real inheritance is often more complex than a single Mendelian trait.',
  },
]

const parentOptions: TraitOption[] = [
  { genotype: 'BB', label: 'BB', phenotype: 'Purple petals' },
  { genotype: 'Bb', label: 'Bb', phenotype: 'Purple petals' },
  { genotype: 'bb', label: 'bb', phenotype: 'White petals' },
]

const imageCredits = [
  {
    title: 'Chromosome, DNA, and gene diagram',
    source: 'Wikipedia / Wikimedia Commons',
    href: 'https://en.wikipedia.org/wiki/DNA',
  },
  {
    title: 'Punnett square graphic',
    source: 'Wikipedia / Wikimedia Commons',
    href: 'https://en.wikipedia.org/wiki/Punnett_square',
  },
  {
    title: 'Gregor Mendel portrait',
    source: 'Wikipedia / Wikimedia Commons',
    href: 'https://en.wikipedia.org/wiki/Gregor_Mendel',
  },
  {
    title: 'Pea pods photograph',
    source: 'Wikipedia / Wikimedia Commons',
    href: 'https://en.wikipedia.org/wiki/Pea',
  },
]

const getGametes = (genotype: string) => genotype.split('')

const orderGenotype = (left: string, right: string) => {
  const pair = [left, right].sort((a, b) => {
    const aUpper = a === a.toUpperCase()
    const bUpper = b === b.toUpperCase()

    if (aUpper === bUpper) {
      return a.localeCompare(b)
    }

    return aUpper ? -1 : 1
  })

  return pair.join('')
}

const describePhenotype = (genotype: string) =>
  genotype.includes('B') ? 'Purple petals' : 'White petals'

function App() {
  const [activePattern, setActivePattern] = useState('dominant')
  const [parentOne, setParentOne] = useState('Bb')
  const [parentTwo, setParentTwo] = useState('Bb')
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const currentPattern =
    inheritancePatterns.find((pattern) => pattern.id === activePattern) ?? inheritancePatterns[0]

  const punnett = useMemo(() => {
    const top = getGametes(parentOne)
    const side = getGametes(parentTwo)
    const cells = side.map((rowAllele) =>
      top.map((columnAllele) => {
        const genotype = orderGenotype(columnAllele, rowAllele)
        return {
          genotype,
          phenotype: describePhenotype(genotype),
        }
      }),
    )

    const genotypeCounts = cells.flat().reduce<Record<string, number>>((acc, cell) => {
      acc[cell.genotype] = (acc[cell.genotype] ?? 0) + 1
      return acc
    }, {})

    const phenotypeCounts = cells.flat().reduce<Record<string, number>>((acc, cell) => {
      acc[cell.phenotype] = (acc[cell.phenotype] ?? 0) + 1
      return acc
    }, {})

    return {
      top,
      side,
      cells,
      genotypeCounts: Object.entries(genotypeCounts),
      phenotypeCounts: Object.entries(phenotypeCounts),
    }
  }, [parentOne, parentTwo])

  const score = quizQuestions.reduce((total, question, index) => {
    return total + (answers[index] === question.answer ? 1 : 0)
  }, 0)

  const activeQuestion = quizQuestions[selectedQuestion]
  const selectedAnswer = answers[selectedQuestion]

  return (
    <main className="page-shell">
      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow">BIO 200 INFOGRAPHIC</p>
          <h1>Genetics from DNA to dominant traits.</h1>
          <p className="hero-summary">
            This page explains the core language of genetics, how inheritance patterns work,
            why Mendel used peas, and how Punnett squares help predict probabilities.
          </p>

          <nav className="jump-links" aria-label="Page sections">
            <a href="#overview">Overview</a>
            <a href="#patterns">Patterns</a>
            <a href="#lab">Punnett Lab</a>
            <a href="#quiz">Quiz</a>
          </nav>

          <div className="hero-metrics">
            <div>
              <strong>6</strong>
              <span>key vocabulary terms</span>
            </div>
            <div>
              <strong>4</strong>
              <span>inheritance patterns</span>
            </div>
            <div>
              <strong>3</strong>
              <span>interactive study tools</span>
            </div>
          </div>
        </div>

        <div className="hero-media-grid">
          <article className="media-card large-card">
            <img src="/images/dna-diagram.png" alt="Diagram showing chromosome, DNA, and genes." />
            <div className="media-caption">
              <span>DNA structure</span>
              <p>Genes are carried on DNA, which is packaged into chromosomes.</p>
            </div>
          </article>

          <article className="media-card">
            <img src="/images/gregor-mendel.jpg" alt="Portrait of Gregor Mendel." />
            <div className="media-caption compact-caption">
              <span>Gregor Mendel</span>
              <p>Known for foundational pea plant experiments.</p>
            </div>
          </article>

          <article className="media-card">
            <img src="/images/pea-pods.jpg" alt="Green pea pods used as a classroom genetics example." />
            <div className="media-caption compact-caption">
              <span>Pea plants</span>
              <p>Visible traits made them useful for inheritance studies.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="overview-grid" id="overview">
        <article className="panel panel-wide intro-panel">
          <div className="section-heading">
            <p className="section-kicker">Overview</p>
            <h2>What genetics studies</h2>
          </div>
          <p className="section-text wide-text">
            Genetics is the study of heredity and variation. It explains how information is
            stored in DNA, passed through reproduction, and expressed as traits. In basic
            Mendelian models, traits are often taught using pairs of alleles, but real-life
            inheritance can also involve multiple genes, codominance, incomplete dominance,
            mutation, and environmental effects.
          </p>
          <div className="glossary-grid">
            {glossary.map((item) => (
              <div key={item.term} className="info-chip-card">
                <h3>{item.term}</h3>
                <p>{item.meaning}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="section-kicker">Quick Facts</p>
            <h2>DNA to trait</h2>
          </div>
          <div className="flow-list">
            <div><strong>DNA</strong><span>stores biological instructions</span></div>
            <div><strong>Genes</strong><span>are segments of DNA</span></div>
            <div><strong>Alleles</strong><span>are versions of a gene</span></div>
            <div><strong>Proteins</strong><span>help build visible traits</span></div>
            <div><strong>Phenotype</strong><span>is the observed result</span></div>
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="section-kicker">Science Note</p>
            <h2>Human trait charts are simplified</h2>
          </div>
          <p className="section-text">
            Classroom charts that label freckles, hairlines, or tongue rolling as purely
            dominant or recessive can be useful for introducing vocabulary, but many human
            traits are more complicated than a one-gene model.
          </p>
        </article>

        <article className="panel panel-wide">
          <div className="section-heading">
            <p className="section-kicker">History</p>
            <h2>Why Mendel matters</h2>
          </div>
          <div className="timeline-grid">
            {timeline.map((item) => (
              <div key={item.year} className="timeline-card">
                <span>{item.year}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel pattern-panel" id="patterns">
        <div className="section-heading">
          <p className="section-kicker">Inheritance Patterns</p>
          <h2>Not every trait works the same way</h2>
        </div>

        <div className="pattern-layout">
          <div className="pattern-tabs" role="tablist" aria-label="Inheritance patterns">
            {inheritancePatterns.map((pattern) => (
              <button
                key={pattern.id}
                type="button"
                className={pattern.id === activePattern ? 'pattern-tab active-tab' : 'pattern-tab'}
                onClick={() => setActivePattern(pattern.id)}
              >
                {pattern.title}
              </button>
            ))}
          </div>

          <div className="pattern-detail">
            <div>
              <p className="pattern-label">Current focus</p>
              <h3>{currentPattern.title}</h3>
            </div>
            <p>{currentPattern.summary}</p>
            <div className="pattern-note-grid">
              <div>
                <span>Example</span>
                <p>{currentPattern.example}</p>
              </div>
              <div>
                <span>Why it matters</span>
                <p>{currentPattern.whyItMatters}</p>
              </div>
            </div>
          </div>

          <aside className="pattern-image-card">
            <img src="/images/punnett-square.png" alt="Example Punnett square showing inheritance outcomes." />
            <p>Probability tools like Punnett squares work best when the inheritance model is clearly defined.</p>
          </aside>
        </div>
      </section>

      <section className="dense-grid">
        <article className="panel">
          <div className="section-heading">
            <p className="section-kicker">Mendel's Strategy</p>
            <h2>Why pea plants?</h2>
          </div>
          <ul className="bullet-list">
            <li>They grow relatively quickly.</li>
            <li>They show visible contrasting traits.</li>
            <li>Cross-pollination can be controlled by the experimenter.</li>
            <li>Large numbers of offspring make patterns easier to spot.</li>
          </ul>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="section-kicker">Applications</p>
            <h2>Why genetics matters now</h2>
          </div>
          <ul className="bullet-list">
            {applications.map((application) => (
              <li key={application}>{application}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel lab-panel" id="lab">
        <div className="section-heading">
          <p className="section-kicker">Interactive Punnett Lab</p>
          <h2>Test parent genotypes and inspect the outcomes</h2>
        </div>

        <div className="lab-controls">
          <label>
            Parent 1 genotype
            <select value={parentOne} onChange={(event) => setParentOne(event.target.value)}>
              {parentOptions.map((option) => (
                <option key={`one-${option.genotype}`} value={option.genotype}>
                  {option.label} - {option.phenotype}
                </option>
              ))}
            </select>
          </label>

          <label>
            Parent 2 genotype
            <select value={parentTwo} onChange={(event) => setParentTwo(event.target.value)}>
              {parentOptions.map((option) => (
                <option key={`two-${option.genotype}`} value={option.genotype}>
                  {option.label} - {option.phenotype}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="lab-grid">
          <div className="square-wrap">
            <div className="square-header-row">
              <span></span>
              {punnett.top.map((allele, index) => (
                <span key={`top-${allele}-${index}`} className="axis-chip">
                  {allele}
                </span>
              ))}
            </div>

            {punnett.cells.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="square-row">
                <span className="axis-chip side-chip">{punnett.side[rowIndex]}</span>
                {row.map((cell, cellIndex) => (
                  <div key={`${rowIndex}-${cellIndex}-${cell.genotype}`} className="square-cell">
                    <strong>{cell.genotype}</strong>
                    <span>{cell.phenotype}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="results-stack">
            <article className="result-panel">
              <h3>Genotype ratio</h3>
              <div className="result-list">
                {punnett.genotypeCounts.map(([genotype, count]) => (
                  <div key={genotype} className="result-row">
                    <strong>{genotype}</strong>
                    <span>{count}/4</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="result-panel">
              <h3>Phenotype ratio</h3>
              <div className="result-list">
                {punnett.phenotypeCounts.map(([phenotype, count]) => (
                  <div key={phenotype} className="result-row">
                    <strong>{phenotype}</strong>
                    <span>{Math.round((count / 4) * 100)}%</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="result-panel highlight-panel">
              <h3>Interpretation</h3>
              <p>
                This model shows probability, not certainty. If both parents are heterozygous
                (`Bb`), the classic genotype ratio is `1 BB : 2 Bb : 1 bb`, while the phenotype
                ratio is `3 purple : 1 white`.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="panel quiz-panel" id="quiz">
        <div className="section-heading">
          <p className="section-kicker">Interactive Review</p>
          <h2>Check your understanding</h2>
        </div>

        <div className="quiz-layout">
          <div className="question-nav">
            {quizQuestions.map((question, index) => (
              <button
                key={question.prompt}
                type="button"
                className={index === selectedQuestion ? 'question-tab active-question' : 'question-tab'}
                onClick={() => setSelectedQuestion(index)}
              >
                Q{index + 1}
              </button>
            ))}
            <div className="score-card">
              <span>Score</span>
              <strong>
                {score}/{quizQuestions.length}
              </strong>
            </div>
          </div>

          <div className="quiz-card">
            <h3>{activeQuestion.prompt}</h3>
            <div className="answer-stack">
              {activeQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option
                const isCorrect = activeQuestion.answer === option
                const className = isSelected
                  ? isCorrect
                    ? 'answer-button correct-answer'
                    : 'answer-button wrong-answer'
                  : 'answer-button'

                return (
                  <button
                    key={option}
                    type="button"
                    className={className}
                    onClick={() =>
                      setAnswers((previous) => ({
                        ...previous,
                        [selectedQuestion]: option,
                      }))
                    }
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            <div className="feedback-box">
              <strong>
                {selectedAnswer
                  ? selectedAnswer === activeQuestion.answer
                    ? 'Correct'
                    : 'Try again'
                  : 'Select an answer'}
              </strong>
              <p>{activeQuestion.explanation}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel credits-panel">
        <div className="section-heading">
          <p className="section-kicker">Asset Credits</p>
          <h2>Web images used on this page</h2>
        </div>
        <div className="credits-grid">
          {imageCredits.map((credit) => (
            <a key={credit.title} href={credit.href} target="_blank" rel="noreferrer" className="credit-card">
              <strong>{credit.title}</strong>
              <span>{credit.source}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
