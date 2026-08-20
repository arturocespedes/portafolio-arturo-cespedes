(() => {
  "use strict";

  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));

  function setupMenu() {
    const button = document.querySelector(".menu-button");
    const menu = document.querySelector(".mobile-menu");
    const close = document.querySelector(".menu-close");
    if (!button || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      button.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
      if (open) menu.querySelector("a")?.focus();
      else button.focus({ preventScroll: true });
    };

    button.addEventListener("click", () => setOpen(true));
    close?.addEventListener("click", () => setOpen(false));
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) setOpen(false);
    });
  }

  function setupReveal() {
    const items = [...document.querySelectorAll(".reveal")];
    if (!items.length || reducedMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    items.forEach((item) => observer.observe(item));
  }

  const orbitLayout = [
    [-4.8, -12.8, -1.2, 1.25], [5.8, 14.5, 0.95, -0.85], [-1.4, -5.5, -0.35, 0.55],
    [7.4, 18.5, -1.4, 1.5], [-6.2, -16.5, 0.85, -1.15], [2.2, 7.5, -0.65, 0.6],
    [-7.6, -19.5, 1.2, -1.45], [6.8, 16.2, -0.9, 1.15], [-0.8, 2.8, 0.45, -0.45],
    [8.1, 20.2, 1.25, -1.25], [-5.4, -14.6, -1.05, 1.05], [3.8, 10.5, 0.55, -0.85],
    [-7.8, -20.5, -0.75, 1.35], [5.1, 13.6, 1.05, -1.15], [0.5, -2.8, -0.45, 0.65]
  ];

  const orbitFloat = [
    [0.8, -0.8, 0.45, 6.8], [-0.6, 1.15, -0.35, 8.1], [0.5, -1.25, 0.3, 7.4],
    [-0.9, 0.75, -0.5, 9.2], [0.7, 1.0, 0.38, 7.8], [-0.5, -0.95, -0.28, 8.7]
  ];

  function orbitItem(project, index, clone = false) {
    const [mobileY, desktopY, mobileR, desktopR] = orbitLayout[index % orbitLayout.length];
    const [floatX, floatY, floatR, duration] = orbitFloat[index % orbitFloat.length];
    const link = document.createElement("a");
    link.className = `orbit-item orbit-${project.size || "standard"}`;
    link.href = `proyecto.html?slug=${encodeURIComponent(project.slug)}`;
    link.dataset.projectTitle = project.title;
    link.style.setProperty("--offset-y-mobile", `${mobileY}rem`);
    link.style.setProperty("--offset-y-desktop", `${desktopY}vh`);
    link.style.setProperty("--rotate-mobile", `${mobileR}deg`);
    link.style.setProperty("--rotate-desktop", `${desktopR}deg`);
    link.style.setProperty("--float-x", `${floatX}rem`);
    link.style.setProperty("--float-y", `${floatY}rem`);
    link.style.setProperty("--float-r", `${floatR}deg`);
    link.style.setProperty("--float-duration", `${duration}s`);
    link.style.setProperty("--float-delay", `${-(index * 0.63)}s`);
    link.setAttribute("aria-label", clone ? "" : `Ver proyecto ${project.title}`);
    if (clone) link.tabIndex = -1;

    const media = document.createElement("span");
    media.className = "orbit-media";
    const image = document.createElement("img");
    image.src = project.coverOrbit;
    image.alt = clone ? "" : project.title;
    image.loading = index < 6 ? "eager" : "lazy";
    image.decoding = "async";
    media.appendChild(image);
    link.appendChild(media);
    return link;
  }

  function setupOrbit() {
    const viewport = document.querySelector("[data-orbit-viewport]");
    const track = document.querySelector("[data-orbit-track]");
    const group = document.querySelector("[data-orbit-group]");
    const clone = document.querySelector("[data-orbit-clone]");
    const toggle = document.querySelector("[data-orbit-toggle]");
    const title = document.querySelector("[data-orbit-title]");
    if (!viewport || !track || !group || !clone || !projects.length) return;

    projects.forEach((project, index) => group.appendChild(orbitItem(project, index)));
    projects.forEach((project, index) => clone.appendChild(orbitItem(project, index, true)));

    const items = [...track.querySelectorAll(".orbit-item")];
    const defaultOrbitTitle = "Explora mis proyectos";
    const setTitle = (value) => {
      if (!title || !value || title.textContent === value) return;
      title.classList.remove("is-changing");
      requestAnimationFrame(() => {
        title.textContent = value;
        title.classList.add("is-changing");
      });
    };

    items.forEach((item) => {
      const enter = () => {
        setTitle(item.dataset.projectTitle);
        item.classList.add("is-active");
      };
      const leave = () => {
        item.classList.remove("is-active");
        setTitle(defaultOrbitTitle);
      };
      item.addEventListener("pointerenter", enter);
      item.addEventListener("pointerleave", leave);
      item.addEventListener("focus", enter);
      item.addEventListener("blur", leave);
    });

    if (reducedMotion.matches) return;

    let x = 0;
    let last = performance.now();
    let distance = 0;
    let running = true;
    let inView = true;
    let hoveringItem = false;
    let interacting = false;
    let currentSpeed = 0;
    let raf = 0;

    items.forEach((item) => {
      item.addEventListener("pointerenter", () => { hoveringItem = true; });
      item.addEventListener("pointerleave", () => { hoveringItem = false; });
      item.addEventListener("focus", () => { hoveringItem = true; });
      item.addEventListener("blur", () => { hoveringItem = false; });
    });

    const getTargetSpeed = (now) => {
      if (!running || hoveringItem || interacting) return 0;
      const base = window.innerWidth < 720 ? 25 : 40;
      return base * (0.94 + Math.sin(now / 2600) * 0.08);
    };

    const measure = () => {
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0");
      distance = group.getBoundingClientRect().width + gap;
      if (distance > 0) x = ((x % distance) + distance) % distance - distance;
    };


    const frame = (now) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      const targetSpeed = getTargetSpeed(now);
      currentSpeed += (targetSpeed - currentSpeed) * Math.min(1, delta * 5.2);
      if (inView && !document.hidden && distance > 0) {
        x -= currentSpeed * delta;
        if (x <= -distance) x += distance;
        track.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      raf = requestAnimationFrame(frame);
    };

    const updateToggle = () => {
      if (!toggle) return;
      toggle.setAttribute("aria-pressed", String(!running));
      toggle.querySelector("[data-orbit-icon]").textContent = running ? "Ⅱ" : "▶";
      toggle.querySelector("[data-orbit-label]").textContent = running ? "Pausar movimiento" : "Reanudar movimiento";
    };

    toggle?.addEventListener("click", () => {
      running = !running;
      updateToggle();
    });
    viewport.addEventListener("pointerdown", () => { interacting = true; });
    window.addEventListener("pointerup", () => { interacting = false; });
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("load", measure, { once: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.01 }).observe(viewport);
    }

    requestAnimationFrame(() => {
      measure();
      last = performance.now();
      raf = requestAnimationFrame(frame);
    });

    window.addEventListener("pagehide", () => cancelAnimationFrame(raf), { once: true });
  }

  function selectedCard(project) {
    return `
      <article class="selected-card reveal">
        <a class="selected-card-image" href="proyecto.html?slug=${encodeURIComponent(project.slug)}">
          <img src="${escapeHTML(project.coverOrbit)}" alt="${escapeHTML(project.title)}" loading="lazy" decoding="async">
        </a>
        <div class="selected-card-meta">
          <span>${escapeHTML(project.index)}</span>
          <div><h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.categories.slice(0, 2).join(" + "))}</p></div>
          <span>${escapeHTML(project.year)}</span>
        </div>
      </article>`;
  }

  function setupSelectedWork() {
    const grid = document.querySelector("[data-selected-grid]");
    if (!grid) return;
    const featured = projects.filter((project) => project.featured).slice(0, 4);
    grid.innerHTML = featured.map(selectedCard).join("");
  }

  function setupVideo() {
    const video = document.querySelector("[data-autoplay-video]");
    const button = document.querySelector("[data-video-toggle]");
    if (!video || !button) return;
    const sync = () => {
      button.textContent = video.paused ? "Reproducir" : "Pausar";
      button.setAttribute("aria-pressed", String(!video.paused));
    };
    button.addEventListener("click", async () => {
      try {
        if (video.paused) await video.play(); else video.pause();
      } catch (_) { /* autoplay can be restricted */ }
      sync();
    });
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    if (!reducedMotion.matches && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(async ([entry]) => {
        try {
          if (entry.isIntersecting && entry.intersectionRatio > 0.55) await video.play();
          else video.pause();
        } catch (_) { /* no-op */ }
      }, { threshold: [0, 0.55, 1] });
      observer.observe(video);
    }
    sync();
  }

  function archiveFeatureCard(project) {
    return `
      <article class="archive-feature-card reveal" data-categories="${escapeHTML(project.categories.join("|"))}">
        <a href="proyecto.html?slug=${encodeURIComponent(project.slug)}"><img src="${escapeHTML(project.coverArchive)}" alt="${escapeHTML(project.title)}" loading="lazy"></a>
        <div class="card-line"><span class="card-index">${escapeHTML(project.index)}</span><div><h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.categories.slice(0,2).join(" + "))}</p></div><span class="card-year">${escapeHTML(project.year)}</span></div>
      </article>`;
  }

  function archiveRow(project) {
    return `
      <a class="archive-row reveal" href="proyecto.html?slug=${encodeURIComponent(project.slug)}" data-categories="${escapeHTML(project.categories.join("|"))}">
        <img class="archive-thumb" src="${escapeHTML(project.coverArchive)}" alt="" loading="lazy">
        <span class="archive-row-index">${escapeHTML(project.index)}</span>
        <span class="archive-row-copy"><h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.categories.slice(0,2).join(" + "))}</p></span>
        <span class="archive-row-year">${escapeHTML(project.year)}</span>
      </a>`;
  }

  function setupArchive() {
    const featuredGrid = document.querySelector("[data-featured-archive]");
    const archiveList = document.querySelector("[data-archive-list]");
    const filterRow = document.querySelector("[data-filter-row]");
    if (!featuredGrid || !archiveList || !filterRow) return;

    const featured = projects.filter((project) => project.featured).slice(0, 4);
    const remaining = projects.filter((project) => !featured.some((item) => item.slug === project.slug));
    featuredGrid.innerHTML = featured.map(archiveFeatureCard).join("");
    archiveList.innerHTML = remaining.map(archiveRow).join("");

    const filterGroups = [
      { id: "all", label: "Todos", categories: [] },
      { id: "digital", label: "Digital e interacción", categories: ["Interacción", "UX/UI", "Producto digital", "Desarrollo web", "Archivo digital", "Datos"] },
      { id: "research", label: "Investigación y territorio", categories: ["Investigación", "Cartografía", "Diseño sonoro"] },
      { id: "identity", label: "Identidad y comunicación", categories: ["Identidad", "Comunicación", "Packaging", "Dirección visual", "Ilustración"] },
      { id: "editorial", label: "Editorial y narrativa", categories: ["Editorial", "Narrativa", "Archivo digital"] },
      { id: "media", label: "Multimedia y experimental", categories: ["Multimedia", "Animación", "Experimental", "Diseño sonoro"] }
    ];

    const matchesGroup = (project, group) => group.id === "all" || project.categories.some((category) => group.categories.includes(category));
    filterRow.innerHTML = filterGroups.map((group, index) => {
      const total = projects.filter((project) => matchesGroup(project, group)).length;
      return `<button class="filter-button${index === 0 ? " is-active" : ""}" type="button" data-filter="${escapeHTML(group.id)}"><span>${escapeHTML(group.label)}</span><sup>${String(total).padStart(2, "0")}</sup></button>`;
    }).join("");

    const count = document.querySelector("[data-project-count]");
    const featuredCount = document.querySelector("[data-featured-count]");
    const archiveCount = document.querySelector("[data-archive-count]");
    const items = [...document.querySelectorAll("[data-categories]")];

    const applyFilter = (group) => {
      let visible = 0;
      let visibleFeatured = 0;
      let visibleArchive = 0;
      items.forEach((item) => {
        const itemCategories = item.dataset.categories.split("|");
        const matches = group.id === "all" || itemCategories.some((category) => group.categories.includes(category));
        item.hidden = !matches;
        if (matches) {
          visible += 1;
          if (item.classList.contains("archive-feature-card")) visibleFeatured += 1;
          else visibleArchive += 1;
        }
      });
      if (count) count.textContent = String(visible).padStart(2, "0");
      if (featuredCount) featuredCount.textContent = String(visibleFeatured).padStart(2, "0");
      if (archiveCount) archiveCount.textContent = String(visibleArchive).padStart(2, "0");
    };

    filterRow.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      filterRow.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
      const group = filterGroups.find((item) => item.id === button.dataset.filter) || filterGroups[0];
      applyFilter(group);
    });
  }

  function projectTemplate(project, previous, next) {
    const tags = project.categories.join(" · ");
    const processItems = Array.isArray(project.process) && project.process.length
      ? project.process
      : [
          { title: "Investigar", description: "Levantamiento de antecedentes, referentes, actores, datos y condiciones del contexto." },
          { title: "Sistematizar", description: "Organización de hallazgos, relaciones y jerarquías para construir una arquitectura de sentido." },
          { title: "Materializar", description: "Traducción visual e interactiva mediante prototipos, pruebas y un sistema aplicable." }
        ];
    const processMarkup = processItems.map((item, index) => `
      <article class="process-card reveal">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description)}</p>
      </article>`).join("");
    const gallery = project.gallery.map((item, index) => {
      const orderClass = `media-order-${index + 1}`;
      if (item.type === "video") {
        return `<figure class="media-item ${escapeHTML(item.size || "standard")} ${orderClass}"><video controls playsinline preload="metadata" poster="${escapeHTML(item.poster || "")}"><source src="${escapeHTML(item.src)}" type="video/mp4"></video><figcaption>${String(index + 1).padStart(2,"0")} / ${escapeHTML(item.caption)}</figcaption></figure>`;
      }
      return `<figure class="media-item ${escapeHTML(item.size || "standard")} ${orderClass}"><button type="button" data-lightbox-open data-src="${escapeHTML(item.src)}" data-alt="${escapeHTML(item.alt)}" data-caption="${escapeHTML(item.caption)}"><img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.alt)}" loading="lazy"></button><figcaption>${String(index + 1).padStart(2,"0")} / ${escapeHTML(item.caption)}</figcaption></figure>`;
    }).join("");

    return `
      <section class="project-opening reveal">
        <div class="project-opening-copy">
          <a class="project-back" href="proyectos.html">← Todos los proyectos</a>
          <div class="project-head">
            <h1>${escapeHTML(project.title)}</h1>
            <div class="project-summary"><span class="project-kicker">${escapeHTML(tags)}</span><p>${escapeHTML(project.description)}</p></div>
            <dl class="project-facts">
              <div><dt>Rol</dt><dd>${escapeHTML(project.role)}</dd></div>
              <div><dt>Año</dt><dd>${escapeHTML(project.year)}</dd></div>
              <div><dt>Tipo</dt><dd>${escapeHTML(project.categories.join(", "))}</dd></div>
              <div><dt>Contexto</dt><dd>${escapeHTML(project.context)}</dd></div>
              <div><dt>Resultado</dt><dd>${escapeHTML(project.result)}</dd></div>
            </dl>
          </div>
        </div>
        <figure class="project-hero-media"><img src="${escapeHTML(project.hero)}" alt="Vista principal de ${escapeHTML(project.title)}"></figure>
      </section>
      <section class="project-media">
        <div class="project-section-label reveal"><span>Medios y resultados</span><span>${project.gallery.length.toString().padStart(2,"0")} piezas</span></div>
        <div class="media-grid">${gallery}</div>
      </section>
      <section class="process-section">
        <div class="project-section-label reveal"><span>Claves del proyecto</span><span>${String(processItems.length).padStart(2, "0")} aspectos</span></div>
        <div class="process-grid">${processMarkup}
        </div>
        <div class="project-statement reveal">
  <p>${escapeHTML(project.statement)}</p>
</div>
      </section>
      <nav class="project-navigation reveal" aria-label="Navegación entre proyectos">
        <a href="proyecto.html?slug=${encodeURIComponent(previous.slug)}"><span>← Proyecto anterior</span><strong>${escapeHTML(previous.title)}</strong></a>
        <a href="proyecto.html?slug=${encodeURIComponent(next.slug)}"><span>Proyecto siguiente →</span><strong>${escapeHTML(next.title)}</strong></a>
      </nav>`;
  }

  function setupProjectCase() {
    const container = document.querySelector("[data-project-case]");
    if (!container || !projects.length) return;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug") || projects[0].slug;
    let index = projects.findIndex((project) => project.slug === slug);
    if (index < 0) index = 0;
    const project = projects[index];
    const previous = projects[(index - 1 + projects.length) % projects.length];
    const next = projects[(index + 1) % projects.length];
    document.title = `${project.title} — Arturo Céspedes`;
    container.innerHTML = projectTemplate(project, previous, next);
  }

  function setupLightbox() {
    const dialog = document.querySelector("[data-lightbox]");
    if (!dialog) return;
    const image = dialog.querySelector("[data-lightbox-image]");
    const caption = dialog.querySelector("[data-lightbox-caption]");
    const close = () => dialog.open && dialog.close();

    document.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-lightbox-open]");
      if (!opener) return;
      image.src = opener.dataset.src || "";
      image.alt = opener.dataset.alt || "";
      caption.textContent = opener.dataset.caption || "";
      dialog.showModal();
    });
    dialog.querySelector("[data-lightbox-close]")?.addEventListener("click", close);
    dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  }

  function init() {
    setupMenu();
    setupOrbit();
    setupSelectedWork();
    setupVideo();
    setupArchive();
    setupProjectCase();
    setupLightbox();
    setupReveal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
