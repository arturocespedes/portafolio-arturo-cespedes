# Portafolio — Órbita irregular V4

Versión de trabajo multipágina y mobile-first basada en el sistema editorial blanco aprobado.

## Cambios de esta versión

### Home

- La órbita mantiene el loop horizontal, pero incorpora movimiento orgánico individual en cada imagen.
- La velocidad cambia de forma sutil y desacelera progresivamente al interactuar con un proyecto.
- Se añadió la identificación `Portafolio de diseño` y un rótulo dinámico que muestra el título del proyecto activo, enfocado o situado en el centro del recorrido.
- Las animaciones siguen usando `transform`, `translate3d()` y `requestAnimationFrame`.

### Proyectos

- La barra de filtros permanece visible durante el scroll mediante `position: sticky`.
- Los filtros se reorganizaron en áreas amplias: Digital e interacción; Investigación y territorio; Identidad y comunicación; Editorial y narrativa; Multimedia y experimental.
- Cada filtro muestra su cantidad de proyectos.
- Los conteos de proyectos destacados y del archivo se actualizan al filtrar.

### Proyecto individual

- En desktop, la primera pantalla presenta el contenido a la izquierda y la imagen principal a la derecha.
- La galería utiliza un ancho mayor que el contenido textual y forma un mosaico de doce columnas.
- Las imágenes y videos conservan su proporción natural: no se fuerzan recortes cuadrados u horizontales según el dispositivo.
- En móvil, la galería vuelve a una secuencia vertical clara.

### Sobre mí

- Se mantiene sin cambios respecto de V3.

## Páginas

- `index.html`: Home con órbita irregular continua de los 15 proyectos.
- `proyectos.html`: proyectos destacados, archivo completo y filtros persistentes.
- `proyecto.html?slug=atlas-post-extractivismo`: plantilla dinámica de caso de estudio.
- `sobre-mi.html`: perfil, experiencia, herramientas, contacto y descarga de CV.

## Sistema

- Variables globales en `styles.css`.
- Datos centralizados en `projects-data.js`.
- Interacciones en `script.js`, sin frameworks.
- Fallback horizontal con `scroll-snap` para `prefers-reduced-motion`.
- Galería multimedia con imágenes, video y lightbox.

## Probar localmente

```bash
python -m http.server 8000
```

Abrir `http://localhost:8000`.

## Reemplazar contenido

1. Editar títulos, descripciones y categorías en `projects-data.js`.
2. Reemplazar imágenes en `assets/projects/` y `assets/gallery/`, conservando los nombres o actualizando las rutas.
3. Mantener las dimensiones originales de cada imagen: la galería ahora las respeta.
4. Reemplazar `assets/about-portrait.svg` por el retrato definitivo.
5. Reemplazar el CV en `assets/cv/Arturo_Cespedes_CV_2026.pdf`.


## Ajuste V4.1

El subtítulo de la órbita muestra por defecto **“Explora mis proyectos”**. Al pasar el cursor o enfocar una imagen cambia al nombre del proyecto y vuelve al mensaje inicial al salir.


## V4.2 — Preparación de imágenes reales

Sin modificar el diseño, la navegación ni las animaciones de V4.1, se separaron los tres usos principales de imagen de cada proyecto:

- `coverOrbit`: imagen que aparece en la órbita y en los proyectos destacados del Home.
- `coverArchive`: imagen que aparece en la página `proyectos.html`.
- `hero`: imagen principal que abre el proyecto individual.

Cada proyecto tiene además una propiedad `gallery` escrita de forma explícita. Ya no se generan automáticamente cuatro imágenes por nombre de archivo, por lo que un proyecto puede tener 3, 5, 8 o las piezas que necesite, mezclando imágenes y videos.

### Dónde reemplazar tus JPG

Las portadas están en `assets/projects/`. Por ejemplo, para Atlas:

- `atlas-post-extractivismo-orbit.jpg`
- `atlas-post-extractivismo-archive.jpg`
- `atlas-post-extractivismo-hero.jpg`

Las imágenes de galería están separadas por proyecto, por ejemplo:

- `assets/gallery/atlas-post-extractivismo/01.jpg`
- `assets/gallery/atlas-post-extractivismo/02.jpg`
- `assets/gallery/atlas-post-extractivismo/03.jpg`
- `assets/gallery/atlas-post-extractivismo/04.jpg`

Los JPG incluidos en esta versión son conversiones de los placeholders anteriores para que la web siga funcionando. Puedes reemplazarlos directamente conservando esos nombres o editar las rutas en `projects-data.js`.


## Proceso editable por proyecto

Cada proyecto define ahora su propio bloque `process` en `projects-data.js`. Puedes editar `title` y `description` de cada momento sin tocar `script.js`. La apariencia visual no fue modificada.
