insert into public.categories (name) values
  ('Eletricista'),
  ('Encanador'),
  ('Pedreiro'),
  ('Pintor'),
  ('Jardineiro'),
  ('Diarista'),
  ('Montador de móveis'),
  ('Técnico de informática'),
  ('Ar-condicionado'),
  ('Chaveiro')
on conflict (name) do nothing;

insert into public.regions (name) values
  ('Centro'),
  ('Zona Norte'),
  ('Zona Sul'),
  ('Zona Leste'),
  ('Zona Oeste')
on conflict (name) do nothing;

