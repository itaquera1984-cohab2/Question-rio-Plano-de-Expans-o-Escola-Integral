alter table public.unidades_escolares
  add column if not exists senha_hash text,
  add column if not exists senha_alterada_em timestamptz;

comment on column public.unidades_escolares.senha_hash is
  'Hash scrypt da senha individual da unidade; nunca armazena a senha em texto puro.';
