// Renders markdown/<name>.md into markdown.html and builds the sidebar
// navigation from its headings (h2 = 01, h3 = a, h4 = i).
// The markdown file is chosen by this page's own file name:
//   /baking/applecrumblebars.html loads <data-md-folder>/applecrumblebars.md
// (set data-md-folder on <body>; ?file=Name overrides the name for testing).
// Theme switching comes from script.js, which this page also loads.
//
// Footnotes:  ==highlighted text==[^id]   (or just [^id] for a bare number)
//             [^id]: The note. It can use **bold**, *italic*, links, and `code`.

const content = document.getElementById('md-content');
const mdNav = document.getElementById('md-nav');

function toLetters(n) {
  let out = '';
  while (n > 0) {
    n -= 1;
    out = String.fromCharCode(97 + (n % 26)) + out;
    n = Math.floor(n / 26);
  }
  return out;
}

function toRoman(n) {
  let out = '';
  [[10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']].forEach(([value, symbol]) => {
    while (n >= value) {
      out += symbol;
      n -= value;
    }
  });
  return out;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'section';
}

// Gives each heading an id and adds a numbered link for it to the sidebar.
function buildNav() {
  const headings = [...content.querySelectorAll('h2, h3, h4')];
  const used = new Set();
  const counts = [0, 0, 0];
  const entries = [];

  headings.forEach((heading) => {
    const tag = Number(heading.tagName[1]);
    const level = tag - 1;
    counts[level - 1] += 1;
    for (let i = level; i < 3; i += 1) counts[i] = 0;

    const label = [String(counts[0]).padStart(2, '0'), toLetters(counts[1]), toRoman(counts[2])][level - 1];

    const base = slugify(heading.textContent);
    let id = base;
    for (let n = 2; used.has(id) || document.getElementById(id); n += 1) id = `${base}-${n}`;
    used.add(id);
    heading.id = id;

    const link = document.createElement('a');
    link.href = `#${id}`;
    link.className = `nav-h${tag}`;
    const number = document.createElement('span');
    number.textContent = label;
    link.append(number, heading.textContent);
    mdNav.append(link);
    entries.push({ heading, link });
  });

  if (!entries.length) return;

  // Highlight the last heading that has scrolled past the upper part of the screen.
  let waiting = false;
  function updateActive() {
    waiting = false;
    const line = window.innerHeight * 0.3;
    let current = entries[0];
    entries.forEach((entry) => {
      if (entry.heading.getBoundingClientRect().top <= line) current = entry;
    });
    entries.forEach(({ link }) => {
      const active = link === current.link;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (!waiting) {
      waiting = true;
      requestAnimationFrame(updateActive);
    }
  }, { passive: true });
  updateActive();
}


// ---------------------------------------------------------------------------
// Footnotes
// ---------------------------------------------------------------------------

let footnoteState = { defs: new Map(), order: [], refCounts: {}, inNote: false };

// Pulls "[^id]: text" definitions out of the markdown (skipping code blocks).
// Indented lines under a definition continue it.
function extractFootnotes(source) {
  const defs = new Map();
  const kept = [];
  let fence = null;
  let current = null;

  source.split(/\r?\n/).forEach((line) => {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
      current = null;
      kept.push(line);
      return;
    }
    if (fence) {
      kept.push(line);
      return;
    }
    const def = line.match(/^\[\^([\w-]+)\]:\s*(.*)$/);
    if (def) {
      current = def[1];
      defs.set(current, def[2].trim());
      return;
    }
    if (current && /^( {2,}|\t)\S/.test(line)) {
      defs.set(current, `${defs.get(current)} ${line.trim()}`);
      return;
    }
    current = null;
    kept.push(line);
  });

  return { text: kept.join('\n'), defs };
}

// Inline syntax: ==highlighted text==[^id] or just [^id].
marked.use({
  extensions: [{
    name: 'footnoteRef',
    level: 'inline',
    start(src) {
      return src.search(/==[^=\n]+==\[\^[\w-]+\]|\[\^[\w-]+\]/);
    },
    tokenizer(src) {
      const match = /^(?:==([^=\n]+)==)?\[\^([\w-]+)\]/.exec(src);
      if (!match) return undefined;
      return {
        type: 'footnoteRef',
        raw: match[0],
        text: match[1] || '',
        id: match[2],
        tokens: match[1] ? this.lexer.inlineTokens(match[1]) : [],
      };
    },
    renderer(token) {
      const state = footnoteState;
      // Leave it as plain text if there's no matching definition.
      if (state.inNote || !state.defs.has(token.id)) return token.raw;

      let index = state.order.indexOf(token.id);
      if (index === -1) {
        state.order.push(token.id);
        index = state.order.length - 1;
      }
      state.refCounts[token.id] = (state.refCounts[token.id] || 0) + 1;
      const count = state.refCounts[token.id];
      const refId = count === 1 ? `fnref-${token.id}` : `fnref-${token.id}-${count}`;
      const label = String(index + 1).padStart(2, '0');
      const text = token.text ? this.parser.parseInline(token.tokens) : '';

      return `<span class="fn" id="${refId}" data-fn="${token.id}">${text}`
        + `<a class="fn-num" href="#fn-${token.id}" aria-label="Footnote ${index + 1}">${label}</a></span>`
        + `<span class="fn-inline" data-fn="${token.id}"></span>`;
    },
  }],
});

// Adds the numbered footnote list to the end of the page and fills the
// inline (small screen) copies of each note.
function buildFootnotes() {
  const { order, defs } = footnoteState;
  if (!order.length) return;

  footnoteState.inNote = true;
  const section = document.createElement('section');
  section.className = 'fn-list-wrap';
  section.setAttribute('role', 'doc-endnotes');
  section.setAttribute('aria-label', 'Footnotes');
  const list = document.createElement('ol');
  list.className = 'fn-list';

  order.forEach((id, index) => {
    const html = marked.parseInline(defs.get(id));

    const item = document.createElement('li');
    item.id = `fn-${id}`;

    const number = document.createElement('span');
    number.className = 'fn-list-num';
    number.textContent = String(index + 1).padStart(2, '0');

    const body = document.createElement('span');
    body.className = 'fn-body';
    const text = document.createElement('span');
    text.className = 'fn-content';
    text.innerHTML = html;

    const back = document.createElement('a');
    back.className = 'fn-back';
    back.href = `#fnref-${id}`;
    back.setAttribute('aria-label', 'Back to text');
    back.append(makeIcon('arrow-up'));

    body.append(text, ' ', back);
    item.append(number, body);
    list.append(item);

    content.querySelectorAll(`.fn-inline[data-fn="${id}"]`).forEach((el) => {
      el.innerHTML = html;
    });
  });
  footnoteState.inNote = false;

  section.append(list);
  content.append(section);
}

// Wide screens: hover previews the note in the bottom-right corner, click keeps
// it open until you scroll, and the number jumps to the note.
// Narrow screens: clicking the highlight opens/closes the note inline.
function initFootnotes() {
  const refs = [...content.querySelectorAll('.fn')];
  if (!refs.length) return;

  const narrow = window.matchMedia('(max-width: 700px)');
  const tip = document.createElement('div');
  tip.className = 'fn-tooltip';
  tip.setAttribute('role', 'tooltip');
  tip.setAttribute('aria-hidden', 'true');
  const tipNumber = document.createElement('span');
  tipNumber.className = 'fn-tooltip-num';
  const tipBody = document.createElement('span');
  tipBody.className = 'fn-tooltip-body';
  tip.append(tipNumber, tipBody);
  document.body.append(tip);

  let pinned = null;

  function show(ref) {
    const note = document.querySelector(`#fn-${ref.dataset.fn} .fn-content`);
    tipNumber.textContent = ref.querySelector('.fn-num').textContent;
    tipBody.innerHTML = note.innerHTML;
    tip.classList.add('show');
    tip.setAttribute('aria-hidden', 'false');
    refs.forEach((other) => other.classList.toggle('active', other === ref));
  }

  function hide() {
    pinned = null;
    tip.classList.remove('show', 'pinned');
    tip.setAttribute('aria-hidden', 'true');
    refs.forEach((ref) => ref.classList.remove('active'));
  }

  function toggleInline(ref) {
    const note = ref.nextElementSibling;
    if (!note || !note.classList.contains('fn-inline')) return;
    ref.classList.toggle('active', note.classList.toggle('open'));
  }

  // Hover/focus only preview the note on wide screens, and not while one is pinned.
  const preview = (action) => () => {
    if (!narrow.matches && !pinned) action();
  };

  refs.forEach((ref) => {
    ['mouseenter', 'focusin'].forEach((type) => ref.addEventListener(type, preview(() => show(ref))));
    ['mouseleave', 'focusout'].forEach((type) => ref.addEventListener(type, preview(hide)));
    ref.addEventListener('click', (event) => {
      // Ordinary links inside the highlighted text keep working.
      const link = event.target.closest('a');
      if (link && !link.classList.contains('fn-num')) return;

      if (narrow.matches) {
        event.preventDefault();
        toggleInline(ref);
        return;
      }
      // The number jumps down to the footnote.
      if (link) {
        hide();
        return;
      }
      if (pinned === ref) {
        hide();
        return;
      }
      show(ref);
      pinned = ref;
      tip.classList.add('pinned');
    });
  });

  // A pinned note stays open until you scroll, click elsewhere, or press Esc.
  window.addEventListener('scroll', () => {
    if (pinned) hide();
  }, { passive: true });
  document.addEventListener('click', (event) => {
    if (pinned && !event.target.closest('.fn, .fn-tooltip')) hide();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && pinned) hide();
  });

  // Switching between wide and narrow layouts resets any open notes.
  narrow.addEventListener('change', () => {
    hide();
    content.querySelectorAll('.fn-inline.open').forEach((note) => note.classList.remove('open'));
  });
}

// A <figure> holding an image (or any wrapper) with a caption underneath.
// caption: text, '' to leave an empty line (keeps carousel slides aligned), null for no caption.
function makeFigure(media, caption) {
  const figure = document.createElement('figure');
  figure.className = 'md-figure';
  figure.append(media);
  if (caption !== null) {
    const text = document.createElement('figcaption');
    text.className = 'md-caption';
    text.textContent = caption || '\u00a0';
    figure.append(text);
  }
  return figure;
}

// An image's "caption" (the quoted text after its path) is its title attribute.
// Taking it out also stops the browser's duplicate hover tooltip.
function takeCaption(img) {
  const caption = img.title;
  img.removeAttribute('title');
  return caption;
}

// Standalone images with a caption get a centered caption underneath.
function buildFigures() {
  content.querySelectorAll('p > img[title]').forEach((img) => {
    const paragraph = img.parentElement;
    // Only when the image is the only thing in its paragraph.
    if (paragraph.children.length !== 1 || paragraph.textContent.trim()) return;
    paragraph.replaceWith(makeFigure(img, takeCaption(img)));
  });
}

// Image carousels: a ```carousel code block with one image per line, written
// exactly like a normal image:
//   ![alt text](image.jpg "Optional caption")
function buildCarousels() {
  const MAX_HEIGHT = 520;

  content.querySelectorAll('pre > code.language-carousel').forEach((code) => {
    // Parse the block as ordinary markdown, so images and captions work the same everywhere.
    const parsed = document.createElement('div');
    parsed.innerHTML = marked.parse(code.textContent);
    const images = [...parsed.querySelectorAll('img')];
    if (!images.length) return;
    const captions = images.map(takeCaption);
    const hasCaptions = captions.some(Boolean);

    const carousel = document.createElement('div');
    carousel.className = 'carousel';
    carousel.setAttribute('role', 'group');
    carousel.setAttribute('aria-roledescription', 'carousel');
    carousel.setAttribute('aria-label', 'Image carousel');

    const stage = document.createElement('div');
    stage.className = 'carousel-stage';
    const track = document.createElement('div');
    track.className = 'carousel-track';

    // Each slide is a figure holding its image and caption, so they move together.
    const items = images.map((img, i) => {
      const media = document.createElement('div');
      media.className = 'carousel-media';
      media.append(img);
      img.addEventListener('load', measure);
      const slide = makeFigure(media, hasCaptions ? captions[i] : null);
      slide.classList.add('carousel-slide');
      track.append(slide);
      return slide;
    });

    // Copies of the last and first slides on either end make the loop seamless.
    const loop = items.length > 1;
    if (loop) {
      const lead = items[items.length - 1].cloneNode(true);
      const tail = items[0].cloneNode(true);
      [lead, tail].forEach((clone) => {
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelector('img').alt = '';
      });
      track.prepend(lead);
      track.append(tail);
    }
    stage.append(track);
    carousel.append(stage);

    // Every image is scaled to the height of the tallest one (up to MAX_HEIGHT),
    // and every caption gets the height of the longest one, so slides line up.
    function measure() {
      const width = stage.clientWidth;
      if (!width) return;
      let tallest = 0;
      track.querySelectorAll('img').forEach((img) => {
        if (!img.naturalWidth) return;
        const height = img.naturalHeight * Math.min(1, width / img.naturalWidth);
        tallest = Math.max(tallest, Math.min(height, MAX_HEIGHT));
      });
      if (tallest) carousel.style.setProperty('--carousel-h', `${Math.round(tallest)}px`);

      if (hasCaptions) {
        carousel.style.setProperty('--caption-h', '0px');
        const longest = Math.max(...items.map((slide) => slide.querySelector('.md-caption').offsetHeight));
        carousel.style.setProperty('--caption-h', `${longest}px`);
      }
    }

    let lastWidth = 0;
    new ResizeObserver(() => {
      if (stage.clientWidth === lastWidth) return;
      lastWidth = stage.clientWidth;
      measure();
    }).observe(stage);
    if (document.fonts) document.fonts.ready.then(measure);

    let current = 0;              // which real image is showing
    let position = loop ? 1 : 0;  // where that is on the track (copies included)
    let moving = false;
    let timer;

    function update() {
      items.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== current)));
    }

    function place(animate) {
      track.style.transition = animate ? '' : 'none';
      track.style.transform = `translateX(-${position * 100}%)`;
      if (!animate) {
        track.getBoundingClientRect(); // apply the jump before turning the animation back on
        track.style.transition = '';
      }
    }

    // After sliding onto a copy, jump back to the matching real image.
    function settle() {
      clearTimeout(timer);
      if (!moving) return;
      moving = false;
      if (position === 0) {
        position = items.length;
        place(false);
      } else if (position === items.length + 1) {
        position = 1;
        place(false);
      }
    }
    track.addEventListener('transitionend', (event) => {
      if (event.target === track) settle();
    });

    function go(step) {
      if (moving) return;
      current = (current + step + items.length) % items.length;
      position += step;
      moving = true;
      place(true);
      // Backup in case the transition event doesn't fire (e.g. reduced motion).
      if (parseFloat(getComputedStyle(track).transitionDuration) === 0) settle();
      else timer = setTimeout(settle, 700);
      update();
    }

    place(false);
    update();

    if (loop) {
      const controls = document.createElement('div');
      controls.className = 'carousel-controls';
      [['Previous image', 'arrow-left-long', -1], ['Next image', 'arrow-right-long', 1]].forEach(([label, icon, step]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'carousel-btn';
        button.setAttribute('aria-label', label);
        button.append(makeIcon(icon));
        button.addEventListener('click', () => go(step));
        controls.append(button);
      });
      carousel.append(controls);

      // Swipe left/right on touch screens.
      let startX = null;
      stage.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; }, { passive: true });
      stage.addEventListener('touchend', (event) => {
        if (startX === null) return;
        const distance = event.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(distance) > 40) go(distance < 0 ? 1 : -1);
      });
    }

    code.parentElement.replaceWith(carousel);
    measure();
  });
}

// Embeds (YouTube, Spotify, etc.): paste the provider's <iframe> code straight into the markdown.
function setupEmbeds() {
  content.querySelectorAll('iframe').forEach((frame) => {
    frame.loading = 'lazy';
    const width = frame.getAttribute('width');
    const height = frame.getAttribute('height');
    // Fixed-size embeds (like YouTube's 560x315) keep their proportions as the page narrows.
    // Embeds with width="100%" (like Spotify) keep their set height.
    if (/^\d+$/.test(width) && /^\d+$/.test(height)) {
      frame.style.aspectRatio = `${width} / ${height}`;
      frame.style.height = 'auto';
    }
  });
}

async function renderMarkdown() {
  const folder = (document.body.dataset.mdFolder || '/markdown').replace(/\/$/, '');
  const pageName = location.pathname.split('/').filter(Boolean).pop() || 'index';
  const name = (new URLSearchParams(location.search).get('file') || pageName).replace(/\.(html|md)$/i, '');

  // Only plain file names: no slashes or dots, so it can't read outside the folder.
  if (!/^[\w-]+$/.test(name)) {
    content.textContent = `Can't use "${name}" as a markdown file name. Use letters, numbers, dashes, and underscores.`;
    return;
  }

  try {
    const response = await fetch(`${folder}/${name}.md`);
    if (!response.ok) throw new Error(`Could not load ${folder}/${name}.md`);
    const { text, defs } = extractFootnotes(await response.text());
    footnoteState = { defs, order: [], refCounts: {}, inNote: false };
    content.innerHTML = marked.parse(text, { gfm: true });
    buildFootnotes();
  } catch (error) {
    console.error(error);
    content.textContent = `Couldn't find ${folder}/${name}.md. The file name must match this page's name exactly, including capitalization.`;
    return;
  }

  const title = content.querySelector('h1');
  if (title) document.title = `${title.textContent} | Abdelrahman Ahmed`;

  // Open outside links in a new tab.
  content.querySelectorAll('a[href]').forEach((link) => {
    if (link.host && link.host !== location.host) {
      link.target = '_blank';
      link.rel = 'noopener';
    }
  });

  // Let checklist items be ticked off (not saved between visits).
  content.querySelectorAll('input[type="checkbox"]').forEach((box) => {
    box.disabled = false;
  });

  buildFigures();
  setupEmbeds();
  buildCarousels();
  buildNav();
  initFootnotes();

  // Headings get their ids after load, so jump to a #heading link manually.
  if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView();
  }
}

renderMarkdown();
