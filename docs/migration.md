supabase_migration:
  name: "20250823_create_onboarding_answers_table"
  description: "Create onboarding_answers table to store user answers to onboarding questions (identity, family, education, career, influences) per onboarding.yaml; add enums, indexes, and RLS policies."
  source_of_truth:
    - path: "nality/apps/web/src/lib/prompts/onboarding.yaml"
      notes: "Uses conversation_openers topics and data_schema keys to annotate stored answers."
  sql: |
    -- Ensure required extension for gen_random_uuid()
    create extension if not exists "pgcrypto";

    -- Enumerated types derived from onboarding.yaml persona and topics
    do $$ begin
      if not exists (select 1 from pg_type where typname = 'onboarding_topic') then
        create type onboarding_topic as enum ('identity','family','education','career','influences');
      end if;
    end $$;

    do $$ begin
      if not exists (select 1 from pg_type where typname = 'form_of_address') then
        create type form_of_address as enum ('du','sie');
      end if;
    end $$;

    do $$ begin
      if not exists (select 1 from pg_type where typname = 'language_style') then
        create type language_style as enum ('prosa','fachlich','locker');
      end if;
    end $$;

    -- Main table
    create table if not exists public.onboarding_answers (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references auth.users(id) on delete cascade,
      session_id uuid null,
      message_id text null,
      question_topic onboarding_topic not null,
      field_key text null,
      question_text text not null,
      answer_text text not null,
      answer_json jsonb null,
      model_name text null,
      persona_form_of_address form_of_address null,
      persona_language_style language_style null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    -- Auto-update updated_at timestamp
    create or replace function public.set_updated_at()
    returns trigger language plpgsql as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$;

    drop trigger if exists trg_onboarding_answers_updated_at on public.onboarding_answers;
    create trigger trg_onboarding_answers_updated_at
    before update on public.onboarding_answers
    for each row execute function public.set_updated_at();

    -- Indexes for common query patterns
    create index if not exists idx_onboarding_answers_user_id on public.onboarding_answers(user_id);
    create index if not exists idx_onboarding_answers_created_at on public.onboarding_answers(created_at);
    create index if not exists idx_onboarding_answers_topic on public.onboarding_answers(question_topic);
    create index if not exists idx_onboarding_answers_field_key on public.onboarding_answers(field_key);

    -- Enable Row Level Security
    alter table public.onboarding_answers enable row level security;

    -- RLS policies: users can manage only their own rows
    drop policy if exists "Users can select own onboarding answers" on public.onboarding_answers;
    create policy "Users can select own onboarding answers"
      on public.onboarding_answers
      for select
      to authenticated
      using (auth.uid() = user_id);

    drop policy if exists "Users can insert own onboarding answers" on public.onboarding_answers;
    create policy "Users can insert own onboarding answers"
      on public.onboarding_answers
      for insert
      to authenticated
      with check (auth.uid() = user_id);

    drop policy if exists "Users can update own onboarding answers" on public.onboarding_answers;
    create policy "Users can update own onboarding answers"
      on public.onboarding_answers
      for update
      to authenticated
      using (auth.uid() = user_id);

    drop policy if exists "Users can delete own onboarding answers" on public.onboarding_answers;
    create policy "Users can delete own onboarding answers"
      on public.onboarding_answers
      for delete
      to authenticated
      using (auth.uid() = user_id);

    -- Documentation
    comment on table public.onboarding_answers is 'Stores user answers to onboarding questions based on prompts in onboarding.yaml (topics: identity, family, education, career, influences).';
    comment on column public.onboarding_answers.question_topic is 'Topic category referencing conversation_openers sections in onboarding.yaml.';
    comment on column public.onboarding_answers.field_key is 'Logical field identifier (e.g., data_schema key or missingField label).';