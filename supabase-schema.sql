-- =====================================================
-- DASHBOARD BEZA - Schema do Banco de Dados (Supabase)
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Tabela de categorias
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz default now()
);

-- Categorias padrão
insert into categories (name, color) values
  ('Cliente', '#3b82f6'),
  ('Interno', '#8b5cf6'),
  ('Admin', '#f59e0b'),
  ('Reunião', '#ef4444'),
  ('Criação', '#10b981')
on conflict do nothing;

-- Tabela principal de tarefas
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category_id uuid references categories(id) on delete set null,
  estimated_minutes integer not null default 60,
  completed boolean not null default false,
  date date not null,
  rolled_over boolean not null default false,
  original_date date,
  notes text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Índice para busca por data (performance)
create index if not exists tasks_date_idx on tasks(date);

-- Habilitar Row Level Security (RLS)
alter table tasks enable row level security;
alter table categories enable row level security;

-- Política: qualquer pessoa com a chave anon pode ler e escrever
-- (para uso pessoal, sem autenticação)
create policy "Allow all operations" on tasks
  for all using (true) with check (true);

create policy "Allow all operations" on categories
  for all using (true) with check (true);
