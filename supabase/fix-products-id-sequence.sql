-- Sincroniza la secuencia del ID con el mayor ID existente en public."Products".
-- Ejecutar desde Supabase Dashboard > SQL Editor.
SELECT setval(
  pg_get_serial_sequence('public."products"', 'id'),
  COALESCE((SELECT MAX(id) FROM public."products"), 0) + 1,
  false
);
