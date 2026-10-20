// Renders markdown/<name>.md into markdown.html and builds the sidebar
// navigation from its headings (h1 = 01, h2 = a, h3 = i).
// The markdown file is chosen by this page's own file name:
//   /baking/applecrumblebars.html loads <data-md-folder>/applecrumblebars.md
// (set data-md-folder on <body>; ?file=Name overrides the name for testing).
// Theme switching comes from script.js, which this page also loads.

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
  const headings = [...content.querySelectorAll('h1, h2, h3')];
  const used = new Set();
  const counts = [0, 0, 0];
  const entries = [];

  headings.forEach((heading) => {
    const level = Number(heading.tagName[1]);
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
    link.className = `nav-h${level}`;
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
    content.innerHTML = marked.parse(await response.text(), { gfm: true });
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

  buildNav();

  // Headings get their ids after load, so jump to a #heading link manually.
  if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView();
  }
}

renderMarkdown();
