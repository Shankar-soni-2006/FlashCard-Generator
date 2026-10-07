import { api } from './api'
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const deckService = {
  list: () => api.get('/decks'),
  get: (id) => api.get(`/decks/${id}`),
  create: (data) => api.post('/decks', data),
  update: (id, data) => api.put(`/decks/${id}`, data),
  delete: (id) => api.delete(`/decks/${id}`),
  share: (id) => api.post(`/decks/${id}/share`),
  getShared: (token) => fetch(`${API_URL}/api/shared/${token}`).then(r => r.json()).then(d => { if (!d.success) throw new Error(d.message); return d.data }),
}

export const cardService = {
  list: (deckId) => api.get(`/decks/${deckId}/cards`),
  create: (deckId, data) => api.post(`/decks/${deckId}/cards`, data),
  update: (cardId, data) => api.put(`/cards/${cardId}`, data),
  delete: (cardId) => api.delete(`/cards/${cardId}`),
}

export const reviewService = {
  getDue: () => api.get('/reviews/due'),
  submitRating: (cardId, rating) => api.post(`/reviews/${cardId}`, { rating }),
  getHistory: () => api.get('/reviews/history'),
}

export const aiService = {
  generateTopic: (data) => api.post('/ai/generate-topic', data),
  generateNotes: (data) => api.post('/ai/generate-notes', data),
  generateProgramming: (data) => api.post('/ai/generate-programming', data),
  generateVocabulary: (data) => api.post('/ai/generate-vocabulary', data),
  generateImage: (formData) => api.postForm('/ai/generate-image', formData),
}

export const groupService = {
  list: () => api.get('/groups'),
  create: (data) => api.post('/groups', data),
  get: (id) => api.get(`/groups/${id}`),
  delete: (id) => api.delete(`/groups/${id}`),
  regenerateInvite: (id) => api.post(`/groups/${id}/invite/regenerate`),
  previewInvite: (token) => api.get(`/groups/invite/${token}`),
  join: (token) => api.post(`/groups/join/${token}`),
  removeMember: (id, userId) => api.delete(`/groups/${id}/members/${userId}`),
  addDeck: (id, deckId) => api.post(`/groups/${id}/decks`, { deck_id: deckId }),
  removeDeck: (id, deckId) => api.delete(`/groups/${id}/decks/${deckId}`),
  getDeck: (id, deckId) => api.get(`/groups/${id}/decks/${deckId}`),
  copyDeck: (id, deckId) => api.post(`/groups/${id}/decks/${deckId}/copy`),
  leaderboard: (id, period) => api.get(`/groups/${id}/leaderboard?period=${period}`),
}

export const statisticsService = {
  get: () => api.get('/statistics'),
}
