import { useMemo, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

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

type TraitDefinition = {
  key: TraitKey
  name: string
  dominantAllele: string
  recessiveAllele: string
  dominantLabel: string
  recessiveLabel: string
  description: string
}

type TraitKey =
  | 'widowsPeak'
  | 'hairTexture'
  | 'tongueRolling'
  | 'freckles'
  | 'earLobes'

type ParentState = Record<TraitKey, { parentOne: string; parentTwo: string }>
type ChildProfile = Record<TraitKey, { genotype: string; phenotype: string }>

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
    meaning: 'The allele combination an organism carries, such as Ww or ww.',
  },
  {
    term: 'Phenotype',
    meaning: 'The observable outcome of the genotype, such as curly hair or freckles.',
  },
  {
    term: 'Homozygous',
    meaning: 'Having two matching alleles, like WW or ww.',
  },
  {
    term: 'Heterozygous',
    meaning: 'Having two different alleles, like Ww.',
  },
]

const inheritancePatterns: InheritancePattern[] = [
  {
    id: 'dominant',
    title: 'Complete Dominance',
    summary:
      'One dominant allele is enough for the dominant phenotype to appear in a heterozygous organism.',
    example: 'A classroom model may show widow’s peak as dominant over a straight hairline.',
    whyItMatters: 'This is the simplified inheritance pattern used in most introductory trait charts.',
  },
  {
    id: 'incomplete',
    title: 'Incomplete Dominance',
    summary:
      'Neither allele fully masks the other, so the heterozygous phenotype appears blended.',
    example: 'Red and white flowers can produce pink flowers in some species.',
    whyItMatters: 'It shows that not every phenotype fits a strict dominant-versus-recessive rule.',
  },
  {
    id: 'codominance',
    title: 'Codominance',
    summary:
      'Both alleles are expressed clearly instead of one hiding the other.',
    example: 'AB blood type shows both A and B antigens.',
    whyItMatters: 'It helps explain why multiple inherited signals can appear at the same time.',
  },
  {
    id: 'polygenic',
    title: 'Polygenic Traits',
    summary:
      'Multiple genes contribute to one visible trait, creating a wide range of outcomes.',
    example: 'Height and skin tone are influenced by many genes and environmental factors.',
    whyItMatters: 'It explains why many real human traits do not behave like a single-gene chart.',
  },
]

const quizQuestions: QuizQuestion[] = [
  {
    prompt: 'If an organism has genotype Ww in a complete dominance model, what is it?',
    options: ['Homozygous dominant', 'Heterozygous', 'Homozygous recessive'],
    answer: 'Heterozygous',
    explanation: 'Ww contains two different alleles, so it is heterozygous.',
  },
  {
    prompt: 'What does a Punnett square predict?',
    options: ['Guaranteed outcomes', 'Probable genotype combinations', 'DNA sequence length'],
    answer: 'Probable genotype combinations',
    explanation: 'Punnett squares show probabilities for inherited allele combinations.',
  },
  {
    prompt: 'Why are classroom human trait charts limited?',
    options: [
      'They always describe every human trait perfectly',
      'Many real traits involve multiple genes and environmental effects',
      'Genes do not influence phenotype',
    ],
    answer: 'Many real traits involve multiple genes and environmental effects',
    explanation: 'Real human inheritance is often more complex than a one-gene classroom model.',
  },
]

const traitDefinitions: TraitDefinition[] = [
  {
    key: 'widowsPeak',
    name: 'Hairline',
    dominantAllele: 'W',
    recessiveAllele: 'w',
    dominantLabel: "Widow's peak",
    recessiveLabel: 'Straight hairline',
    description: 'Use a simple dominant/recessive model for hairline shape.',
  },
  {
    key: 'hairTexture',
    name: 'Hair Texture',
    dominantAllele: 'C',
    recessiveAllele: 'c',
    dominantLabel: 'Curly hair',
    recessiveLabel: 'Straight hair',
    description: 'Choose parent alleles for a simple classroom model of hair texture.',
  },
  {
    key: 'tongueRolling',
    name: 'Tongue Rolling',
    dominantAllele: 'R',
    recessiveAllele: 'r',
    dominantLabel: 'Can roll tongue',
    recessiveLabel: "Can't roll tongue",
    description: 'This trait is often used in intro genetics charts as a basic example.',
  },
  {
    key: 'freckles',
    name: 'Freckles',
    dominantAllele: 'F',
    recessiveAllele: 'f',
    dominantLabel: 'Freckles',
    recessiveLabel: 'No freckles',
    description: 'Select the parent alleles and compare the predicted child outcomes.',
  },
  {
    key: 'earLobes',
    name: 'Ear Lobes',
    dominantAllele: 'E',
    recessiveAllele: 'e',
    dominantLabel: 'Free ear lobes',
    recessiveLabel: 'Attached ear lobes',
    description: 'A simple inheritance chart can model ear lobe attachment as dominant or recessive.',
  },
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

const defaultParents: ParentState = {
  widowsPeak: { parentOne: 'Ww', parentTwo: 'Ww' },
  hairTexture: { parentOne: 'Cc', parentTwo: 'Cc' },
  tongueRolling: { parentOne: 'Rr', parentTwo: 'Rr' },
  freckles: { parentOne: 'Ff', parentTwo: 'Ff' },
  earLobes: { parentOne: 'Ee', parentTwo: 'Ee' },
}

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

const getPhenotype = (trait: TraitDefinition, genotype: string) =>
  genotype.includes(trait.dominantAllele) ? trait.dominantLabel : trait.recessiveLabel

const getTraitProbabilities = (trait: TraitDefinition, parentOne: string, parentTwo: string) => {
  const top = getGametes(parentOne)
  const side = getGametes(parentTwo)
  const cells = side.flatMap((rowAllele) =>
    top.map((columnAllele) => {
      const genotype = orderGenotype(columnAllele, rowAllele)
      return {
        genotype,
        phenotype: getPhenotype(trait, genotype),
      }
    }),
  )

  const genotypeCounts = cells.reduce<Record<string, number>>((acc, cell) => {
    acc[cell.genotype] = (acc[cell.genotype] ?? 0) + 1
    return acc
  }, {})

  const phenotypeCounts = cells.reduce<Record<string, number>>((acc, cell) => {
    acc[cell.phenotype] = (acc[cell.phenotype] ?? 0) + 1
    return acc
  }, {})

  return {
    cells,
    genotypeCounts: Object.entries(genotypeCounts),
    phenotypeCounts: Object.entries(phenotypeCounts),
  }
}

const pickRandomCell = <T,>(cells: T[]) => cells[Math.floor(Math.random() * cells.length)]

const buildChildProfile = (parents: ParentState): ChildProfile => {
  return traitDefinitions.reduce<ChildProfile>((profile, trait) => {
    const probabilities = getTraitProbabilities(
      trait,
      parents[trait.key].parentOne,
      parents[trait.key].parentTwo,
    )
    const selected = pickRandomCell(probabilities.cells)

    profile[trait.key] = {
      genotype: selected.genotype,
      phenotype: selected.phenotype,
    }

    return profile
  }, {} as ChildProfile)
}

function TraitIllustration({ trait, phenotype }: { trait: TraitDefinition; phenotype: string }) {
  const isDominant = phenotype === trait.dominantLabel

  return (
    <svg viewBox="0 0 120 120" className="trait-illustration" aria-hidden="true">
      <circle cx="60" cy="62" r="28" className="trait-face" />

      {trait.key === 'widowsPeak' ? (
        <>
          <path
            d={isDominant ? 'M26 45 C36 18, 84 18, 94 45 L76 45 L60 30 L44 45 Z' : 'M26 45 C36 18, 84 18, 94 45 Z'}
            className="trait-hair"
          />
          <text x="60" y="102" textAnchor="middle" className="trait-text-svg">Hairline</text>
        </>
      ) : null}

      {trait.key === 'hairTexture' ? (
        <>
          <path d="M24 44 C34 18, 86 18, 96 44 L96 54 C86 44, 78 58, 68 46 C58 58, 48 42, 38 56 C34 52, 29 49, 24 54 Z" className="trait-hair" />
          {isDominant ? (
            <path d="M34 63 C29 70, 38 74, 34 82 M50 61 C45 68, 54 74, 49 84 M71 61 C66 68, 75 74, 70 84 M86 62 C80 69, 89 75, 84 84" className="trait-accent-stroke" />
          ) : (
            <path d="M32 62 H88" className="trait-accent-stroke" />
          )}
          <text x="60" y="102" textAnchor="middle" className="trait-text-svg">Hair</text>
        </>
      ) : null}

      {trait.key === 'tongueRolling' ? (
        <>
          <path d="M44 70 Q60 82 76 70" className="trait-accent-stroke" />
          {isDominant ? (
            <path d="M48 71 Q60 58 72 71 Q60 78 48 71" className="trait-mouth" />
          ) : (
            <line x1="46" y1="72" x2="74" y2="72" className="trait-accent-stroke" />
          )}
          <text x="60" y="102" textAnchor="middle" className="trait-text-svg">Tongue</text>
        </>
      ) : null}

      {trait.key === 'freckles' ? (
        <>
          <path d="M26 44 C36 18, 84 18, 94 44 Z" className="trait-hair" />
          {isDominant ? (
            <>
              <circle cx="48" cy="66" r="1.8" className="trait-freckle" />
              <circle cx="52" cy="70" r="1.6" className="trait-freckle" />
              <circle cx="70" cy="66" r="1.8" className="trait-freckle" />
              <circle cx="66" cy="70" r="1.6" className="trait-freckle" />
            </>
          ) : null}
          <text x="60" y="102" textAnchor="middle" className="trait-text-svg">Freckles</text>
        </>
      ) : null}

      {trait.key === 'earLobes' ? (
        <>
          <path d="M26 44 C36 18, 84 18, 94 44 Z" className="trait-hair" />
          <ellipse cx="32" cy="66" rx="5" ry={isDominant ? 9 : 6} className="trait-face" />
          <ellipse cx="88" cy="66" rx="5" ry={isDominant ? 9 : 6} className="trait-face" />
          {!isDominant ? (
            <line x1="27" y1="71" x2="37" y2="71" className="trait-accent-stroke" />
          ) : null}
          <text x="60" y="102" textAnchor="middle" className="trait-text-svg">Ears</text>
        </>
      ) : null}

      <circle cx="50" cy="60" r="2.2" className="trait-eye" />
      <circle cx="70" cy="60" r="2.2" className="trait-eye" />
    </svg>
  )
}

function ChildAvatar({ profile }: { profile: ChildProfile }) {
  const hairline = profile.widowsPeak.phenotype === "Widow's peak"
  const curlyHair = profile.hairTexture.phenotype === 'Curly hair'
  const freckles = profile.freckles.phenotype === 'Freckles'
  const freeEarLobes = profile.earLobes.phenotype === 'Free ear lobes'
  const tongueRolling = profile.tongueRolling.phenotype === 'Can roll tongue'

  return (
    <svg viewBox="0 0 220 220" className="child-avatar" aria-hidden="true">
      <rect x="0" y="0" width="220" height="220" rx="24" className="child-avatar-bg" />
      <circle cx="110" cy="104" r="58" className="child-face" />
      <ellipse cx="54" cy="107" rx="10" ry={freeEarLobes ? 16 : 10} className="child-face" />
      <ellipse cx="166" cy="107" rx="10" ry={freeEarLobes ? 16 : 10} className="child-face" />
      <path
        d={hairline ? 'M46 84 C60 26, 160 26, 174 84 L138 84 L110 60 L82 84 Z' : 'M46 84 C60 26, 160 26, 174 84 Z'}
        className="child-hair"
      />
      {curlyHair ? (
        <path d="M54 82 C46 92, 61 98, 54 110 M78 76 C70 87, 85 95, 78 108 M110 72 C101 84, 118 94, 110 108 M141 75 C133 86, 149 94, 141 108 M166 82 C158 92, 173 99, 166 111" className="child-curl" />
      ) : null}
      <circle cx="88" cy="104" r="5" className="child-eye" />
      <circle cx="132" cy="104" r="5" className="child-eye" />
      <path d="M108 106 L102 126 L112 126" className="child-nose" />
      {tongueRolling ? (
        <path d="M84 146 Q110 124 136 146 Q110 162 84 146" className="child-mouth" />
      ) : (
        <path d="M86 146 Q110 156 134 146" className="child-mouth-line" />
      )}
      {freckles ? (
        <>
          <circle cx="88" cy="132" r="2.4" className="child-freckle" />
          <circle cx="95" cy="138" r="2.1" className="child-freckle" />
          <circle cx="132" cy="132" r="2.4" className="child-freckle" />
          <circle cx="125" cy="138" r="2.1" className="child-freckle" />
        </>
      ) : null}
    </svg>
  )
}

function SiteNav() {
  return (
    <header className="site-nav-shell">
      <nav className="site-nav" aria-label="Main navigation">
        <div className="site-brand">
          <span className="eyebrow">Genetics Guide</span>
          <strong>DNA, inheritance, and trait prediction</strong>
        </div>
        <div className="site-nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active-nav-link' : 'nav-link')}>
            Information
          </NavLink>
          <NavLink to="/lab" className={({ isActive }) => (isActive ? 'nav-link active-nav-link' : 'nav-link')}>
            Lab & Tests
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

function InfoPage() {
  const [activePattern, setActivePattern] = useState('dominant')
  const currentPattern =
    inheritancePatterns.find((pattern) => pattern.id === activePattern) ?? inheritancePatterns[0]

  return (
    <main className="page-shell">
      <SiteNav />

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Genetics Infographic</p>
          <h1>Genetics from DNA to inherited traits.</h1>
          <p className="hero-summary">
            Learn the vocabulary, inheritance patterns, and scientific context here, then use the
            separate lab page to build parent traits and generate a child outcome.
          </p>
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

      <section className="overview-grid">
        <article className="panel panel-wide">
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

        <article className="panel panel-wide">
          <div className="section-heading">
            <p className="section-kicker">Quick Facts</p>
            <h2>DNA to trait</h2>
          </div>
          <p className="section-text wide-text">
            DNA stores biological instructions. Inside DNA are genes, and genes can exist in
            different versions called alleles. The exact allele combination an organism inherits
            is its genotype. That genotype can influence which proteins are made, how cells behave,
            and what physical traits become visible. The visible result is called the phenotype.
            In introductory genetics, this flow from DNA to gene to phenotype is often taught with
            simple examples so students can focus on the core logic of inheritance before moving
            into more complicated systems.
          </p>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="section-kicker">Science Note</p>
            <h2>Human trait charts are simplified</h2>
          </div>
          <p className="section-text">
            Classroom charts that label freckles, hairlines, tongue rolling, or attached ear
            lobes as purely dominant or recessive can be useful for introducing vocabulary, but
            they leave out a lot of real biology. Many human traits are influenced by more than
            one gene, which means a single allele pair does not fully explain the result. Gene
            expression can also vary from person to person, so two people with similar genotypes
            may not show a trait in exactly the same way. Environment matters too: nutrition,
            development, age, and other outside factors can affect how strongly a trait appears.
            That is why simple trait charts work best as classroom models for learning the basics
            of heredity, not as perfect rules for predicting real human appearance.
          </p>
        </article>

        <article className="panel panel-wide">
          <div className="section-heading">
            <p className="section-kicker">History</p>
            <h2>Why Mendel matters</h2>
          </div>
          <p className="section-text wide-text">
            Gregor Mendel matters because he helped turn heredity into something that could be
            measured, tested, and explained with evidence instead of guesswork. By working with pea
            plants and carefully counting the traits that appeared across generations, he showed
            that inheritance often follows predictable patterns. His work helped establish the idea
            that parents pass discrete units of information to offspring, even though scientists at
            the time did not yet know that DNA was the molecule carrying that information.
          </p>
          <p className="section-text wide-text text-block-spacing">
            Mendel also mattered because of his method. He chose traits that were visibly different,
            controlled which plants reproduced, and recorded enough offspring to detect numerical
            patterns. That careful design made it possible to compare expectation and outcome. Later
            scientists built on that foundation by connecting Mendel's inheritance patterns to
            chromosomes, genes, and eventually the structure of DNA. In other words, Mendel did not
            solve all of genetics, but he created one of the first strong experimental frameworks
            for studying how traits pass between generations.
          </p>
          <p className="section-text wide-text text-block-spacing">
            Modern genetics has moved far beyond Mendel, especially when scientists study polygenic
            traits, gene regulation, mutation, and environmental influence. Even so, Mendel remains
            central in biology education because his work introduces the logic behind dominant and
            recessive inheritance, probability, and prediction. His experiments are still used today
            because they provide a clear entry point into a subject that quickly becomes much more
            complex.
          </p>
        </article>
      </section>

      <section className="panel pattern-panel">
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
            <p>These models are useful for learning probabilities, even though many real traits are more complex.</p>
          </aside>
        </div>
      </section>

      <section className="overview-grid">
        <article className="panel panel-wide">
          <div className="section-heading">
            <p className="section-kicker">Mendel's Strategy</p>
            <h2>Why pea plants?</h2>
          </div>
          <p className="section-text wide-text">
            Pea plants were effective for Mendel's experiments because they gave him a practical
            way to isolate traits and track them over time. They grow relatively quickly, produce
            many offspring, and show visible contrasting traits such as flower color, seed shape,
            and plant height. Those differences made it easier to sort offspring into categories
            and compare the number of plants showing each form of a trait.
          </p>
          <p className="section-text wide-text text-block-spacing">
            Pea plants also made controlled breeding possible. Mendel could prevent accidental
            pollination and decide which parent plants crossed with one another. That control was
            essential because genetics depends on knowing where each allele came from. If the
            parent combinations were unclear, the results would be much harder to interpret.
          </p>
          <p className="section-text wide-text text-block-spacing">
            Most importantly, pea plants gave Mendel repeatable patterns. Because he could work
            with large numbers, he was able to notice ratios that would have been easy to miss in
            smaller samples. This is one reason pea plants became such a powerful model organism in
            early genetics: they made invisible inheritance patterns visible through counting.
          </p>
        </article>

        <article className="panel panel-wide">
          <div className="section-heading">
            <p className="section-kicker">Applications</p>
            <h2>Why genetics matters now</h2>
          </div>
          <p className="section-text wide-text">
            Genetics matters now because it affects medicine, agriculture, biotechnology, and the
            way scientists understand human development and disease. Doctors use genetic knowledge
            to study inherited disorders, estimate family risk, and develop more targeted medical
            treatments. Researchers can identify gene variants associated with certain conditions,
            which helps explain why some diseases run in families and why people can respond
            differently to the same treatment.
          </p>
          <p className="section-text wide-text text-block-spacing">
            In agriculture, genetics is used to breed crops and animals with specific traits such
            as disease resistance, faster growth, better nutrition, or improved yield. In modern
            biotechnology, tools such as genome sequencing and gene editing have made it possible
            to study genes with much greater precision than in the past. CRISPR is one example of
            a newer technology that allows scientists to edit specific DNA sequences, which has
            opened major discussions about medical treatment, ethics, and the future of genetic
            engineering.
          </p>
          <p className="section-text wide-text text-block-spacing">
            Genetics is also connected to some of the most debated scientific frontiers today.
            Topics such as cloning, embryo screening, gene therapy, and personalized medicine show
            how powerful genetic science has become. Human cloning, for example, is often discussed
            because it raises major ethical and scientific questions, even though it is not a
            standard medical practice. At the same time, gene therapy has already begun treating
            certain disorders by addressing the underlying genetic cause. These advances show that
            genetics is no longer just about predicting pea plant traits; it is now a central part
            of how society thinks about health, identity, technology, and the future of biology.
          </p>
        </article>
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

function LabPage() {
  const [activeTrait, setActiveTrait] = useState<TraitKey>('widowsPeak')
  const [parents, setParents] = useState<ParentState>(defaultParents)
  const [childProfile, setChildProfile] = useState<ChildProfile>(() => buildChildProfile(defaultParents))
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const currentTrait = traitDefinitions.find((trait) => trait.key === activeTrait) ?? traitDefinitions[0]
  const traitParents = parents[currentTrait.key]
  const activeProbabilities = useMemo(
    () => getTraitProbabilities(currentTrait, traitParents.parentOne, traitParents.parentTwo),
    [currentTrait, traitParents.parentOne, traitParents.parentTwo],
  )

  const score = quizQuestions.reduce((total, question, index) => {
    return total + (answers[index] === question.answer ? 1 : 0)
  }, 0)

  const activeQuestion = quizQuestions[selectedQuestion]
  const selectedAnswer = answers[selectedQuestion]
  const answeredCorrectly = selectedAnswer === activeQuestion.answer
  const hasNextQuestion = selectedQuestion < quizQuestions.length - 1

  const updateParentGenotype = (traitKey: TraitKey, parent: 'parentOne' | 'parentTwo', genotype: string) => {
    setParents((current) => ({
      ...current,
      [traitKey]: {
        ...current[traitKey],
        [parent]: genotype,
      },
    }))
  }

  return (
    <main className="page-shell">
      <SiteNav />

      <section className="panel page-intro-panel">
        <div className="section-heading">
          <p className="section-kicker">Lab & Tests</p>
          <h1 className="page-title">Choose parent traits and generate a child outcome.</h1>
          <p className="section-text wide-text">
            This game uses a simplified dominant-and-recessive model. Pick a trait tab, choose the
            alleles for each parent, then generate a child to see one possible set of inherited traits.
          </p>
        </div>
      </section>

      <section className="lab-page-grid">
        <section className="panel lab-panel">
          <div className="section-heading section-heading-tight">
            <p className="section-kicker">Trait Builder</p>
            <h2>Set each parent's alleles</h2>
          </div>

          <div className="trait-tabs" role="tablist" aria-label="Human trait tabs">
            {traitDefinitions.map((trait) => (
              <button
                key={trait.key}
                type="button"
                className={trait.key === activeTrait ? 'trait-tab active-trait-tab' : 'trait-tab'}
                onClick={() => setActiveTrait(trait.key)}
              >
                {trait.name}
              </button>
            ))}
          </div>

          <div className="trait-playground">
            <div className="trait-visual-grid">
              <article className="trait-option-card">
                <TraitIllustration trait={currentTrait} phenotype={currentTrait.dominantLabel} />
                <strong>{currentTrait.dominantLabel}</strong>
                <span>Dominant allele: {currentTrait.dominantAllele}</span>
              </article>

              <article className="trait-option-card">
                <TraitIllustration trait={currentTrait} phenotype={currentTrait.recessiveLabel} />
                <strong>{currentTrait.recessiveLabel}</strong>
                <span>Recessive allele: {currentTrait.recessiveAllele}</span>
              </article>
            </div>

            <div className="trait-controls-grid">
              <div className="trait-info-card">
                <h3>{currentTrait.name}</h3>
                <p>{currentTrait.description}</p>
              </div>

              <div className="parent-selector-card">
                <h3>Parent 1</h3>
                <div className="genotype-button-row">
                  {[`${currentTrait.dominantAllele}${currentTrait.dominantAllele}`, `${currentTrait.dominantAllele}${currentTrait.recessiveAllele}`, `${currentTrait.recessiveAllele}${currentTrait.recessiveAllele}`].map((genotype) => (
                    <button
                      key={`parent1-${genotype}`}
                      type="button"
                      className={traitParents.parentOne === genotype ? 'genotype-button active-genotype-button' : 'genotype-button'}
                      onClick={() => updateParentGenotype(currentTrait.key, 'parentOne', genotype)}
                    >
                      {genotype}
                    </button>
                  ))}
                </div>
              </div>

              <div className="parent-selector-card">
                <h3>Parent 2</h3>
                <div className="genotype-button-row">
                  {[`${currentTrait.dominantAllele}${currentTrait.dominantAllele}`, `${currentTrait.dominantAllele}${currentTrait.recessiveAllele}`, `${currentTrait.recessiveAllele}${currentTrait.recessiveAllele}`].map((genotype) => (
                    <button
                      key={`parent2-${genotype}`}
                      type="button"
                      className={traitParents.parentTwo === genotype ? 'genotype-button active-genotype-button' : 'genotype-button'}
                      onClick={() => updateParentGenotype(currentTrait.key, 'parentTwo', genotype)}
                    >
                      {genotype}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="probability-panel-grid">
            <article className="result-panel">
              <h3>Genotype probabilities</h3>
              <div className="result-list">
                {activeProbabilities.genotypeCounts.map(([genotype, count]) => (
                  <div key={genotype} className="result-row">
                    <strong>{genotype}</strong>
                    <span>{count}/4</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="result-panel">
              <h3>Phenotype probabilities</h3>
              <div className="result-list">
                {activeProbabilities.phenotypeCounts.map(([phenotype, count]) => (
                  <div key={phenotype} className="result-row">
                    <strong>{phenotype}</strong>
                    <span>{Math.round((count / 4) * 100)}%</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="result-panel action-panel">
              <h3>Generate child</h3>
              <p>
                After setting the parent alleles across the tabs, generate one possible child using
                the selected probabilities.
              </p>
              <button type="button" className="primary-button" onClick={() => setChildProfile(buildChildProfile(parents))}>
                Create Child
              </button>
            </article>
          </div>
        </section>

        <section className="panel child-panel">
          <div className="section-heading section-heading-tight">
            <p className="section-kicker">Child Preview</p>
            <h2>One possible inherited outcome</h2>
          </div>

          <div className="child-preview-layout">
            <ChildAvatar profile={childProfile} />

            <div className="child-summary-grid">
              {traitDefinitions.map((trait) => {
                const probabilities = getTraitProbabilities(
                  trait,
                  parents[trait.key].parentOne,
                  parents[trait.key].parentTwo,
                )
                const phenotypeEntry = probabilities.phenotypeCounts.find(
                  ([phenotype]) => phenotype === childProfile[trait.key].phenotype,
                )
                const chance = phenotypeEntry ? Math.round((phenotypeEntry[1] / 4) * 100) : 0

                return (
                  <div key={trait.key} className="child-trait-card">
                    <strong>{trait.name}</strong>
                    <span>{childProfile[trait.key].phenotype}</span>
                    <small>
                      {childProfile[trait.key].genotype} · {chance}% chance
                    </small>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="panel quiz-panel">
          <div className="section-heading section-heading-tight">
            <p className="section-kicker">Check Your Understanding</p>
            <h2>Review the genetics ideas</h2>
          </div>

          <div className="quiz-layout">
            <div className="quiz-summary-bar">
              <div className="quiz-progress-pill">Question {selectedQuestion + 1} of {quizQuestions.length}</div>
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

                {answeredCorrectly ? (
                  <div className="quiz-action-row">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => setSelectedQuestion((current) => (hasNextQuestion ? current + 1 : current))}
                    >
                      {hasNextQuestion ? 'Next question' : 'Quiz complete'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<InfoPage />} />
      <Route path="/lab" element={<LabPage />} />
    </Routes>
  )
}

export default App
