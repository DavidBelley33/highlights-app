-- Highlights App — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Highlights table
create table if not exists highlights (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null,
  description text,
  week_date date not null,           -- stores the Monday of the week (or any date of the week)
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Photos table (linked to a highlight, multiple photos allowed)
create table if not exists highlight_photos (
  id uuid primary key default uuid_generate_v4(),
  highlight_id uuid references highlights(id) on delete cascade not null,
  storage_path text not null,        -- path in Supabase Storage bucket
  created_at timestamptz default now() not null
);

-- Auto-update updated_at on highlights
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger highlights_updated_at
  before update on highlights
  for each row execute procedure update_updated_at();

-- Storage bucket for highlight photos
-- Run this separately or via Supabase dashboard:
-- insert into storage.buckets (id, name, public) values ('highlights', 'highlights', true);

-- RLS: disable for personal app (single user, no auth complexity)
alter table highlights disable row level security;
alter table highlight_photos disable row level security;
