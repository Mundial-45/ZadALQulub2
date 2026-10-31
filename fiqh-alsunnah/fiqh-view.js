// واجهة فقه السنة: تنقل ثنائي اللغة (عربي/إسباني).
(function () {
  const books = () => {
    const registered = window.FiqhBooks && Object.values(window.FiqhBooks).filter(book => book && book.id && book.title);
    const fallback = Array.isArray(window.feqhData) ? window.feqhData.filter(book => book && book.id && book.title) : [];
    const list = registered && registered.length ? registered : fallback;
    const tahara = window.FiqhBooks && window.FiqhBooks.tahara;
    if (tahara && tahara.id === "tahara" && !list.some(book => book.id === "tahara")) list.unshift(tahara);
    return list.sort((a, b) => (a.id === "tahara" ? -1 : b.id === "tahara" ? 1 : 0));
  };
  const lang = () => (document.documentElement.lang === "es" ? "es" : "ar");
  const tr = value => value && (value[lang()] || value.ar || value.es) || "";
  let activeBook = null, activeSection = null, activeChapter = null, activeTopic = null, activeIssue = null;

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
    books().forEach(book => content.appendChild(card(tr(book.title), lang() === "es" ? "Abrir libro" : "فتح الكتاب", () => renderBook(book))));
    v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Contenido introductorio organizado por temas. Las pruebas textuales y las atribuciones se incorporarán con referencias verificadas." : "محتوى فقهي مرتب حسب الأبواب والمسائل.";
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
        ? (lang() === "es" ? "Abrir capítulo" : "فتح الباب")
        : lang() === "es" ? "Abrir sección" : "فتح الباب";
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
    if (section.chapters && section.chapters.length) {
      if (section.intro) content.appendChild(card(tr(section.intro.title), lang() === "es" ? "Introducción" : "عرض التمهيد", () => renderTopic(section.intro)));
      section.chapters.forEach(chapter => content.appendChild(card(tr(chapter.title), lang() === "es" ? "Ver apartados" : "عرض المباحث", () => renderChapter(chapter))));
      v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Seleccione un capítulo." : "اختر الفصل لعرض مباحثه.";
    } else {
      (section.topics || []).forEach(topic => content.appendChild(card(tr(topic.title), lang() === "es" ? "Abrir apartado" : "عرض المبحث", () => renderTopic(topic))));
      v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Seleccione un apartado." : "اختر المبحث.";
    }
  }
  function renderChapter(chapter, skipHistory = false) {
    activeChapter = chapter;
    if (!skipHistory) saveRoute("chapter", { bookId: activeBook.id, sectionId: activeSection.id, chapterId: chapter.id });
    const v = ensureView(), content = v.querySelector("#fiqhContent");
    v.querySelector("#fiqhHeading").textContent = tr(chapter.title);
    v.querySelector("#fiqhIntro").textContent = tr(activeBook.title) + " / " + tr(activeSection.title);
    content.replaceChildren();
    (chapter.topics || []).forEach(topic => content.appendChild(card(tr(topic.title), lang() === "es" ? "Ver asuntos" : "عرض المطالب", () => renderTopic(topic))));
    v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Seleccione un apartado." : "اختر المبحث.";
  }
  const renderWaterChapter = renderChapter;
  // إبراز النصوص الشرعية والمراجع على نمط الموسوعة الفقهية بالدرر السنية.
  function appendStyledEvidence(target, value) {
    const lines = String(value || "").split("\n");
    lines.forEach((line, index) => {
      if (index) target.appendChild(document.createElement("br"));
      const pattern = /(﴿[^﴿﴾]*﴾|»[^»«]*«|«[^«»]*»|(?:رواه|أخرجه|متفق عليه|أخرجهما|انظر|راجع|المصدر:)\s*[^،؛.]*|\[[^\]]{2,}\]|\(\([^()\n]{2,}\)\))/g;
      const matches = [...line.matchAll(pattern)];
      const hadithHasAttribution = /(?:رواه|أخرجه|متفق عليه)/.test(line);
      let last = 0;
      matches.forEach(match => {
        const token = match[0], pos = match.index;
        if (pos > last) target.appendChild(document.createTextNode(line.slice(last, pos)));
        const span = document.createElement("span");
        const before = line.slice(0, pos);
        const propheticContext = /(?:قال|عن|يروي|روى|سمعت|حدثنا|أخبرنا|فقال)\s*(?:رسول الله|النبي|الرسول)|(?:رسول الله|النبي)\s*(?:ﷺ|صلى الله عليه وسلم)|قال\s*ﷺ|قال\s*صلى الله عليه وسلم/.test(before);
        if (token.startsWith("﴿")) span.className = "fiqh-quran";
        else if (token.startsWith("»") || token.startsWith("«")) span.className = (propheticContext || hadithHasAttribution) && !/(?:قال|عن|ذكر|نقل)\s*(?:[اأإ]بو|ابن|الإمام|الشيخ)/.test(before.slice(-55)) ? "fiqh-hadith" : "fiqh-quote";
        else span.className = "fiqh-source";
        span.textContent = token;
        target.appendChild(span);
        last = pos + token.length;
      });
      if (last < line.length) target.appendChild(document.createTextNode(line.slice(last)));
    });
  }

  function renderTopic(topic, skipHistory = false) {
    activeTopic = topic; activeIssue = null;
    if (topic.issues && topic.issues.length) {
      if (!skipHistory) saveRoute("topic", { bookId: activeBook.id, sectionId: activeSection.id, chapterId: activeChapter && activeChapter.id, topicId: topic.id });
      const v = ensureView(), content = v.querySelector("#fiqhContent");
      v.querySelector("#fiqhHeading").textContent = tr(topic.title);
      v.querySelector("#fiqhIntro").textContent = tr(activeBook.title) + " / " + tr(activeSection.title);
      content.replaceChildren();
      topic.issues.forEach(issue => content.appendChild(card(tr(issue.title), lang() === "es" ? "Abrir contenido" : "فتح المحتوى", () => renderIssue(issue))));
      v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Cada asunto se abre en una página independiente." : "كل مطلب يفتح في صفحة مستقلة.";
      return;
    }
    if (!skipHistory) saveRoute("topic", { bookId: activeBook.id, sectionId: activeSection.id, chapterId: activeChapter && activeChapter.id, topicId: topic.id });
    const v = ensureView(), content = v.querySelector("#fiqhContent");
    v.querySelector("#fiqhHeading").textContent = tr(topic.title);
    v.querySelector("#fiqhIntro").textContent = tr(activeBook.title) + " / " + tr(activeSection.title);
    content.replaceChildren();
    const article = document.createElement("article");
    article.className = "rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-800 p-5 text-base leading-8 space-y-5";
    if (topic.id === "water-used" || topic.id === "water-mixed") {
      const isUsed = topic.id === "water-used";
      const items = isUsed ? [
        {
          ar: "المطلب الأول: الماء المستعمل في رفع الحدث",
          es: "Primer asunto: Agua usada para levantar el estado ritual",
          bodyAr: "الماء المستعمل في رفع الحدث هو الماء المنفصل عن أعضاء المتوضئ أو المغتسل بعد استعماله في وضوء أو غسل واجب. اختلف الفقهاء في حكمه: فالمشهور عند الحنفية والشافعية والحنابلة أنه طاهر في نفسه غير مطهِّر لغيره، وذهب المالكية، والظاهرية، وروايات وأقوال عند غيرهم إلى بقائه طهورًا. ومن أدلة القائلين ببقائه طهورًا عموم النصوص الدالة على طهورية الماء، وأن الأصل بقاء الطهورية ما لم يرد دليل ناقل.",
          bodyEs: "El agua usada para levantar el estado ritual es la que se desprende de los miembros después del wudu o del ghusl obligatorio. Los juristas discrepan: la opinión conocida en las escuelas hanafí, shafií y hanbalí es que es pura en sí misma, pero no purificadora para otros; los malikíes, los zahiríes y otras opiniones sostienen que conserva su capacidad purificadora. Entre sus argumentos está la generalidad de los textos sobre la pureza del agua y la continuidad de su estado original mientras no exista una prueba que lo cambie."
        },
        {
          ar: "المطلب الثاني: الماء المستعمل في طهارة مستحبة",
          es: "Segundo asunto: Agua usada en una purificación recomendada",
          bodyAr: "المقصود به الماء المستعمل في طهارة غير واجبة، كتجديد الوضوء. ذهب جمهور الفقهاء إلى أنه طهور يجوز التطهر به؛ لأن استعماله في عبادة مستحبة لا يخرجه عن اسم الماء ولا عن أصل طهوريته. واستدلوا بعموم أدلة طهارة الماء، وبأن البلل الباقي على أعضاء المتوضئ وقطراته على ثيابه محكوم بطهارتها.",
          bodyEs: "Se refiere al agua empleada en una purificación no obligatoria, como renovar el wudu. La mayoría de los juristas considera que sigue siendo purificadora y que puede volver a utilizarse, pues su uso en un acto recomendado no la saca de la categoría de agua ni altera su estado original. Se apoyan en los textos generales sobre la pureza del agua y en que la humedad que queda en el cuerpo y las gotas en la ropa se consideran puras."
        },
        {
          ar: "المطلب الثالث: الماء المستعمل في التبرد والنظافة",
          es: "Tercer asunto: Agua usada para refrescarse y limpiarse",
          bodyAr: "الماء المستعمل في التبرد والنظافة المعتادة طهور؛ لأنه لم يستعمل في رفع حدث ولا في إزالة نجاسة، وبقي على إطلاق اسم الماء. ونُقل الاتفاق على طهوريته في هذا الاستعمال؛ إذ لا موجب لنقله عن أصل الطهورية.",
          bodyEs: "El agua utilizada para refrescarse o para la limpieza ordinaria sigue siendo purificadora, porque no se ha empleado para levantar un estado ritual ni para eliminar una impureza y conserva el nombre de agua. Se ha transmitido el acuerdo sobre su capacidad purificadora en este uso, pues no hay motivo para apartarla de su estado original."
        },
        {
          ar: "المطلب الرابع: الماء المستعمل بغمس يد القائم من النوم",
          es: "Cuarto asunto: Agua en la que introduce la mano quien despierta",
          bodyAr: "غمس اليد في الإناء بعد الاستيقاظ من النوم قبل غسلها لا يجعل الماء نجسًا بمجرده إذا لم تعلم نجاسة اليد؛ فالأصل بقاء الماء على طهوريته، واليقين لا يزول بالشك. والنهي الوارد في غسل اليدين قبل إدخالهما الإناء يُعمل به، ولا يُحكم بنجاسة الماء لمجرد احتمال النجاسة.",
          bodyEs: "Introducir la mano en el recipiente al despertar, antes de lavarla, no convierte por sí solo el agua en impura si no se conoce ninguna impureza en la mano. El agua conserva su estado original y la certeza no desaparece por una mera duda. Debe observarse la instrucción profética de lavar las manos antes de introducirlas, pero no se declara impuro el agua por una simple sospecha."
        },
        {
          ar: "المطلب الخامس: الماء المستعمل في إزالة النجاسة",
          es: "Quinto asunto: Agua usada para eliminar una impureza",
          bodyAr: "الماء المنفصل عن محل النجاسة له أحوال: فإن تغير لونه أو طعمه أو ريحه بالنجاسة فهو نجس. وكذلك ما انفصل والنجاسة باقية أو قبل طهارة المحل على التفصيل المذكور عند الفقهاء. أما الماء المنفصل بعد زوال النجاسة من غير تغير، ففي حكمه خلاف؛ ومن الأقوال أنه طهور، وهو اختيار جماعة من أهل العلم، مع تفصيل في الغسلة التي يحصل بها التطهير.",
          bodyEs: "El agua que se separa del lugar de la impureza tiene varios casos: si cambia de color, sabor u olor por ella, es impura. También se considera impura, según los detalles expuestos por los juristas, la que se separa mientras la impureza permanece o antes de que el lugar quede purificado. Si se separa después de desaparecer la impureza y sin cambio perceptible, existe discrepancia; una opinión la considera purificadora, con detalles sobre el lavado final."
        },
        {
          ar: "المطلب السادس: حكم التطهر بفضل الرجل أو المرأة",
          es: "Sexto asunto: Purificación con el agua sobrante de un hombre o una mujer",
          bodyAr: "فضل الطهور هو ما بقي في الإناء بعد شرب الشخص أو استعماله للماء. والأصل أن الماء باقٍ على طهوريته ما لم تتغير أوصافه بنجاسة. أما استعمال الرجل أو المرأة لفضل الآخر في الطهارة ففيه تفصيل وخلاف بين الفقهاء، وتُجمع نصوص الباب بالنظر إلى أحوال الانفراد والاجتماع، وإلى دلالة النهي الوارد في بعض الصور مع الأحاديث الدالة على اغتسال النبي ﷺ وأزواجه من إناء واحد.",
          bodyEs: "El agua sobrante es la que queda en el recipiente después de que una persona bebe o la utiliza. En principio conserva su capacidad purificadora mientras sus características no cambien por una impureza. El uso por un hombre o una mujer del agua sobrante del otro presenta matices y discrepancias entre los juristas. Los textos se estudian atendiendo a las distintas situaciones y conciliando la prohibición transmitida en algunos casos con los relatos de que el Profeta ﷺ y sus esposas se bañaban del mismo recipiente."
        }
      ] : [
        {
          ar: "المطلب الأوَّل: الماءُ المُختلِط أو المتغَيِّر بنجاسةٍ",
          es: "Primer asunto: Agua mezclada o alterada por una impureza",
          bodyAr: "إذا لاقت الماءَ نجاسةٌ فغيّرت طعمه أو لونه أو رائحته، صار الماء نجسًا، قليلًا كان أو كثيرًا؛ وهذا محل اتفاق في الجملة. أما مجرد ملاقاة النجاسة من غير تغير، ففيه تفصيل وخلاف بين الفقهاء، وتُبحث أحكامه بحسب كمية الماء ونوعه وموضع وروده.",
          bodyEs: "Si una impureza entra en contacto con el agua y cambia su sabor, color u olor, el agua se considera impura, sea poca o mucha; esta es, en términos generales, una cuestión de acuerdo. El mero contacto sin cambio perceptible tiene detalles y discrepancias, según la cantidad y las circunstancias."
        },
        {
          ar: "المطلب الثَّاني: الماءُ المختَلِط بطاهرٍ",
          es: "Segundo asunto: Agua mezclada con una sustancia pura",
          bodyAr: "إذا خالط الماءَ شيءٌ طاهر، نُظر: فإن كان مما لا يمتزج بالماء ولا يتحلل فيه، كالدهن وقطع الكافور، بقي الماء طهورًا. وإن امتزج به، فالعبرة ببقاء اسم الماء المطلق وأوصافه؛ فإن بقي ماءً مطلقًا جاز التطهر به، وإن غلب عليه المخالط حتى صار شرابًا أو مرقًا، لم يعد ماءً مطلقًا.",
          bodyEs: "Cuando se mezcla el agua con una sustancia pura, se distingue entre lo que no se disuelve ni se integra en ella —como el aceite o trozos de alcanfor—, caso en el que el agua sigue siendo purificadora, y lo que sí se mezcla. Si conserva el nombre de agua absoluta, puede utilizarse para la purificación; si la sustancia añadida la transforma hasta convertirla en bebida o caldo, deja de ser agua absoluta."
        }
      ];
      const nav = document.createElement("div");
      nav.className = "grid grid-cols-1 gap-3";
      const showItem = (item) => {
        content.replaceChildren();
        const back = document.createElement("button");
        back.type = "button";
        back.className = "w-fit rounded-xl border border-emerald-300 dark:border-emerald-800 px-4 py-2 font-bold text-emerald-800 dark:text-emerald-200";
        back.textContent = lang() === "es" ? "Volver a los asuntos" : "العودة إلى المطالب";
        back.addEventListener("click", () => renderTopic(topic, true));
        const page = document.createElement("article");
        page.className = "rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-800 p-5 text-base leading-8 space-y-4";
        const heading = document.createElement("h3");
        heading.className = "font-extrabold text-emerald-800 dark:text-emerald-300 text-lg";
        heading.textContent = item[lang() === "es" ? "es" : "ar"];
        const paragraph = document.createElement("p");
        paragraph.className = "fiqh-article-text whitespace-pre-line text-slate-800 dark:text-slate-100";
        paragraph.textContent = item[lang() === "es" ? "bodyEs" : "bodyAr"];
        page.append(heading, paragraph);
        content.append(back, page);
        v.querySelector("#fiqhHeading").textContent = item[lang() === "es" ? "es" : "ar"];
        v.querySelector("#fiqhIntro").textContent = tr(activeBook.title) + " / " + tr(activeSection.title) + " / " + tr(topic.title);
        v.querySelector("#fiqhNotice").textContent = "";
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
      items.forEach(item => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-start font-bold text-slate-800 dark:text-slate-100 shadow-sm hover:border-emerald-500";
        btn.textContent = item[lang() === "es" ? "es" : "ar"];
        btn.addEventListener("click", () => showItem(item));
        nav.appendChild(btn);
      });
      article.appendChild(nav);
      content.appendChild(article);
      v.querySelector("#fiqhNotice").textContent = isUsed
        ? (lang() === "es" ? "Seleccione uno de los seis asuntos para abrir su contenido." : "اضغط على أحد المطالب الستة لفتح محتواه.")
        : (lang() === "es" ? "Seleccione uno de los dos asuntos para abrir su contenido." : "اضغط على أحد المطلبين لفتح محتواه.");
      return;
    }
    const sections = topic.content && (topic.content[lang()] || topic.content.ar || topic.content.es);
    if (Array.isArray(sections)) {
      sections.forEach(part => {
        if (part.heading && /^(المراجع(?: الفقهية)?|المصادر(?: الفقهية)?|أسئلة وأجوبة|أسئلة شائعة|Referencias(?: jurídicas)?|Fuentes(?: jurídicas)?|Preguntas y respuestas|Bibliografía)$/i.test(part.heading.trim())) return;
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
        appendStyledEvidence(paragraph, (part.text || "").replace(/https?:\/\/\S+|www\.\S+/gi, "").replace(/[ \\t]+([،؛,.])/g, "$1"));
        block.appendChild(paragraph);
        article.appendChild(block);
      });
    }
    content.appendChild(article);
    v.querySelector("#fiqhNotice").textContent = lang() === "es" ? "Contenido educativo resumido a partir de fuentes jurídicas; no sustituye una fatwa ni la consulta de especialistas." : "محتوى تعليمي محرر من مصادر فقهية، ولا يغني عن الفتوى أو سؤال أهل العلم.";
  }
  function renderIssue(issue, skipHistory = false) {
    activeIssue = issue;
    if (!skipHistory) saveRoute("issue", { bookId: activeBook.id, sectionId: activeSection.id, chapterId: activeChapter && activeChapter.id, topicId: activeTopic.id, issueId: issue.id });
    const v = ensureView(), content = v.querySelector("#fiqhContent");
    v.querySelector("#fiqhHeading").textContent = tr(issue.title);
    v.querySelector("#fiqhIntro").textContent = tr(activeBook.title) + " / " + tr(activeSection.title) + " / " + tr(activeTopic.title);
    content.replaceChildren();
    const article = document.createElement("article");
    article.className = "rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-800 p-5 text-base leading-8 space-y-5";
    const blocks = issue.content && (issue.content[lang()] || issue.content.ar || issue.content.es);
    if (Array.isArray(blocks)) {
      blocks.forEach(part => {
        const block = document.createElement("section"); block.className = "space-y-2";
        if (part.heading) { const h = document.createElement("h3"); h.className = "font-extrabold text-emerald-800 dark:text-emerald-300 text-lg"; h.textContent = part.heading; block.appendChild(h); }
        const p = document.createElement("p"); p.className = "fiqh-article-text whitespace-pre-line text-slate-800 dark:text-slate-100";
        appendStyledEvidence(p, part.text || ""); block.appendChild(p); article.appendChild(block);
      });
    } else {
      const p = document.createElement("p"); p.className = "text-slate-600 dark:text-slate-300";
      p.textContent = lang() === "es" ? "El contenido de este asunto se añadirá próximamente." : "سيُضاف محتوى هذا المطلب لاحقًا.";
      article.appendChild(p);
    }
    content.appendChild(article);
    v.querySelector("#fiqhNotice").textContent = "";
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