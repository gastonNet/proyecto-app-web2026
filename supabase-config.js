/* =====================================================
   CONFIGURACIÓN DE SUPABASE
   -----------------------------------------------------
   Archivo compartido por products.js y admin.js.
   Se carga antes que ellos en index.html, producto.html
   y admin.html, así la URL y la clave se cambian en un
   solo lugar.

   ⚠️ Acá solo va la clave PÚBLICA (publishable).
   Nunca pegues claves secretas ni la service_role:
   cualquiera que abra el navegador puede leerlas.
   ===================================================== */

const SUPABASE_CONFIG = Object.freeze({
  // Base de la API REST del proyecto (Supabase > Settings > API).
  restUrl: "https://xxxuxvwzjcaxuwxrjomq.supabase.co/rest/v1",
  publishableKey: "sb_publishable_2TVOIBk4c8yyjaXJtBwmfQ_En_h4_lW",
});

// Endpoint completo de la tabla "products".
// Otra tabla nueva sería: `${SUPABASE_CONFIG.restUrl}/orders`
const SUPABASE_PRODUCTS_URL = `${SUPABASE_CONFIG.restUrl}/products`;
