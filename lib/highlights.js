import { createClient } from './supabase/client'

// ── Highlights CRUD ──────────────────────────────────────────────────────────

export async function getHighlights() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('highlights')
    .select('*, highlight_photos(*)')
    .order('week_date', { ascending: false })
  if (error) throw error
  return data
}

export async function getHighlightsByCategory(slug) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('highlights')
    .select('*, highlight_photos(*)')
    .eq('category', slug)
    .order('week_date', { ascending: false })
  if (error) throw error
  return data
}

export async function getHighlight(id) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('highlights')
    .select('*, highlight_photos(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createHighlight({ title, category, secondary_category, description, week_date }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('highlights')
    .insert({ title, category, secondary_category: secondary_category || null, description: description || null, week_date })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateHighlight(id, { title, category, secondary_category, description, week_date }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('highlights')
    .update({ title, category, secondary_category: secondary_category || null, description: description || null, week_date })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteHighlight(id) {
  const supabase = createClient()
  const { error } = await supabase.from('highlights').delete().eq('id', id)
  if (error) throw error
}

// ── Photo helpers ────────────────────────────────────────────────────────────

const BUCKET = 'highlights'

export async function uploadPhoto(highlightId, file) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${highlightId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file)
  if (uploadError) throw uploadError

  const { error: dbError } = await supabase
    .from('highlight_photos')
    .insert({ highlight_id: highlightId, storage_path: path })
  if (dbError) throw dbError

  return path
}

export async function deletePhoto(photoId, storagePath) {
  const supabase = createClient()
  await supabase.storage.from(BUCKET).remove([storagePath])
  const { error } = await supabase
    .from('highlight_photos')
    .delete()
    .eq('id', photoId)
  if (error) throw error
}

export function getPhotoUrl(storagePath) {
  const supabase = createClient()
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}
