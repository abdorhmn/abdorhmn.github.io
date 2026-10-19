const root = document.documentElement;

// Resolve data/asset paths relative to wherever script.js itself lives,
// so pages nested in subfolders (e.g. /projects/) still find /data/*.json
// and /assets/* correctly without hardcoding depth.
const scriptEl = document.currentScript;
const siteRoot = new URL('.', (scriptEl && scriptEl.src) || location.href).href;
function siteUrl(path) {
  return new URL(path, siteRoot).href;
}

const themeButton = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('.theme-label');
const savedTheme = localStorage.getItem('theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(theme) {
  root.dataset.theme = theme;
  themeLabel.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#141917' : '#f3f0e8';
}

setTheme(savedTheme || (systemDark ? 'dark' : 'light'));

themeButton.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
  localStorage.setItem('theme', nextTheme);
});

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('nav a')];

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const current = link.getAttribute('href') === `#${entry.target.id}`;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-25% 0px -65% 0px' });

sections.forEach((section) => observer.observe(section));

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

function makeIcon(name, extraClass) {
  const icon = document.createElement('i');
  icon.className = `fa-solid fa-${name}${extraClass ? ` ${extraClass}` : ''}`;
  icon.setAttribute('aria-hidden', 'true');
  return icon;
}

function makeTags(tags, label = 'Technologies') {
  const list = document.createElement('ul');
  list.className = 'tags';
  list.setAttribute('aria-label', label);
  tags.forEach((tag) => {
    const item = document.createElement('li');
    item.textContent = tag;
    list.append(item);
  });
  return list;
}

function makeLinksRow(links) {
  const wrap = document.createElement('div');
  wrap.className = 'project-links';
  links.forEach((link) => {
    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.append(`${link.label} `, makeIcon('arrow-up-right-from-square'));
    if (!link.internal) {
      anchor.target = '_blank';
      anchor.rel = 'noopener';
    }
    wrap.append(anchor);
  });
  return wrap;
}

function renderExperiences(experiences) {
  const list = document.getElementById('experience-list');
  experiences.forEach((experience) => {
    const article = document.createElement('article');
    article.className = 'role';

    const meta = document.createElement('div');
    meta.className = 'role-meta';
    const dates = document.createElement('time');
    dates.textContent = experience.dates;
    const location = document.createElement('span');
    location.textContent = experience.location;
    meta.append(dates, location);

    const content = document.createElement('div');
    content.className = 'role-content';
    const title = document.createElement('h2');
    title.textContent = experience.role;
    content.append(title);

    const organization = document.createElement(experience.organizationUrl ? 'a' : 'p');
    organization.className = 'organization';
    organization.append(experience.organization);
    if (experience.organizationUrl) {
      organization.href = experience.organizationUrl;
      organization.target = '_blank';
      organization.rel = 'noopener';
      organization.append(' ', makeIcon('arrow-up-right-from-square'));
    }
    content.append(organization);

    experience.description.forEach((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      content.append(paragraph);
    });
    content.append(makeTags(experience.tags));
    article.append(content, meta);
    list.append(article);
  });
}

function makePlaceholder(project, index) {
  const visual = document.createElement('div');
  visual.className = `project-visual visual-${project.visualStyle || 'default'}`;
  visual.setAttribute('role', 'img');
  visual.setAttribute('aria-label', `Placeholder for ${project.imageAlt}`);

  const number = document.createElement('span');
  number.className = 'visual-index';
  number.textContent = String(index + 1).padStart(2, '0');
  visual.append(number);

  if (project.visualStyle === 'antenna') {
    ['one', 'two', 'three'].forEach((name) => {
      const signal = document.createElement('div');
      signal.className = `signal signal-${name}`;
      signal.setAttribute('aria-hidden', 'true');
      visual.append(signal);
    });
  } else if (project.visualStyle === 'synth') {
    const wave = document.createElement('div');
    wave.className = 'waveform';
    wave.setAttribute('aria-hidden', 'true');
    visual.append(wave);
  } else if (project.visualStyle === 'scouting') {
    const qr = document.createElement('div');
    qr.className = 'qr-mark';
    qr.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 5; i += 1) qr.append(document.createElement('i'));
    visual.append(qr);
  }

  const label = document.createElement('p');
  label.append('Project image', document.createElement('br'));
  const filename = document.createElement('small');
  filename.textContent = project.placeholderFile || 'project-image.jpg';
  label.append(filename);
  visual.append(label);
  return visual;
}

function makeGalleryTile(photo, index, project) {
  if (photo.src) {
    const image = document.createElement('img');
    image.className = 'detail-gallery-image';
    image.src = siteUrl(photo.src);
    image.alt = photo.alt || project.imageAlt;
    image.loading = 'lazy';
    return image;
  }
  const tile = document.createElement('div');
  tile.className = 'detail-gallery-placeholder';
  tile.setAttribute('role', 'img');
  tile.setAttribute('aria-label', `Placeholder for ${photo.alt || project.imageAlt}`);

  const label = document.createElement('p');
  label.append('Project image', document.createElement('br'));
  const filename = document.createElement('small');
  filename.textContent = photo.placeholderFile || `project-image-${index + 1}.jpg`;
  label.append(filename);
  tile.append(label);
  return tile;
}

// Opens a full-size, uncropped view of a project image in a modal.
let imageModal;

function openImageModal(src, alt) {
  if (!imageModal) {
    imageModal = document.createElement('dialog');
    imageModal.className = 'image-modal';
    imageModal.setAttribute('aria-label', 'Project image');

    const modalImage = document.createElement('img');

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'image-modal-close';
    close.setAttribute('aria-label', 'Close image');
    close.append(makeIcon('xmark'));
    close.addEventListener('click', () => imageModal.close());

    // Clicking the dark backdrop (the dialog element itself) closes it.
    imageModal.addEventListener('click', (event) => {
      if (event.target === imageModal) imageModal.close();
    });

    imageModal.append(modalImage, close);
    document.body.append(imageModal);
  }
  const modalImage = imageModal.querySelector('img');
  modalImage.src = src;
  modalImage.alt = alt;
  imageModal.showModal();
}

// Home page: grid of project cards. Clicking a project image opens it in a
// modal; the title and "Read more!" link to the details page when enabled.
const HOME_PROJECT_LIMIT = 3;

function renderProjects(projects) {
  const list = document.getElementById('projects-list');
  projects.slice(0, HOME_PROJECT_LIMIT).forEach((project, index) => {
    const article = document.createElement('article');
    article.className = `project${project.featured ? ' project-featured' : ''}`;

    // const detailUrl = project.slug ? `${siteUrl('projects/')}#${project.slug}` : null;
    const detailUrl = null; // re-enable the line above when project writeups are ready

        const visualWrap = document.createElement('div');
    visualWrap.className = 'project-visual-link';

    if (project.image) {
      const openFull = () => openImageModal(siteUrl(project.image), project.imageAlt);
      visualWrap.classList.add('is-zoomable');
      visualWrap.tabIndex = 0;
      visualWrap.setAttribute('role', 'button');
      visualWrap.setAttribute('aria-label', `View full image of ${project.title}`);
      visualWrap.addEventListener('click', openFull);
      visualWrap.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openFull();
        }
      });

      const image = document.createElement('img');
      image.className = 'project-image';
      image.src = siteUrl(project.image);
      image.alt = project.imageAlt;
      image.loading = 'lazy';
      visualWrap.append(image);
    } else {
      visualWrap.append(makePlaceholder(project, index));
    }
    article.append(visualWrap);

    const copy = document.createElement('div');
    copy.className = 'project-copy';

    const date = document.createElement('p');
    date.className = 'project-date';
    date.textContent = project.date;

    const title = document.createElement('h2');
    if (detailUrl) {
      const titleLink = document.createElement('a');
      titleLink.className = 'project-title-link';
      titleLink.href = detailUrl;
      titleLink.textContent = project.title;
      title.append(titleLink);
    } else {
      title.textContent = project.title;
    }

    const description = document.createElement('p');
    description.textContent = project.description;
    copy.append(date, title, description, makeTags(project.tags));

    const links = [...(project.links || [])];
    if (detailUrl) links.push({ label: 'Read more!', url: detailUrl, internal: true });
    if (links.length) copy.append(makeLinksRow(links));

    article.append(copy);
    list.append(article);
  });
}

// Writing/blog list on the home page, sourced from data/writing.json.
function renderWriting(posts) {
  const list = document.getElementById('writing-list');
  posts.forEach((post) => {
    const anchor = document.createElement('a');
    anchor.className = 'post';
    anchor.href = post.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener';

    const time = document.createElement('time');
    time.dateTime = post.date;
    time.textContent = post.displayDate || post.date;

    const span = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = post.title;
    const small = document.createElement('small');
    small.textContent = post.subtitle;
    span.append(strong, small);

    const arrow = document.createElement('b');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.append(makeIcon('arrow-up-right-from-square'));

    anchor.append(time, span, arrow);
    list.append(anchor);
  });
}

// project-details.html: one full section per project, plus a jump-nav
// at the top of the page linking to each section.
function renderProjectDetails(projects) {
  const list = document.getElementById('project-detail-list');
  const jumpNav = document.getElementById('project-jump-nav');

  if (jumpNav) {
    projects.forEach((project) => {
      const link = document.createElement('a');
      link.href = `#${project.slug}`;
      link.textContent = project.title;
      jumpNav.append(link);
    });
  }

  projects.forEach((project, index) => {
    const section = document.createElement('section');
    section.className = 'section project-detail';
    section.id = project.slug || `project-${index}`;

    const kicker = document.createElement('p');
    kicker.className = 'section-kicker';
    kicker.textContent = `${String(index + 1).padStart(2, '0')} · ${project.date}`;

    const title = document.createElement('h2');
    title.textContent = project.title;

    section.append(kicker, title);

    if (project.gallery?.length) {
      const gallery = document.createElement('div');
      gallery.className = 'detail-gallery';
      project.gallery.forEach((photo, photoIndex) => {
        gallery.append(makeGalleryTile(photo, photoIndex, project));
      });
      section.append(gallery);
    }

    const copy = document.createElement('div');
    copy.className = 'detail-copy';
    const paragraphs = project.longDescription?.length ? project.longDescription : [project.description];
    paragraphs.forEach((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      copy.append(paragraph);
    });
    copy.append(makeTags(project.tags));
    if (project.links?.length) copy.append(makeLinksRow(project.links));
    section.append(copy);

    const backLink = document.createElement('a');
    backLink.className = 'detail-back-link';
    backLink.href = `${siteUrl('index.html')}#projects`;
    backLink.append(makeIcon('arrow-left'), ' Back to home');
    section.append(backLink);

    list.append(section);
  });
}

// Scrolls to the project matching the URL hash once detail sections exist.
function jumpToHash() {
  if (!location.hash) return;
  const target = document.querySelector(location.hash);
  if (target) target.scrollIntoView();
}

async function loadAndRender(url, renderFn, container) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not load ${url}`);
    const data = await response.json();
    renderFn(data);
  } catch (error) {
    console.error(error);
    container.textContent = 'This content is temporarily unavailable.';
  }
}

async function loadPortfolioData() {
  const experienceList = document.getElementById('experience-list');
  const projectsList = document.getElementById('projects-list');
  const writingList = document.getElementById('writing-list');
  const projectDetailList = document.getElementById('project-detail-list');

  const tasks = [];
  if (experienceList) tasks.push(loadAndRender(siteUrl('data/experience.json'), renderExperiences, experienceList));
  if (projectsList) tasks.push(loadAndRender(siteUrl('data/projects.json'), renderProjects, projectsList));
  if (writingList) tasks.push(loadAndRender(siteUrl('data/writing.json'), renderWriting, writingList));
  if (projectDetailList) tasks.push(loadAndRender(siteUrl('data/projects.json'), renderProjectDetails, projectDetailList));

  await Promise.all(tasks);
  if (projectDetailList) jumpToHash();
}

loadPortfolioData();