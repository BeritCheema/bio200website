import { useMemo, useState } from 'react'
import './App.css'

type TraitOption = {
  label: string
  genotype: string
  phenotype: string
  note: string
}

type TraitConfig = {
  name: string
  dominantLabel: string
  recessiveLabel: string
  description: string
  options: TraitOption[]
}

const definitions = [
  {
    term: 'Gene',
    meaning: 'A segment of DNA that helps determine a trait or body function.',
  },
  {
    term: 'Allele',
    meaning: 'A version of a gene, such as a dominant or recessive form.',
  },
  {
    term: 'Genotype',
    meaning: 'The allele combination an organism carries, like Bb or bb.',
  },
  {
    term: 'Phenotype',
    meaning: 'The visible outcome of those genes, such as purple flowers.',
  },
]

const familyTraits = [
  {
    title: 'Freckles',
    dominant: 'Freckles often appear with at least one dominant allele.',
    recessive: 'No freckles may appear when recessive alleles pair together.',
  },
  {
    title: 'Ear Lobes',
    dominant: 'Free ear lobes are often used as a dominant classroom example.',
    recessive: 'Attached ear lobes are often used as a recessive example.',
  },
  {
    title: 'Hairline',
    dominant: 'Widow\'s peak is often shown as the dominant version in intro lessons.',
    recessive: 'A straight hairline is often shown as the recessive version.',
  },
]

const traitConfig: TraitConfig = {
  name: 'Flower Color',
  dominantLabel: 'Purple petals',
  recessiveLabel: 'White petals',
  description:
    'This model uses one gene with two alleles: B for purple petals and b for white petals.',
  options: [
    {
      label: 'BB',
      genotype: 'BB',
      phenotype: 'Purple petals',
      note: 'Homozygous dominant',
    },
    {
      label: 'Bb',
      genotype: 'Bb',
      phenotype: 'Purple petals',
      note: 'Heterozygous',
    },
    {
      label: 'bb',
      genotype: 'bb',
      phenotype: 'White petals',
      note: 'Homozygous recessive',
    },
  ],
}

const getGametes = (genotype: string) => genotype.split('')

const normalizeGenotype = (first: string, second: string) => {
  const pair = [first, second].sort((a, b) => {
    const firstIsUpper = a === a.toUpperCase()
    const secondIsUpper = b === b.toUpperCase()

    if (firstIsUpper === secondIsUpper) {
      return a.localeCompare(b)
    }

    return firstIsUpper ? -1 : 1
  })

  return pair.join('')
}

const genotypeToPhenotype = (genotype: string) =>
  genotype.includes('B') ? traitConfig.dominantLabel : traitConfig.recessiveLabel

function App() {
  const [parentOne, setParentOne] = useState('Bb')
  const [parentTwo, setParentTwo] = useState('Bb')

  const punnettData = useMemo(() => {
    const firstGametes = getGametes(parentOne)
    const secondGametes = getGametes(parentTwo)
    const square = secondGametes.map((rowAllele) =>
      firstGametes.map((columnAllele) => {
        const genotype = normalizeGenotype(columnAllele, rowAllele)

        return {
          genotype,
          phenotype: genotypeToPhenotype(genotype),
        }
      }),
    )

    const genotypeCounts = square
      .flat()
      .reduce<Record<string, number>>((counts, cell) => {
        counts[cell.genotype] = (counts[cell.genotype] ?? 0) + 1
        return counts
      }, {})

    const phenotypeCounts = square
      .flat()
      .reduce<Record<string, number>>((counts, cell) => {
        counts[cell.phenotype] = (counts[cell.phenotype] ?? 0) + 1
        return counts
      }, {})

    return {
      firstGametes,
      secondGametes,
      square,
      genotypeCounts: Object.entries(genotypeCounts),
      phenotypeCounts: Object.entries(phenotypeCounts),
    }
  }, [parentOne, parentTwo])

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">BIO 200</p>
          <h1>Genetics, visualized in one scroll.</h1>
          <p className="hero-text">
            Explore how genes, alleles, and inheritance patterns shape traits through
            classroom-ready definitions, bold diagrams, and a simple prediction tool.
          </p>
          <div className="hero-stats">
            <div>
              <strong>4</strong>
              <span>core genetics terms</span>
            </div>
            <div>
              <strong>2x2</strong>
              <span>Punnett square model</span>
            </div>
            <div>
              <strong>1</strong>
              <span>interactive flower trait lab</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-card dna-card">
            <span>DNA</span>
            <div className="dna-strand">
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </div>
          </div>
          <div className="visual-card flower-card">
            <span>Trait Model</span>
            <div className="flower-grid">
              <b className="petal purple"></b>
              <b className="petal cream"></b>
              <b className="petal purple"></b>
              <b className="petal cream"></b>
            </div>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel panel-wide">
          <div className="section-heading">
            <p className="section-kicker">Foundations</p>
            <h2>What genetics studies</h2>
          </div>
          <p className="section-text">
            Genetics is the branch of biology that studies heredity, variation, and
            how traits move from one generation to the next. DNA carries instructions,
            genes store specific information, and allele combinations affect how a
            trait appears.
          </p>
          <div className="definition-grid">
            {definitions.map((item) => (
              <div key={item.term} className="definition-card">
                <h3>{item.term}</h3>
                <p>{item.meaning}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="section-kicker">Big Idea</p>
            <h2>Dominant vs recessive</h2>
          </div>
          <p className="section-text">
            In many beginner genetics models, a dominant allele can mask a recessive
            allele in a heterozygous pair. Real inheritance can be more complex, but
            this model is useful for learning the basics.
          </p>
          <div className="contrast-pill-row">
            <div className="contrast-pill dominant-pill">Dominant allele shows with one copy</div>
            <div className="contrast-pill recessive-pill">Recessive allele shows with two copies</div>
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="section-kicker">Examples</p>
            <h2>Common family trait examples</h2>
          </div>
          <div className="trait-stack">
            {familyTraits.map((trait) => (
              <div key={trait.title} className="trait-card">
                <h3>{trait.title}</h3>
                <p>{trait.dominant}</p>
                <p>{trait.recessive}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel panel-wide">
          <div className="section-heading">
            <p className="section-kicker">Visual Model</p>
            <h2>Punnett square walkthrough</h2>
          </div>
          <div className="punnett-layout">
            <div>
              <p className="section-text">
                A Punnett square maps the possible allele pairs that offspring can
                inherit. Each parent contributes one allele, creating probability-based
                outcomes instead of one guaranteed result.
              </p>
              <div className="legend-box">
                <div>
                  <span className="legend-swatch dominant-swatch"></span>
                  <p>`B` = purple petals</p>
                </div>
                <div>
                  <span className="legend-swatch recessive-swatch"></span>
                  <p>`b` = white petals</p>
                </div>
              </div>
            </div>

            <div className="punnett-demo">
              <div className="square-header-row">
                <span></span>
                {punnettData.firstGametes.map((allele, index) => (
                  <span key={`top-${allele}-${index}`} className="allele-chip">
                    {allele}
                  </span>
                ))}
              </div>
              {punnettData.square.map((row, rowIndex) => (
                <div key={`row-${punnettData.secondGametes[rowIndex]}`} className="square-row">
                  <span className="allele-chip side-chip">
                    {punnettData.secondGametes[rowIndex]}
                  </span>
                  {row.map((cell, cellIndex) => (
                    <div key={`${rowIndex}-${cellIndex}-${cell.genotype}`} className="square-cell">
                      <strong>{cell.genotype}</strong>
                      <span>{cell.phenotype}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel panel-wide accent-panel">
          <div className="section-heading">
            <p className="section-kicker">Interactive Lab</p>
            <h2>Predict flower offspring</h2>
          </div>
          <p className="section-text">{traitConfig.description}</p>

          <div className="control-row">
            <label>
              Parent 1 genotype
              <select value={parentOne} onChange={(event) => setParentOne(event.target.value)}>
                {traitConfig.options.map((option) => (
                  <option key={`first-${option.genotype}`} value={option.genotype}>
                    {option.label} - {option.note}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Parent 2 genotype
              <select value={parentTwo} onChange={(event) => setParentTwo(event.target.value)}>
                {traitConfig.options.map((option) => (
                  <option key={`second-${option.genotype}`} value={option.genotype}>
                    {option.label} - {option.note}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="predictor-grid">
            <div className="result-box">
              <h3>Genotype probabilities</h3>
              <div className="result-list">
                {punnettData.genotypeCounts.map(([genotype, count]) => (
                  <div key={genotype} className="result-item">
                    <strong>{genotype}</strong>
                    <span>{count}/4 outcomes</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-box">
              <h3>Phenotype probabilities</h3>
              <div className="result-list">
                {punnettData.phenotypeCounts.map(([phenotype, count]) => (
                  <div key={phenotype} className="result-item">
                    <strong>{phenotype}</strong>
                    <span>{Math.round((count / 4) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-box note-box">
              <h3>What this shows</h3>
              <p>
                Two purple-looking parents can still produce white-flowered offspring
                if both parents carry the recessive allele.
              </p>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="section-kicker">Plant Genetics</p>
            <h2>Why flowers are useful</h2>
          </div>
          <p className="section-text">
            Flower color is often used in genetics lessons because the phenotype is
            easy to spot. It turns invisible DNA instructions into a visible pattern
            students can compare and predict.
          </p>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="section-kicker">Takeaways</p>
            <h2>Key points to remember</h2>
          </div>
          <ul className="takeaway-list">
            <li>Genes are inherited instructions carried in DNA.</li>
            <li>Alleles are different versions of the same gene.</li>
            <li>Punnett squares show probabilities, not guarantees.</li>
            <li>Simple dominant/recessive models help explain core genetics ideas.</li>
          </ul>
        </article>
      </section>
    </main>
  )
}

export default App
