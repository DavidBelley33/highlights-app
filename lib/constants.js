export const CATEGORIES = [
  { value: 'famille', label: 'Famille', emoji: '👨‍👩‍👧‍👦' },
  { value: 'soiree-gars', label: 'Soirée de gars', emoji: '🍺' },
  { value: 'soiree-filles', label: 'Soirée de filles', emoji: '🥂' },
  { value: 'nouvelle-aventure', label: 'Nouvelle aventure', emoji: '🧭' },
  { value: 'voyage', label: 'Voyage', emoji: '✈️' },
  { value: 'concert-dj', label: 'Concert / DJ set', emoji: '🎵' },
  { value: 'evenement-pro', label: 'Événement professionnel', emoji: '💼' },
  { value: 'rencontre', label: 'Rencontre', emoji: '🤝' },
  { value: 'temps-seul', label: 'Temps seul / nature / sport', emoji: '🌿' },
  { value: 'autre', label: 'Autre', emoji: '⭐' },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c])
)

// Returns the Monday of the week for a given date
export function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatDate(dateStr) {
  // dateStr is YYYY-MM-DD — parse as local date to avoid timezone shift
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
