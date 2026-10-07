import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { aiService, deckService, cardService } from '../services'
import { Button } from '../components/common/Button'
import { Input, Textarea, Select } from '../components/common/Input'
import { SegmentedControl } from '../components/common/SegmentedControl'
import { Badge } from '../components/common/Badge'
import { useToast } from '../components/common/Toast'
import { Pencil, Trash2, RefreshCw, Upload, Code } from 'lucide-react'

const MODES = [
  { value: 'topic', label: 'Topic' },
  { value: 'notes', label: 'Notes' },
  { value: 'programming', label: 'Programming' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'image', label: 'Image' },
]

const CARD_COUNTS = [5, 10, 15, 20, 30]
const LANGUAGES = ['Java', 'JavaScript', 'Python', 'C', 'C++', 'Data Structures', 'Algorithms', 'OOP', 'DBMS', 'OS', 'Networks']

function difficultyVariant(d) {
  if (d === 'easy') return 'success'
  if (d === 'hard') return 'danger'
  if (d === 'medium') return 'warning'
  return 'default'
}

function CardPreview({ card, index, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(card)

  const save = () => { onEdit(index, local); setEditing(false) }

  if (editing) {
    return (
      <div className="border border-[var(--color-accent)] rounded-lg p-4 flex flex-col gap-3">
        <Input label="Question" value={local.question} onChange={e => setLocal(l => ({ ...l, question: e.target.value }))} />
        <Textarea label="Answer" rows={3} value={local.answer} onChange={e => setLocal(l => ({ ...l, answer: e.target.value }))} />
        <Textarea label="Explanation" rows={2} value={local.explanation || ''} onChange={e => setLocal(l => ({ ...l, explanation: e.target.value }))} />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          <Button size="sm" onClick={save}>Save</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-[var(--color-border)] rounded-lg p-4 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Question</p>
          <p className="text-sm text-[var(--color-text-primary)]">{card.question}</p>
          <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Answer</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{card.answer}</p>
          </div>
          {card.code_example && (
            <pre className="mt-3 p-3 rounded bg-[var(--color-border-subtle)] text-xs font-mono overflow-x-auto">
              {card.code_example}
            </pre>
          )}
          {card.word && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="accent">{card.part_of_speech}</Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Badge variant={difficultyVariant(card.difficulty)}>{card.difficulty}</Badge>
          <button onClick={() => setEditing(true)} className="p-1.5 rounded hover:bg-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(index)} className="p-1.5 rounded hover:bg-[var(--color-danger-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Generate() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') || 'topic')
  const [form, setForm] = useState({ topic: '', notes: '', language: 'Java', word: '', count: 10, difficulty: 'auto' })
  const [imageFile, setImageFile] = useState(null)
  const [imageDrag, setImageDrag] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [cards, setCards] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deckName, setDeckName] = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()
  const toast = useToast()

  const generate = async () => {
    if (mode === 'image' && !imageFile) return toast({ message: 'Please choose an image first.', type: 'error' })
    if (mode === 'image' && imageFile.size > 4 * 1024 * 1024) return toast({ message: 'Image must be 4MB or smaller.', type: 'error' })
    setGenerating(true)
    setCards(null)
    try {
      let result
      if (mode === 'topic') result = await aiService.generateTopic({ topic: form.topic, count: form.count, difficulty: form.difficulty })
      else if (mode === 'notes') result = await aiService.generateNotes({ notes: form.notes, count: form.count })
      else if (mode === 'programming') result = await aiService.generateProgramming({ language: form.language, topic: form.topic, count: form.count })
      else if (mode === 'vocabulary') result = await aiService.generateVocabulary({ word: form.word, count: form.count })
      else if (mode === 'image') {
        const fd = new FormData()
        fd.append('image', imageFile)
        fd.append('count', form.count)
        result = await aiService.generateImage(fd)
      }
      setCards(result?.cards || [])
      setDeckName(mode === 'image' ? (imageFile?.name.replace(/\.[^.]+$/, '') || 'Image deck') : (form.topic || form.word || form.language || 'New Deck'))
    } catch (e) {
      toast({ message: e.message || 'Unable to generate flashcards. Please try again.', type: 'error' })
    } finally {
      setGenerating(false)
    }
  }

  const saveCards = async () => {
    if (!deckName.trim()) return toast({ message: 'Please enter a deck name.', type: 'error' })
    setSaving(true)
    try {
      const deck = await deckService.create({ title: deckName, deck_type: mode, description: '' })
      await Promise.all(cards.map(c => cardService.create(deck.id, { ...c, source_type: mode })))
      toast({ message: 'Deck saved successfully.', type: 'success' })
      navigate(`/decks/${deck.id}`)
    } catch (e) {
      toast({ message: 'Unable to save your deck. Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setImageDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) setImageFile(file)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">Create flashcards</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Turn knowledge into a reviewable deck.</p>
      </div>

      <div className="flex flex-col gap-6">
        <SegmentedControl options={MODES} value={mode} onChange={v => { setMode(v); setCards(null) }} />

        {/* Topic / Programming topic input */}
        {(mode === 'topic' || mode === 'programming') && (
          <Input
            label={mode === 'programming' ? 'Topic or concept' : 'What do you want to learn?'}
            placeholder={mode === 'programming' ? 'e.g. Method overloading' : 'e.g. Database Normalization'}
            value={form.topic}
            onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
          />
        )}

        {/* Programming language */}
        {mode === 'programming' && (
          <Select label="Language / Subject" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </Select>
        )}

        {/* Notes */}
        {mode === 'notes' && (
          <Textarea
            label="Paste your notes"
            placeholder="Paste lecture notes, textbook excerpts, or study material..."
            rows={8}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        )}

        {/* Vocabulary */}
        {mode === 'vocabulary' && (
          <Input
            label="Word or topic"
            placeholder="e.g. Ephemeral, or GRE vocabulary"
            value={form.word}
            onChange={e => setForm(f => ({ ...f, word: e.target.value }))}
          />
        )}

        {/* Image */}
        {mode === 'image' && (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setImageDrag(true) }}
            onDragLeave={() => setImageDrag(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${imageDrag ? 'border-[var(--color-text-primary)]' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={e => e.target.files[0] && setImageFile(e.target.files[0])}
            />
            <Upload size={20} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {imageFile ? imageFile.name : 'Drop an image or click to upload'}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">PNG, JPG or WEBP, up to 4MB. Notes, slides, diagrams or textbook pages.</p>
          </div>
        )}

        {/* Count + Difficulty */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Number of cards</label>
            <div className="flex gap-1.5">
              {CARD_COUNTS.map(n => (
                <button
                  key={n}
                  onClick={() => setForm(f => ({ ...f, count: n }))}
                  className={`w-10 h-9 rounded border text-sm transition-colors ${form.count === n ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-bg)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {mode !== 'vocabulary' && (
            <Select label="Difficulty" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="w-32">
              <option value="auto">Auto</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          )}
        </div>

        <div className="flex justify-end">
          <Button size="lg" onClick={generate} loading={generating} disabled={mode === 'image' && !imageFile}>
            {generating ? 'Generating...' : 'Generate →'}
          </Button>
        </div>
      </div>

      {/* Preview */}
      {cards !== null && (
        <div className="flex flex-col gap-5 pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{cards.length} cards generated</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Review before saving</p>
            </div>
            <Button variant="ghost" size="sm" onClick={generate} loading={generating}>
              <RefreshCw size={13} /> Regenerate
            </Button>
          </div>

          <Input
            label="Deck name"
            placeholder="Name your deck"
            value={deckName}
            onChange={e => setDeckName(e.target.value)}
          />

          <div className="flex flex-col gap-3">
            {cards.map((card, i) => (
              <CardPreview
                key={i}
                card={card}
                index={i}
                onEdit={(idx, updated) => setCards(c => c.map((x, j) => j === idx ? updated : x))}
                onDelete={(idx) => setCards(c => c.filter((_, j) => j !== idx))}
              />
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button size="lg" onClick={saveCards} loading={saving}>
              Save deck →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
