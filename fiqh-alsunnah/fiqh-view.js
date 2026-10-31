// واجهة فقه السنة: تنقل ثنائي اللغة (عربي/إسباني).
(function () {
  const books = () => { const registered = window.FiqhBooks && Object.values(window.FiqhBooks); return registered && registered.length ? registered : (Array.isArray(window.feqhData) ? window.feqhData : []); };
  const lang = () => (document.documentElement.lang === "es" ? "es" : "ar");
  const tr = value => value && (value[lang()] || value.ar || value.es) || "";
  let activeBook = null, activeSection = null, activeChapter = null;

  function addHomeCard() {
    const existing = document.getElementById("fiqhHomeCard")
      || document.querySelector('.home-category-grid button[onclick="openFiqhSection()"]');
    if (existing) {
      existing.id = "fiqhHomeCard";
      return;
    }
    const grid = document.querySelector(".home-category-grid");
    if (!grid) return;
    const card = document.createElement("button");
    card.id = "fiqhHomeCard";
    card.type = "button";
    card.className = "home-category-card home-category-wide text-white p-3 rounded-2xl shadow-lg text-center flex items-center justify-center gap-2 cursor-pointer";
    card.innerHTML = '<span class="text-3xl" aria-hidden="true">📚</span><span class="block"><span class="block text-lg font-extrabold" data-ar="فقه السنة" data-es="Fiqh as-Sunnah">فقه السنة</span><span class="block text-amber-100 text-xs mt-0.5" data-ar="أبواب الفقه وأحكامه" data-es="Temas y normas de jurisprudencia">أبواب الفقه وأحكامه</span></span>';
    card.addEventListener("click", open);
    grid.appendChild(card);
  }

  function ensureView() {
    let view = document.getElementById("fiqhView");
    if (view) return view;
    view = document.createElement("section");
    view.id = "fiqhView";
    view.className = "hidden space-y-5";
    view.innerHTML = '<div class="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3"><button id="fiqhBack" type="button" class="rounded-xl bg-emerald-50 dark:bg-emerald-950 px-3 py-2 text-sm font-bold text-emerald-800 dark:text-emerald-200">رجوع</button><h2 id="fiqhHeading" class="text-lg font-extrabold text-center">فقه السنة</h2><span class="w-12"></span></div><p id="fiqhIntro" class="text-sm text-slate-600 dark:text-slate-300"></p><div id="fiqhContent" class="grid grid-cols-1 gap-3"></div><p class="text-xs text-slate-500 dark:text-slate-400 border-t pt-3" id="fiqhNotice"></p>';
    const main = document.querySelector("main");
    if (main) main.appendChild(view);
    view.querySelector("#fiqhBack").addEventListener("click", back);
    return view;
  }

  function hideOtherViews() {
    ["homeView","categoryListView","detailView","tasbeehView","favoritesView","quranView","quranSurahsView","quranAhzabView","quranReaderView"].forEach(id => {
      const el = document.getElementById(id); if (el) el.classList.add("hidden");
    });
    const v = ensureView(); v.style.display = ""; v.classList.remove("hidden");
  }
  function card(title, sub, action) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-start shadow-sm hover:border-emerald-500";
    const h = document.createElement("span"); h.className = "block font-bold text-slate-800 dark:text-slate-100"; h.textContent = title;
    const p = document.createElement("span"); p.className = "mt-1 block text-sm text-slate-500 dark:text-slate-400"; p.textContent = sub;
    b.append(h,p); b.addEventListener("click", action); return b;
  }
  function saveRoute(level, extra = {}) {
    try {
      const state = { view: "fiqh", level, ...extra };
      const suffix = level === "books" ? "fiqh" : level === "book" ? "fiqh-" + extra.bookId : level === "section" ? "fiqh-" + extra.bookId + "-" + extra.sectionId : "fiqh-" + extra.bookId + "-" + extra.sectionId + "-" + extra.topicId;
      history.pushState(state, "", "#" + suffix);
    } catch (e) {}
  }
  function renderBooks(skipHistory = false) {
    const v = ensureView(), content = v.querySelector("#fiqhContent");
    if (!skipHistory) saveRoute("books");
    activeBook = null; activeSection = null; activeChapter = null;
    v.querySelector("#fiqhHeading").textContent = lang() === "es" ? "Fiqh as-Sunnah" : "فقه السنة";
    v.querySelector("#fiqhIntro").textContent = lang() === "es" ? "Seleccione un libro para consultar sus temas." : "اختر كتابًا لاستعراض أبوابه ومسائله.";
    content.replaceChildren();
    books().forEach(book => content.appendChild(card(tr(book.title), tr(book.intro), () => renderBook(book))));
    v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Contenido introductorio organizado por temas. Las pruebas textuales y las atribuciones se incorporarán con referencias verificadas." : "محتوى تمهيدي مرتب حسب الموضوعات. ستضاف الأدلة والنقول مع عزوها إلى مراجع موثقة.";
  }
  function renderBook(book, skipHistory = false) {
    activeBook = book; activeSection = null;
    if (!skipHistory) saveRoute("book", { bookId: book.id });
    const v = ensureView(), content = v.querySelector("#fiqhContent");
    v.querySelector("#fiqhHeading").textContent = tr(book.title);
    v.querySelector("#fiqhIntro").textContent = tr(book.intro);
    content.replaceChildren();
    book.sections.forEach(section => {
      const sub = section.id === "water" && section.chapters
        ? (lang() === "es" ? "Introducción y tres capítulos" : "تمهيد وثلاثة فصول")
        : section.topics.length + (lang() === "es" ? " temas" : " مسائل");
      content.appendChild(card(tr(section.title), sub, () => renderSection(section)));
    });
    v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Seleccione un tema para leer su introducción." : "اختر مسألة لقراءة تعريفها التمهيدي.";
  }
  function renderSection(section, skipHistory = false) {
    activeSection = section;
    if (!skipHistory) saveRoute("section", { bookId: activeBook.id, sectionId: section.id });
    const v = ensureView(), content = v.querySelector("#fiqhContent");
    v.querySelector("#fiqhHeading").textContent = tr(section.title);
    v.querySelector("#fiqhIntro").textContent = tr(activeBook.title);
    content.replaceChildren();
    activeChapter = null;
    if (section.id === "water" && section.chapters) {
      content.appendChild(card(tr(section.intro.title), tr(section.intro.summary), () => renderTopic(section.intro)));
      section.chapters.forEach(chapter => content.appendChild(card(tr(chapter.title), chapter.topics.length + (lang() === "es" ? " apartados" : " مباحث"), () => renderWaterChapter(chapter))));
      v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Introducción y tres capítulos del tema del agua." : "التمهيد والفصول الثلاثة لباب المياه.";
    } else {
      section.topics.forEach(topic => content.appendChild(card(tr(topic.title), tr(topic.summary), () => renderTopic(topic))));
      v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Navegación: libro → sección → tema." : "مسار التصفح: الكتاب ← الباب ← المسألة.";
    }
  }
  function renderWaterChapter(chapter, skipHistory = false) {
    activeChapter = chapter;
    if (!skipHistory) saveRoute("chapter", { bookId: activeBook.id, sectionId: activeSection.id, chapterId: chapter.id });
    const v = ensureView(), content = v.querySelector("#fiqhContent");
    v.querySelector("#fiqhHeading").textContent = tr(chapter.title);
    v.querySelector("#fiqhIntro").textContent = tr(activeBook.title) + " / " + tr(activeSection.title);
    content.replaceChildren();
    chapter.topics.forEach(topic => content.appendChild(card(tr(topic.title), tr(topic.summary), () => renderTopic(topic))));
    v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Seleccione un apartado para consultar su contenido." : "اختر المبحث لعرض محتواه.";
  }
  // إبراز النصوص الشرعية والمراجع على نمط الموسوعة الفقهية بالدرر السنية.
  function appendStyledEvidence(target, value) {
    const pattern = /(﴿[^﴿﴾]*﴾|»[^»«]*«|«[^«»]*»|\\(\\([^()\\n]{2,}\\)\\))/g;
    let last = 0, match;
    while ((match = pattern.exec(value)) !== null) {
      if (match.index > last) target.appendChild(document.createTextNode(value.slice(last, match.index)));
      const span = document.createElement("span");
      const token = match[0];
      if (token.startsWith("﴿")) span.className = "fiqh-quran";
      else if (token.startsWith("»") || token.startsWith("«")) span.className = "fiqh-hadith";
      else span.className = "fiqh-source";
      span.textContent = token;
      target.appendChild(span);
      last = pattern.lastIndex;
    }
    if (last < value.length) target.appendChild(document.createTextNode(value.slice(last)));
  }

  function renderTopic(topic, skipHistory = false) {
    if (!skipHistory) saveRoute("topic", { bookId: activeBook.id, sectionId: activeSection.id, chapterId: activeChapter && activeChapter.id, topicId: topic.id });
    const v = ensureView(), content = v.querySelector("#fiqhContent");
    v.querySelector("#fiqhHeading").textContent = tr(topic.title);
    v.querySelector("#fiqhIntro").textContent = tr(activeBook.title) + " / " + tr(activeSection.title);
    content.replaceChildren();
    const article = document.createElement("article");
    article.className = "rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-800 p-5 text-base leading-8 space-y-5";
    const summary = document.createElement("p");
    summary.className = "font-semibold text-slate-700 dark:text-slate-200";
    summary.textContent = tr(topic.summary);
    article.appendChild(summary);
    const sections = topic.content && (topic.content[lang()] || topic.content.ar || topic.content.es);
    if (Array.isArray(sections)) {
      sections.forEach(part => {
        const block = document.createElement("section");
        block.className = "space-y-2";
        if (part.heading) {
          const heading = document.createElement("h3");
          heading.className = "font-extrabold text-emerald-800 dark:text-emerald-300 text-lg";
          heading.textContent = part.heading;
          block.appendChild(heading);
        }
        const paragraph = document.createElement("p");
        paragraph.className = "fiqh-article-text whitespace-pre-line text-slate-800 dark:text-slate-100";
        appendStyledEvidence(paragraph, part.text || "");
        block.appendChild(paragraph);
        article.appendChild(block);
      });
    }
    content.appendChild(article);
    v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Contenido educativo resumido a partir de fuentes jurídicas; no sustituye una fatwa ni la consulta de especialistas." : "محتوى تعليمي محرر من مصادر فقهية، ولا يغني عن الفتوى أو سؤال أهل العلم.";
  }
  function open() { hideOtherViews(); renderBooks(); }
  function restoreRoute(state) {
    const book = books().find(item => item.id === state.bookId);
    if (!book || state.level === "books") { hideOtherViews(); renderBooks(true); return; }
    const section = (book.sections || []).find(item => item.id === state.sectionId);
    hideOtherViews();
    if (state.level === "book" || !section) { renderBook(book, true); return; }
    if (state.level === "section") { renderSection(section, true); return; }
    renderSection(section, true);
    if (state.level === "chapter" && section.chapters) {
      const chapter = section.chapters.find(item => item.id === state.chapterId);
      if (chapter) renderWaterChapter(chapter, true);
      return;
    }
    let topic = (section.topics || []).find(item => item.id === state.topicId);
    if (section.chapters) {
      const chapter = section.chapters.find(item => item.id === state.chapterId);
      if (chapter) {
        renderWaterChapter(chapter, true);
        topic = (chapter.topics || []).find(item => item.id === state.topicId);
      } else if (state.topicId === section.intro.id) topic = section.intro;
    }
    if (topic) renderTopic(topic, true);
  }
  function back() {
    if (history.state && history.state.view === "fiqh" && history.length > 1) { history.back(); return; }
    if (activeChapter) { renderSection(activeSection); return; }
    if (activeSection) { renderBook(activeBook); return; }
    if (activeBook) { renderBooks(); return; }
    const v = document.getElementById("fiqhView"); if (v) { v.classList.add("hidden"); v.style.display = "none"; }
    const home = document.getElementById("homeView"); if (home) { home.style.display = ""; home.classList.remove("hidden"); }
  }
  function refreshLanguage() {
    const v = document.getElementById("fiqhView");
    if (v && !v.classList.contains("hidden")) {
      if (activeSection) renderSection(activeSection);
      else if (activeBook) renderBook(activeBook);
      else renderBooks();
    }
    const card = document.querySelector("#fiqhHomeCard");
    if (card) card.querySelectorAll("[data-ar]").forEach(el => el.textContent = el.dataset[lang()]);
  }
  window.openFiqhSection = open;
  window.restoreFiqhRoute = restoreRoute;
  window.refreshFiqhLanguage = refreshLanguage;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addHomeCard, { once: true });
  else addHomeCard();
  const oldToggle = window.toggleLanguage;
  if (typeof oldToggle === "function") {
    window.toggleLanguage = function () { oldToggle.apply(this, arguments); refreshLanguage(); };
  }
})();