import { createClient } from './supabase/client'

export async function getCategories() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return data
}

export async function createCategory({ label, emoji = '⭐' }) {
  const supabase = createClient()
  const value = label
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('categories')
    .insert({ value, label, emoji, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCategory(id, { label, emoji }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .update({ label, emoji })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  const supabase = createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
