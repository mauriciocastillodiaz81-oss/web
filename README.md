# Inversiones Casthe SpA · Sitio web

Landing estática de Inversiones Casthe SpA, empresa constructora y de arriendo de maquinaria de Talca.
Es HTML, CSS y JavaScript sin dependencias ni paso de compilación: se publica tal cual en cualquier hosting estático.

## Estructura

| Ruta | Contenido |
|------|-----------|
| `index.html` | Todo el contenido de la página |
| `css/styles.css` | Estilos. Paleta y tipografías en `:root` |
| `js/main.js` | Menú móvil, animaciones, línea de tiempo y formulario que arma el mensaje de WhatsApp |
| `assets/img/` | Fotografías optimizadas en WebP (varios anchos) y patrones de fondo |
| `assets/brand/` | Logo e íconos del sitio |
| `assets/clientes/` | Logos de clientes del carrusel |

## Datos que cambian seguido

- **WhatsApp principal:** `WA_NUMBER` en `js/main.js` y los enlaces `https://wa.me/56966226325` en `index.html`.
- **Correo:** `EMAIL` en `js/main.js` y los enlaces `mailto:` en `index.html`.
- **Proyectos (trayectoria):** cada tarjeta es un `<li class="tl__item">` dentro de `.tl__track` en `index.html`.

## Publicación

Funciona en GitHub Pages, Netlify, Vercel o cualquier hosting estático.
Cuando el sitio tenga dominio propio, conviene cambiar `og:image` en `index.html` por la URL completa
(por ejemplo `https://midominio.cl/assets/img/og-casthe.jpg`) para que la vista previa en WhatsApp y redes salga bien.
