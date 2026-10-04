import 'dotenv/config'
import app from './app.js'

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'GROQ_API_KEY']
const missing = REQUIRED_ENV.filter(k => !process.env[k]?.trim())
if (missing.length) {
  console.error(`\n❌ Missing environment variables: ${missing.join(', ')}\n   Check your server/.env file.\n`)
  process.exit(1)
}

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
