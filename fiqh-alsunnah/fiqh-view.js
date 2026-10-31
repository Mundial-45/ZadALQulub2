// واجهة فقه السنة: تنقل ثنائي اللغة (عربي/إسباني).
(function () {
  const books = () => window.feqhData || [];
  const lang = () => (document.documentElement.lang === "es" ? "es" : "ar");
  const tr = value => value && (value[lang()] || value.ar || value.es) || "";
  let activeBook = null, activeSection = null;

  function addHomeCard() {
    const grid = document.querySelector(".home-category-grid");
    if (!grid || document.getElementById("fiqhHomeCard")) return;
    const card = document.createElement("button");
    card.id = "fiqhHomeCard";
    card.type = "button";
    card.className = "home-category-card home-category-wide bg-gradient-to-br from-amber-700 to-orange-900 hover:from-amber-800 text-white p-3 rounded-2xl shadow-lg transition transform active:scale-95 text-center flex flex-col items-center justify-center gap-2 cursor-pointer border border-amber-300/30";
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
    const v = ensureView(); v.classList.remove("hidden");
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
    activeBook = null; activeSection = null;
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
    book.sections.forEach(section => content.appendChild(card(tr(section.title), section.topics.length + (lang()==="es" ? " temas" : " مسائل"), () => renderSection(section))));
    v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Seleccione un tema para leer su introducción." : "اختر مسألة لقراءة تعريفها التمهيدي.";
  }
  function renderSection(section, skipHistory = false) {
    activeSection = section;
    if (!skipHistory) saveRoute("section", { bookId: activeBook.id, sectionId: section.id });
    const v = ensureView(), content = v.querySelector("#fiqhContent");
    v.querySelector("#fiqhHeading").textContent = tr(section.title);
    v.querySelector("#fiqhIntro").textContent = tr(activeBook.title);
    content.replaceChildren();
    section.topics.forEach(topic => content.appendChild(card(tr(topic.title), tr(topic.summary), () => renderTopic(topic))));
    v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Navegación: libro → sección → tema." : "مسار التصفح: الكتاب ← الباب ← المسألة.";
  }
  function renderTopic(topic, skipHistory = false) {
    if (!skipHistory) saveRoute("topic", { bookId: activeBook.id, sectionId: activeSection.id, topicId: topic.id });
    const v = ensureView(), content = v.querySelector("#fiqhContent");
    v.querySelector("#fiqhHeading").textContent = tr(topic.title);
    v.querySelector("#fiqhIntro").textContent = tr(activeBook.title) + " / " + tr(activeSection.title);
    content.replaceChildren();
    const p = document.createElement("article");
    p.className = "rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-800 p-5 text-base leading-8";
    p.textContent = tr(topic.summary);
    content.appendChild(p);
    v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Resumen introductorio; no constituye una fatwa ni sustituye la consulta de las fuentes y de especialistas." : "ملخص تمهيدي، وليس فتوى ولا يغني عن مراجعة المصادر وسؤال أهل العلم.";
  }
  function open() { hideOtherViews(); renderBooks(); }
  function restoreRoute(state) {
    const book = books().find(item => item.id === state.bookId);
    if (!book || state.level === "books") { hideOtherViews(); renderBooks(true); return; }
    const section = (book.sections || []).find(item => item.id === state.sectionId);
    hideOtherViews();
    if (state.level === "book" || !section) { renderBook(book, true); return; }
    if (state.level === "section") { renderSection(section, true); return; }
    const topic = (section.topics || []).find(item => item.id === state.topicId);
    renderSection(section, true);
    if (topic) renderTopic(topic, true);
  }
  function back() {
    if (history.state && history.state.view === "fiqh" && history.length > 1) { history.back(); return; }
    if (activeSection) { renderBook(activeBook); return; }
    if (activeBook) { renderBooks(); return; }
    const v = document.getElementById("fiqhView"); if (v) v.classList.add("hidden");
    const home = document.getElementById("homeView"); if (home) home.classList.remove("hidden");
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