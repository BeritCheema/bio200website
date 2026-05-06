const MODEL = 'bytedance-seed/seedream-4.5'

// ── Trait inheritance logic ──────────────────────────────────────────

const pick = (array) => array[Math.floor(Math.random() * array.length)]
const coin = () => Math.random() < 0.5

// Ordered scales for polygenic / dominance-hierarchy traits (index 0 = most dominant or darkest)
const skinToneScale = ['Black', 'Dark brown', 'Brown', 'Medium tan', 'Light olive', 'Fair', 'Very fair']
const hairColorScale = ['Black', 'Dark brown', 'Chestnut brown', 'Auburn', 'Blonde', 'Red']
const hairTextureScale = ['Coily', 'Tight curls', 'Loose curls', 'Wavy', 'Straight']
const eyeColorScale = ['Brown', 'Hazel', 'Amber', 'Green', 'Blue', 'Gray']
const buildScale = ['Broad', 'Athletic', 'Average', 'Slim', 'Petite']

// Blend two values on an ordered scale: pick a point between the two parents, biased toward
// the dominant (lower-index) end, with a small random offset so siblings could differ.
const blendOnScale = (scale, valueA, valueB) => {
  const idxA = Math.max(scale.indexOf(valueA), 0)
  const idxB = Math.max(scale.indexOf(valueB), 0)
  const midpoint = (idxA + idxB) / 2
  // jitter ±1 step so results aren't always the exact midpoint
  const jitter = Math.floor(Math.random() * 3) - 1
  const idx = Math.min(Math.max(Math.round(midpoint + jitter), 0), scale.length - 1)
  return scale[idx]
}

// Dominant-style inheritance: the "stronger" value (lower index) wins ~70% of the time,
// otherwise take the other parent's value.
const dominantPick = (scale, valueA, valueB) => {
  const idxA = Math.max(scale.indexOf(valueA), 0)
  const idxB = Math.max(scale.indexOf(valueB), 0)
  if (idxA === idxB) return scale[idxA]
  const dominant = idxA < idxB ? valueA : valueB
  const recessive = idxA < idxB ? valueB : valueA
  return Math.random() < 0.7 ? dominant : recessive
}

// Freckles: "Many freckles" is semi-dominant
const frecklesScale = ['Many freckles', 'Light freckles', 'None']

const inheritFreckles = (a, b) => {
  if (a === b) return a
  if (a === 'Many freckles' || b === 'Many freckles') {
    return Math.random() < 0.6 ? 'Light freckles' : 'Many freckles'
  }
  // one has Light, other has None
  return Math.random() < 0.5 ? 'Light freckles' : 'None'
}

// Dimples: dominant trait
const inheritDimples = (a, b) => {
  if (a === 'Two dimples' || b === 'Two dimples') {
    return Math.random() < 0.75 ? pick(['One dimple', 'Two dimples']) : 'No dimples'
  }
  if (a === 'One dimple' || b === 'One dimple') {
    return Math.random() < 0.6 ? 'One dimple' : 'No dimples'
  }
  return 'No dimples'
}

// Face shape & nose shape: randomly pick one parent's value, or occasionally a common "blend"
const inheritFromEither = (a, b) => {
  if (a === b) return a
  return coin() ? a : b
}

const resolveChildTraits = (humanOne, humanTwo) => {
  const val = (traits, key) => (typeof traits?.[key] === 'string' ? traits[key] : '')

  return {
    skinTone: blendOnScale(skinToneScale, val(humanOne, 'skinTone'), val(humanTwo, 'skinTone')),
    hairColor: dominantPick(hairColorScale, val(humanOne, 'hairColor'), val(humanTwo, 'hairColor')),
    hairTexture: dominantPick(hairTextureScale, val(humanOne, 'hairTexture'), val(humanTwo, 'hairTexture')),
    eyeColor: dominantPick(eyeColorScale, val(humanOne, 'eyeColor'), val(humanTwo, 'eyeColor')),
    freckles: inheritFreckles(val(humanOne, 'freckles'), val(humanTwo, 'freckles')),
    dimples: inheritDimples(val(humanOne, 'dimples'), val(humanTwo, 'dimples')),
    faceShape: inheritFromEither(val(humanOne, 'faceShape'), val(humanTwo, 'faceShape')),
    noseShape: inheritFromEither(val(humanOne, 'noseShape'), val(humanTwo, 'noseShape')),
    build: blendOnScale(buildScale, val(humanOne, 'build'), val(humanTwo, 'build')),
  }
}

// ── Prompt construction ──────────────────────────────────────────────

const buildChildPrompt = (child) => {
  const gender = 'girl'
  return [
    `Create a single square, photorealistic portrait of a fictional ${gender}, about 7 to 10 years old.`,
    `Frame the shot from the waist up, not a close-up of the face. The ${gender} should look like a real person photographed in a studio with soft natural daylight and a clean neutral background.`,
    `The ${gender} is smiling gently and wearing simple, age-appropriate casual clothing.`,
    '',
    'Use exactly these physical features:',
    `- Skin tone: ${child.skinTone}`,
    `- Hair color: ${child.hairColor}`,
    `- Hair texture: ${child.hairTexture}`,
    `- Eye color: ${child.eyeColor}`,
    `- Freckles: ${child.freckles}`,
    `- Dimples: ${child.dimples}`,
    `- Face shape: ${child.faceShape}`,
    `- Nose shape: ${child.noseShape}`,
    `- Build: ${child.build}`,
    '',
    'Do not generate a real celebrity or existing person. Keep the image safe, friendly, and age-appropriate.',
  ].join('\n')
}

// ── Helpers ──────────────────────────────────────────────────────────

const parseBody = (request) => {
  if (!request.body) return {}
  if (typeof request.body === 'string') {
    if (!request.body.trim()) return {}
    return JSON.parse(request.body)
  }
  return request.body
}

const readJsonResponse = async (upstreamResponse) => {
  const text = await upstreamResponse.text()
  if (!text.trim()) return { data: null, error: 'OpenRouter returned an empty response.' }
  try {
    return { data: JSON.parse(text), error: '' }
  } catch {
    return { data: null, error: text.slice(0, 500) }
  }
}

const findImageUrl = (value) => {
  if (!value) return ''
  if (typeof value === 'string') {
    return value.startsWith('data:image/') || /^https?:\/\//.test(value) ? value : ''
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findImageUrl(item)
      if (match) return match
    }
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) {
      const match = findImageUrl(item)
      if (match) return match
    }
  }
  return ''
}

// ── Handler ──────────────────────────────────────────────────────────

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Use POST to generate an image.' })
    return
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    response.status(500).json({ error: 'Missing OPENROUTER_API_KEY on the server.' })
    return
  }

  try {
    const { mom, dad } = parseBody(request)
    const childTraits = resolveChildTraits(mom, dad)
    const prompt = buildChildPrompt(childTraits)

    const modelResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': request.headers.origin || 'http://localhost:5173',
        'X-Title': 'BIO200 Child Image Trait Game',
      },
      body: JSON.stringify({
        model: MODEL,
        modalities: ['image'],
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const { data, error: parseError } = await readJsonResponse(modelResponse)

    if (!modelResponse.ok) {
      response.status(modelResponse.status).json({
        error: data?.error?.message || data?.message || parseError || 'The image generation request failed.',
      })
      return
    }

    if (!data) {
      response.status(502).json({ error: parseError || 'The image model returned an unreadable response.' })
      return
    }

    const message = data?.choices?.[0]?.message
    const imageUrl = findImageUrl(message)

    if (!imageUrl) {
      response.status(502).json({ error: 'The image model responded without an image.' })
      return
    }

    response.status(200).json({
      imageUrl,
      childTraits,
      prompt,
    })
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to generate the image.',
    })
  }
}
