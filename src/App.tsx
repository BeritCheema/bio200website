import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

type InheritancePattern = {
  id: string
  title: string
  summary: string
  example: string
  whyItMatters: string
}

type ImageTraitKey =
  | 'skinTone'
  | 'hairColor'
  | 'hairTexture'
  | 'eyeColor'
  | 'freckles'
  | 'dimples'
  | 'faceShape'
  | 'noseShape'
  | 'build'

type AdultTraits = Record<ImageTraitKey, string>

type ImageTraitField = {
  key: ImageTraitKey
  label: string
  helper: string
  options: string[]
}

type GenerationResponse = {
  imageUrl?: string
  caption?: string
  error?: string
}

const readGenerationResponse = async (response: Response): Promise<GenerationResponse> => {
  const text = await response.text()

  if (!text.trim()) {
    return {
      error: response.ok
        ? 'The image service returned an empty response.'
        : 'The image service is unavailable or returned an empty error response.',
    }
  }

  try {
    return JSON.parse(text) as GenerationResponse
  } catch {
    return {
      error: text.startsWith('<!doctype html') || text.startsWith('<html')
        ? 'The image API route did not return JSON. If you are developing locally, run the app with vercel dev so /api/generate-child is available.'
        : text.slice(0, 240),
    }
  }
}

const imageTraitFields: ImageTraitField[] = [
  {
    key: 'skinTone',
    label: 'Skin Tone',
    helper: 'Choose the general complexion for this adult.',
    options: ['Very fair', 'Fair', 'Light olive', 'Medium tan', 'Brown', 'Dark brown', 'Black'],
  },
  {
    key: 'hairColor',
    label: 'Hair Color',
    helper: 'Pick a natural-looking hair color.',
    options: ['Black', 'Dark brown', 'Chestnut brown', 'Auburn', 'Blonde', 'Red'],
  },
  {
    key: 'hairTexture',
    label: 'Hair Texture',
    helper: 'Set the hair pattern and volume.',
    options: ['Straight', 'Wavy', 'Loose curls', 'Tight curls', 'Coily'],
  },
  {
    key: 'eyeColor',
    label: 'Eye Color',
    helper: 'Select the adult eye color.',
    options: ['Brown', 'Hazel', 'Amber', 'Green', 'Blue', 'Gray'],
  },
  {
    key: 'freckles',
    label: 'Freckles',
    helper: 'Choose whether freckles should influence the child image.',
    options: ['None', 'Light freckles', 'Many freckles'],
  },
  {
    key: 'dimples',
    label: 'Dimples',
    helper: 'Add a smile detail for the adult.',
    options: ['No dimples', 'One dimple', 'Two dimples'],
  },
  {
    key: 'faceShape',
    label: 'Face Shape',
    helper: 'Describe the adult face structure.',
    options: ['Oval', 'Round', 'Heart-shaped', 'Square', 'Long'],
  },
  {
    key: 'noseShape',
    label: 'Nose Shape',
    helper: 'Choose a broad visual nose description.',
    options: ['Small', 'Straight', 'Button', 'Broad', 'Aquiline'],
  },
  {
    key: 'build',
    label: 'Build',
    helper: 'Give the model a general adult body-frame cue.',
    options: ['Petite', 'Slim', 'Average', 'Athletic', 'Broad'],
  },
]

const defaultHumanOne: AdultTraits = {
  skinTone: 'Medium tan',
  hairColor: 'Dark brown',
  hairTexture: 'Wavy',
  eyeColor: 'Brown',
  freckles: 'Light freckles',
  dimples: 'Two dimples',
  faceShape: 'Oval',
  noseShape: 'Straight',
  build: 'Average',
}

const defaultHumanTwo: AdultTraits = {
  skinTone: 'Fair',
  hairColor: 'Auburn',
  hairTexture: 'Loose curls',
  eyeColor: 'Green',
  freckles: 'Many freckles',
  dimples: 'No dimples',
  faceShape: 'Heart-shaped',
  noseShape: 'Button',
  build: 'Slim',
}


function ImageTraitSelector({
  title,
  subtitle,
  traits,
  variant,
  onChange,
}: {
  title: string
  subtitle: string
  traits: AdultTraits
  variant: 'mom' | 'dad'
  onChange: (key: ImageTraitKey, value: string) => void
}) {
  const titleId = title.replaceAll(' ', '-').toLowerCase() + '-title'

  return (
    <section className="human-card" aria-labelledby={titleId}>
      <div className="human-card-header">
        <div>
          <p className="eyebrow">Trait Selection</p>
          <h2 id={titleId}>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className={`face-token ${variant === 'mom' ? 'face-token-mom' : ''}`} aria-hidden="true">
          <span className="face-hair" />
          <span className="face-eye left-eye" />
          <span className="face-eye right-eye" />
          <span className="face-smile" />
        </div>
      </div>

      <div className="selector-stack">
        {imageTraitFields.map((field) => (
          <label key={field.key} className="image-trait-control">
            <span>
              <strong>{field.label}</strong>
              <small>{field.helper}</small>
            </span>
            <select value={traits[field.key]} onChange={(event) => onChange(field.key, event.target.value)}>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  )
}


function GamePage() {
  const [mom, setHumanOne] = useState<AdultTraits>(defaultHumanOne)
  const [dad, setHumanTwo] = useState<AdultTraits>(defaultHumanTwo)
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const updateHumanOne = (key: ImageTraitKey, value: string) => {
    setHumanOne((current) => ({ ...current, [key]: value }))
  }

  const updateHumanTwo = (key: ImageTraitKey, value: string) => {
    setHumanTwo((current) => ({ ...current, [key]: value }))
  }

  const generateChild = async () => {
    setIsGenerating(true)
    setError('')
    setCaption('')

    try {
      const response = await fetch('/api/generate-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mom, dad }),
      })
      const data = await readGenerationResponse(response)

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || 'The image model did not return a child image.')
      }

      setImageUrl(data.imageUrl)
      setCaption(data.caption || 'Generated from the two adult trait profiles.')
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Something went wrong.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="page-shell image-game-page">
      <SiteNav />

      <section className="game-hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">BIO200 Image Game</p>
          <h1>Build mom and dad. Generate a fictional child.</h1>
          <p className="hero-summary">
            Choose visible traits for mom and dad, then generate a realistic child portrait concept.
          </p>
        </div>

        <div className="game-hero-actions">
          <button className="primary-button" type="button" onClick={generateChild} disabled={isGenerating}>
            {isGenerating ? 'Generating image...' : 'Generate Child Image'}
          </button>
        </div>
      </section>

      <section className="builder-grid" aria-label="Adult trait builders">
        <ImageTraitSelector
          title="Mom"
          subtitle="Set the mom's visible traits."
          traits={mom}
          variant="mom"
          onChange={updateHumanOne}
        />
        <ImageTraitSelector
          title="Dad"
          subtitle="Set the dad's visible traits."
          traits={dad}
          variant="dad"
          onChange={updateHumanTwo}
        />
      </section>

      <section className="game-result-section">
        <div className="image-game-result-panel image-panel">
          <div className="section-heading">
            <p className="section-kicker">Generated Result</p>
            <h2>Child portrait</h2>
          </div>

          <div className={imageUrl ? 'image-stage has-image' : 'image-stage'}>
            {imageUrl ? (
              <img src={imageUrl} alt="AI-generated portrait of a fictional child based on selected adult traits." />
            ) : (
              <div className={isGenerating ? 'empty-state generating' : 'empty-state'}>
                <span>
                  <i className="hair-line" />
                  <i className="hair-line" />
                  <i className="hair-line" />
                </span>
                <strong>No image yet</strong>
                <p>Choose the adult traits, then generate a child image.</p>
              </div>
            )}
          </div>

          {caption ? <p className="caption-text">{caption}</p> : null}
          {error ? <p className="error-box">{error}</p> : null}
        </div>
      </section>
    </main>
  )
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
          <NavLink to="/game" className={({ isActive }) => (isActive ? 'nav-link active-nav-link' : 'nav-link')}>
            Game
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
            separate game page to build two adult trait profiles and generate a fictional child image.
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

        <article className="panel media-card">
          <img src="/images/skin-color-histogram.png" alt="Polygenic inheritance chart showing skin color allele combinations and bell curve distribution." />
          <div className="media-caption">
            <span>Polygenic inheritance</span>
            <p>Multiple gene pairs produce a continuous range of skin tones, shown here with a Punnett grid and histogram.</p>
          </div>
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

        <article className="panel">
          <div className="section-heading">
            <p className="section-kicker">Applications</p>
            <h2>Why genetics matters now</h2>
          </div>
          <p className="section-text">
            Genetics matters now because it affects medicine, agriculture, biotechnology, and the
            way scientists understand human development and disease. Doctors use genetic knowledge
            to study inherited disorders, estimate family risk, and develop more targeted medical
            treatments. Researchers can identify gene variants associated with certain conditions,
            which helps explain why some diseases run in families and why people can respond
            differently to the same treatment.
          </p>
          <p className="section-text text-block-spacing">
            In agriculture, genetics is used to breed crops and animals with specific traits such
            as disease resistance, faster growth, better nutrition, or improved yield. In modern
            biotechnology, tools such as genome sequencing and gene editing have made it possible
            to study genes with much greater precision than in the past. CRISPR is one example of
            a newer technology that allows scientists to edit specific DNA sequences, which has
            opened major discussions about medical treatment, ethics, and the future of genetic
            engineering.
          </p>
          <p className="section-text text-block-spacing">
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

        <article className="panel media-card">
          <img src="/images/lab-research.jpg" alt="Multichannel pipette dispensing samples into a well plate in a molecular diagnostics laboratory." />
          <div className="media-caption">
            <span>Modern genetics lab</span>
            <p>Tools like multichannel pipettes and well plates are used in gene sequencing and molecular diagnostics research.</p>
          </div>
        </article>
      </section>

    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<InfoPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/lab" element={<GamePage />} />
    </Routes>
  )
}

export default App
