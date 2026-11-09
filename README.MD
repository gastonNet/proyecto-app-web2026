# MiEcommerce — Proyecto E-commerce

Tienda online **estática** (sin frameworks ni herramientas de build) con catálogo
dinámico, ficha de producto, carrito con persistencia y panel de administración
(ABM) conectado a una base de datos **Supabase**.

> Proyecto de la materia Programación Web — Cliente (2º Cuatrimestre 2026).

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Estructura | HTML5 semántico (`header`, `nav`, `main`, `section`, `article`, `aside`) |
| Estilos | CSS3 moderno: variables CSS, Flexbox, Grid, **mobile-first** con `@media (min-width: ...)` |
| Lógica | JavaScript **ES6+ nativo** (`const`, arrow functions, `async/await`, `fetch`, templates literales) |
| Backend | **Supabase** (PostgreSQL expuesto por API REST / PostgREST) |
| Persistencia local | **`localStorage`** para el carrito |
| Accesibilidad | `aria-label`, `aria-labelledby`, `aria-live`, `role="status"/"alert"`, `.visually-hidden`, `prefers-reduced-motion` |

No hay `package.json`, ni `node_modules`, ni pasos de compilación: el proyecto
se sirve tal cual.

---

## Páginas

| Página | Archivo | Descripción |
| --- | --- | --- |
| Inicio | `index.html` | Hero, carrusel de destacados, filtros (categoría / precio mínimo / novedades), listado de productos, beneficios y aviso legal |
| Producto | `producto.html?id=<id>` | Ficha dinámica: imagen, categoría, precio, descripción y alta al carrito |
| Carrito | `carrito.html` | Ítems con cantidad (+ / −), eliminar, subtotal/total y formulario de pago simulado |
| Administración | `admin.html` | ABM de productos: crear, editar, eliminar y listar (con vista previa de la imagen) |

---

## Estructura del proyecto

```
proyecto-app-web2026/
├── index.html              # Portada
├── producto.html           # Detalle de producto (?id=...)
├── carrito.html            # Carrito y checkout
├── admin.html              # Panel de administración
├── styles.css              # Estilos de todas las páginas
├── supabase-config.js      # URL + clave pública de Supabase (compartido)
├── products.js             # Carga de productos (index y ficha) + filtros
├── cart.js                 # Carrito: localStorage, contador y render
├── admin.js                # ABM contra la API de Supabase
├── supabase/
│   └── fix-products-id-sequence.sql   # Repara la secuencia del ID
├── .github/
│   └── pull_request_template.md       # Plantilla de PR de la materia
├── PREDICCIONES.MD         # Bitácora de pasos / prompts usados con la IA
└── README.MD               # Este archivo
```

**Orden de carga de los scripts** (importa, porque usan variables globales):

```html
<script src="supabase-config.js"></script>  <!-- 1. define SUPABASE_CONFIG -->
<script src="products.js"></script>          <!-- 2. usa la config -->
<script src="cart.js"></script>              <!-- 3. carrito y contador -->
```

En `admin.html` el orden es `supabase-config.js` → `admin.js`.

---

## Cómo correrlo

### Requisitos

- Un navegador moderno (Chrome, Edge, Firefox o Safari).
- [Git](https://git-scm.com/) y un editor de código (por ejemplo VS Code).
- *Opcional:* Node.js, solo para validar la sintaxis del JavaScript.

### Opción A — Servidor local con VS Code (recomendada)

1. Abrí la carpeta del proyecto en VS Code.
2. Instalá la extensión **Live Server**.
3. Clic derecho sobre `index.html` → **Open with Live Server**.

### Opción B — Servidor estático desde la terminal

```bash
# Con Python
python -m http.server 8080

# O con Node (no instala nada en el proyecto)
npx serve .
```

Después abrí <http://localhost:8080>.

### Opción C — Abrir el archivo directo

Doble clic en `index.html` funciona para ver el HTML/CSS, pero algunos
navegadores bloquean `fetch` desde `file://`. **Recomendado: usá la Opción A o B.**

### Validación de sintaxis

```bash
node --check supabase-config.js
node --check products.js
node --check cart.js
node --check admin.js
```

---

## Base de datos (Supabase)

### Conexión

La URL del proyecto y la clave **publishable** están en un único archivo:
[`supabase-config.js`](supabase-config.js).

```js
const SUPABASE_CONFIG = Object.freeze({
  restUrl: "https://xxxuxvwzjcaxuwxrjomq.supabase.co/rest/v1",
  publishableKey: "sb_publishable_...",
});

const SUPABASE_PRODUCTS_URL = `${SUPABASE_CONFIG.restUrl}/products`;
```

Todas las peticiones mandan dos headers:

```
apikey: <publishable key>
Authorization: Bearer <publishable key>
```

> ⚠️ En el navegador **solo** puede ir la clave *publishable*. Nunca la
> `service_role` ni claves secretas: cualquiera que abra las herramientas de
> desarrollo puede leerlas.

### Tabla `products`

Tipos tomados de los datos reales que devuelve la API:

| Columna | Tipo | Descripción |
| --- | --- | --- |
| `id` | `integer` (PK, serial) | Identificador numérico, se usa en `producto.html?id=` |
| `created_at` | `timestamptz` | Fecha de alta (default `now()`) |
| `idName` | `text` | Slug del producto (`auriculares`), generado con `productSlug()` |
| `name` | `text` | Nombre visible |
| `description` | `text` | Descripción corta |
| `price` | `numeric` | Precio en pesos argentinos (el formulario permite decimales) |
| `categoria` | `text` | Una de: `electronica`, `hogar`, `ropa` |
| `nuevo` | `boolean` | Marca el producto como novedad (filtro "Nuevo") |
| `image` | `text` | URL de la imagen |
| `imageAlt` | `text` | Texto alternativo de la imagen |
| `titleUrl` | `text` | Enlace del título (`producto.html`) |
| `detailsUrl` | `text` | Enlace de detalle (`producto.html`) |

DDL aproximado para recrear la tabla:

```sql
create table public.products (
  id          serial primary key,
  created_at  timestamptz not null default now(),
  idName      text not null,
  name        text not null,
  description text not null,
  price       numeric not null,
  categoria   text not null,
  nuevo       boolean not null default false,
  image       text not null,
  imageAlt    text not null,
  titleUrl    text,
  detailsUrl  text
);
```

### Crear la base desde cero

1. Crear un proyecto en <https://supabase.com>.
2. En **SQL Editor**, pegar el DDL anterior y ejecutarlo.
3. En **Project Settings → API**, copiar la *Project URL* y la *publishable key*.
4. Pegar esos dos valores en [`supabase-config.js`](supabase-config.js).
5. Cargar productos de prueba desde el panel `admin.html`.

> En este proyecto las operaciones anónimas funcionan, así que la tabla tiene
> RLS desactivado o con policies permisivas. Si activás **Row Level Security**
> sin crear policies, la API devolverá listas vacías y bloqueará los altas.

### Consultas que hace la app

| Acción | Método | Endpoint |
| --- | --- | --- |
| Listar / filtrar | `GET` | `/rest/v1/products` |
| Traer uno | `GET` | `/rest/v1/products?id=eq.1&select=*` |
| Crear | `POST` | `/rest/v1/products` (body en JSON) |
| Editar | `PATCH` | `/rest/v1/products?id=eq.1` + header `Prefer: return=minimal` |
| Eliminar | `DELETE` | `/rest/v1/products?id=eq.1` |

Ejemplo de petición:

```bash
curl "https://xxxuxvwzjcaxuwxrjomq.supabase.co/rest/v1/products?id=eq.1&select=*" \
  -H "apikey: <publishable key>" \
  -H "Authorization: Bearer <publishable key>"
```

### Fix de la secuencia de ID

Si al crear un producto aparece el error `23505` (`Products_pkey`), significa
que la secuencia automática quedó desincronizada. Ejecutar en
**Supabase → SQL Editor**:

```sql
-- supabase/fix-products-id-sequence.sql
SELECT setval(
  pg_get_serial_sequence('public."products"', 'id'),
  COALESCE((SELECT MAX(id) FROM public."products"), 0) + 1,
  false
);
```

El panel admin muestra este mensaje y el archivo a ejecutar cuando pasa.

### Seguridad (pendiente)

Hoy **no hay autenticación ni Row Level Security**: cualquiera que abra
`admin.html` puede leer y modificar productos con la clave pública. Es
aceptable para la práctica, pero el siguiente paso es **Supabase Auth + RLS**.

---

## Carrito

- **Clave de `localStorage`:** `mi-ecommerce-cart`
- **Estructura guardada:** array de objetos

```json
[
  { "id": "1", "name": "Auriculares Bluetooth", "price": 59990, "quantity": 2 }
]
```

- Se agrega desde el listado (`index.html`) o desde la ficha (`producto.html`).
- Si la cantidad llega a 0, el producto se elimina.
- `readCart()` siempre devuelve un array válido: si el JSON guardado está
  corrupto, devuelve `[]`.
- El contador del navbar se actualiza en todas las páginas con
  `updateCartBadge()`.
- El pago es **simulado**: no hay pasarela, al enviar el formulario se vacía el
  carrito y se muestra el mensaje de confirmación.

---

## Flujo de trabajo (entregas)

1. Nunca se trabaja directo sobre `main`: siempre se crea una rama propia.
2. Los cambios se suben y se abre un Pull Request **dentro del propio
   repositorio**, completando la [plantilla](.github/pull_request_template.md).
3. `PREDICCIONES.MD` guarda la bitácora de pasos y prompts usados con la IA.
4. Instrucciones originales del template del profesor:
   <https://github.com/mef760/proyecto-aplicaciones-web-cliente-2c-2026>

---

## Autor

Repositorio del alumno · Proyecto para Programación Web — Cliente · 2026
