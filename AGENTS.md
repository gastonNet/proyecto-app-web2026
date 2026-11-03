# Guía del proyecto

- Proyecto web estático: usa HTML, CSS y JavaScript nativo y moderno con indentacion de codigo; no agregues dependencias ni herramientas de build sin necesidad.
- `products.js` carga los productos desde Supabase y sirve tanto a `index.html` como a `producto.html`. Conserva el detalle identificado por `?id=...` y crea contenido dinámico con APIs seguras del DOM.
- En el navegador usa únicamente la clave pública de Supabase; nunca expongas claves secretas o `service_role`.
- Valida cambios de JavaScript con `node --check products.js` y formato con `git diff --check`. No hay una suite de pruebas configurada.
