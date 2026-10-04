export async function generateImageCards() {
  throw Object.assign(new Error('Image generation is not supported with the current AI provider. Please use Topic, Notes, Programming, or Vocabulary mode instead.'), { statusCode: 400 })
}
