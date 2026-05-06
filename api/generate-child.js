const MODEL = 'openai/gpt-5.4-image-2'

const traitLabels = {
  skinTone: 'Skin tone',
  hairColor: 'Hair color',
  hairTexture: 'Hair texture',
  eyeColor: 'Eye color',
  freckles: 'Freckles',
  dimples: 'Dimples',
  faceShape: 'Face shape',
  noseShape: 'Nose shape',
  build: 'Build',
  style: 'Adult style',
}

const parseBody = (request) => {
  if (!request.body) {
    return {}
  }

  if (typeof request.body === 'string') {
    return JSON.parse(request.body)
  }

  return request.body
}

const describeAdult = (name, traits = {}) => {
  const lines = Object.entries(traitLabels).map(([key, label]) => {
    const value = typeof traits[key] === 'string' ? traits[key] : 'not specified'
    return `- ${label}: ${value.slice(0, 80)}`
  })

  return `${name}\n${lines.join('\n')}`
}

const findImageUrl = (value) => {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value.startsWith('data:image/') || /^https?:\/\//.test(value) ? value : ''
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findImageUrl(item)
      if (match) {
        return match
      }
    }
  }

  if (typeof value === 'object') {
    for (const item of Object.values(value)) {
      const match = findImageUrl(item)
      if (match) {
        return match
      }
    }
  }

  return ''
}

const findText = (content) => {
  if (typeof content === 'string') {
    return content
  }

  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part
      }

      if (part && typeof part === 'object' && typeof part.text === 'string') {
        return part.text
      }

      return ''
    })
    .filter(Boolean)
    .join(' ')
}

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
    const { humanOne, humanTwo } = parseBody(request)

    const prompt = `Create one square, realistic but warm portrait of a fictional child, about 7 to 10 years old, based loosely on the visible traits from two fictional adults. Do not create a real person, celebrity, medical prediction, or sexualized image. Keep the child fully clothed, friendly, natural, and age-appropriate. Use a clean studio background, soft daylight, and detailed facial features. Blend the adult traits naturally rather than copying either adult exactly.\n\n${describeAdult('Human One', humanOne)}\n\n${describeAdult('Human Two', humanTwo)}`

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
        modalities: ['image', 'text'],
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    const data = await modelResponse.json()

    if (!modelResponse.ok) {
      response.status(modelResponse.status).json({
        error: data?.error?.message || data?.message || 'The image generation request failed.',
      })
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
      caption: findText(message?.content) || 'Generated from the selected Human One and Human Two traits.',
    })
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to generate the image.',
    })
  }
}
