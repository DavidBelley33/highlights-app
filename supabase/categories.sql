-- Categories table
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  value text unique not null,
  label text not null,
  emoji text not null default '⭐',
  sort_order int default 0,
  created_at timestamptz default now() not null
);

alter table categories disable row level security;

-- Seed with default categories
insert into categories (value, label, emoji, sort_order) values
  ('famille',          'Famille',                      '👨‍👩‍👧‍👦', 1),
  ('soiree-gars',      'Soirée de gars',               '🍺',  2),
  ('soiree-filles',    'Soirée de filles',             '🥂',  3),
  ('nouvelle-aventure','Nouvelle aventure',            '🧭',  4),
  ('voyage',           'Voyage',                       '✈️',  5),
  ('concert-dj',       'Concert / DJ set',             '🎵',  6),
  ('evenement-pro',    'Événement professionnel',      '💼',  7),
  ('rencontre',        'Rencontre',                    '🤝',  8),
  ('temps-seul',       'Temps seul / nature / sport',  '🌿',  9),
  ('autre',            'Autre',                        '⭐', 10)
on conflict (value) do nothing;
