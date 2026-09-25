/* ============================================================
   Claude Lab — application engine (multi-course)
   Hub + per-course routing, per-course progress, badges, search,
   quizzes, checklists, confetti, and the Claude Code terminal sim.
   ============================================================ */
(function () {
  "use strict";

  var STORE_KEY = "claudelab.v2";
  var SITE = window.SITE, COURSES = window.COURSES, MD = window.MD, WIDGETS = window.WIDGETS;
  var byId = {};
  COURSES.forEach(function (c) { byId[c.id] = c; });
  var bodyCache = {};
  var currentCourseId = null;

  /* ---------- Store (with v1 → v2 migration) ---------- */
  function loadRaw(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  var store = loadRaw(STORE_KEY);
  if (!store) {
    store = { theme: null, courses: {} };
    var old = loadRaw("claudelab.v1");
    if (old) {
      store.theme = old.theme || null;
      store.courses.pm = { completed: old.completed || {}, checks: old.checks || {}, collapsed: old.collapsed || {} };
    }
  }
  store.courses = store.courses || {};
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {} }
  function cstate(id) {
    var s = store.courses[id] = store.courses[id] || {};
    s.completed = s.completed || {}; s.checks = s.checks || {}; s.collapsed = s.collapsed || {};
    s.ex = s.ex || {}; s.quiz = s.quiz || {};
    return s;
  }
  // One entry per day with any learning activity — powers the streak and the heatmap.
  function touch() { var a = store.activity = store.activity || {}, d = WIDGETS.srs.today(); a[d] = (a[d] || 0) + 1; }

  /* ---------- Helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function isRef(m) { return /reference/i.test(m.id); }

  function courseLessons(c) { var o = []; c.modules.forEach(function (m) { m.lessons.forEach(function (l) { o.push({ lesson: l, module: m }); }); }); return o; }
  function countable(c) { return courseLessons(c).filter(function (x) { return !isRef(x.module); }); }
  function lessonInfo(c, id) { var f = null; c.modules.forEach(function (m) { m.lessons.forEach(function (l) { if (l.id === id) f = { course: c, module: m, lesson: l }; }); }); return f; }
  function flatOrder(c) { return courseLessons(c).map(function (x) { return x.lesson.id; }); }
  function progressPct(c) { var s = cstate(c.id), arr = countable(c); var done = arr.filter(function (x) { return s.completed[x.lesson.id]; }).length; return { done: done, total: arr.length, pct: arr.length ? Math.round(done / arr.length * 100) : 0 }; }
  function moduleProgress(c, m) { var s = cstate(c.id); var done = m.lessons.filter(function (l) { return s.completed[l.id]; }).length; return { done: done, total: m.lessons.length, pct: m.lessons.length ? Math.round(done / m.lessons.length * 100) : 0 }; }
  function earnedBadges(c) {
    var s = cstate(c.id);
    return (c.badges || []).filter(function (b) {
      if (b.when.lesson) return !!s.completed[b.when.lesson];
      if (b.when.module) { var m = c.modules.filter(function (x) { return x.id === b.when.module; })[0]; return m && moduleProgress(c, m).pct === 100; }
      if (b.when.all) return progressPct(c).pct === 100;
      return false;
    });
  }
  function lessonHref(cid, lid) { return "#/" + cid + "/" + lid; }
  function courseHref(cid) { return "#/" + cid; }
  function fastPathHref(cid, pid) { return "#/" + cid + "/path/" + pid; }
  function fastPathMinutes(c, path) {
    return path.lessons.reduce(function (total, id) { var info = lessonInfo(c, id); return total + (info && info.lesson.minutes ? info.lesson.minutes : 0); }, 0);
  }
  function formatVerifiedDate(iso) {
    var p = String(iso || "").split("-");
    if (p.length !== 3) return iso;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return parseInt(p[2], 10) + " " + months[parseInt(p[1], 10) - 1] + " " + p[0];
  }
  function levelChip(level) {
    var map = { Beginner: "level-beginner", Core: "level-core", Advanced: "level-advanced", Reference: "level-core" };
    return '<span class="level-chip ' + (map[level] || "level-core") + '">' + level + "</span>";
  }

  /* ---------- Theme ---------- */
  function applyTheme(t) { document.documentElement.setAttribute("data-theme", t); store.theme = t; save(); }
  (function () { var t = store.theme || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); applyTheme(t); })();
  $("#themeBtn").addEventListener("click", function () { applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"); });
  if (SITE.repo) $("#githubLink").href = SITE.repo;

  /* ---------- Top progress ---------- */
  function refreshTopProgress(cid) {
    var wrap = $("#topbarProgress");
    if (!cid) { wrap.style.display = "none"; return; }
    wrap.style.display = "";
    var p = progressPct(byId[cid]);
    $("#topbarProgressFill").style.width = p.pct + "%";
    $("#topbarProgressLabel").textContent = p.pct + "%";
    wrap.setAttribute("aria-valuenow", String(p.pct));
  }

  /* ---------- Nav ---------- */
  function buildHubNav() {
    var nav = $("#nav"); nav.innerHTML = learnNav();
    var head = document.createElement("div"); head.className = "nav-course-head"; head.innerHTML = '<span class="nav-course-title">Courses</span>';
    nav.appendChild(head);
    COURSES.forEach(function (c) {
      var p = progressPct(c);
      var a = document.createElement("a"); a.className = "nav-courselink"; a.href = courseHref(c.id);
      a.innerHTML = '<span class="nav-group-emoji">' + c.emoji + '</span><span class="nav-title">' + c.title + '</span><span class="nav-group-meter">' + p.pct + "%</span>";
      nav.appendChild(a);
    });
  }

  function buildCourseNav(c, activeId) {
    var nav = $("#nav"); nav.innerHTML = learnNav();
    var back = document.createElement("a"); back.className = "nav-allcourses"; back.href = "#/"; back.innerHTML = "⌂ All courses";
    nav.appendChild(back);
    var head = document.createElement("a"); head.className = "nav-course-head nav-course-head-link"; head.href = courseHref(c.id);
    head.innerHTML = '<span class="nav-course-emoji">' + c.emoji + '</span><span class="nav-course-title">' + c.title + "</span>";
    nav.appendChild(head);

    c.modules.forEach(function (m) {
      var s = cstate(c.id);
      var mp = moduleProgress(c, m);
      var collapsed = !!s.collapsed[m.id];
      var group = document.createElement("div");
      group.className = "nav-group" + (collapsed ? " collapsed" : "");
      group.dataset.module = m.id;
      var btn = document.createElement("button");
      btn.className = "nav-group-btn";
      var ul = document.createElement("ul"); ul.className = "nav-lessons"; ul.id = "nav-" + c.id + "-" + m.id;
      btn.setAttribute("aria-expanded", String(!collapsed));
      btn.setAttribute("aria-controls", ul.id);
      btn.innerHTML =
        '<span class="nav-group-emoji">' + m.emoji + "</span>" +
        '<span class="nav-group-title">' + m.title + "</span>" +
        '<span class="nav-group-meter">' + mp.done + "/" + mp.total + "</span>" +
        '<span class="nav-group-chev"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></span>';
      btn.addEventListener("click", function () { group.classList.toggle("collapsed"); s.collapsed[m.id] = group.classList.contains("collapsed"); btn.setAttribute("aria-expanded", String(!s.collapsed[m.id])); save(); });
      group.appendChild(btn);
      m.lessons.forEach(function (l) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "nav-link" + (s.completed[l.id] ? " done" : "") + (l.id === activeId ? " active" : "");
        a.href = lessonHref(c.id, l.id); a.dataset.lesson = l.id;
        a.innerHTML = '<span class="nav-check">✓</span><span class="nav-title">' + l.title + "</span>" + (l.minutes ? '<span class="nav-min">' + l.minutes + "m</span>" : "");
        li.appendChild(a); ul.appendChild(li);
      });
      group.appendChild(ul);
      nav.appendChild(group);
    });
  }

  function setActiveNav(id) {
    $all(".nav-link").forEach(function (a) { a.classList.toggle("active", a.dataset.lesson === id); });
    var info = lessonInfo(byId[currentCourseId], id);
    if (info) { var g = $('.nav-group[data-module="' + info.module.id + '"]'); if (g && g.classList.contains("collapsed")) { g.classList.remove("collapsed"); var btn = $(".nav-group-btn", g); if (btn) btn.setAttribute("aria-expanded", "true"); cstate(currentCourseId).collapsed[info.module.id] = false; save(); } }
  }
  function refreshNavMeters(c) {
    c.modules.forEach(function (m) { var g = $('.nav-group[data-module="' + m.id + '"] .nav-group-meter'); if (g) { var mp = moduleProgress(c, m); g.textContent = mp.done + "/" + mp.total; } });
  }

  /* ---------- Hub ---------- */
  function isLab(l) { return /^(lab|capstone)\b/i.test(l.title); }
  function heroVisual() {
    return '<div class="hero-visual" aria-hidden="true"><div class="hv-orb hv-orb-1"></div><div class="hv-orb hv-orb-2"></div>' +
      '<div class="hv-card hv-brief"><div class="hv-bar"><i></i><i></i><i></i><span>brief.md</span><em>checker</em></div>' +
        '<p class="hv-line" style="--d:0"><b>B</b><span>I run RevOps; this pack is for our VP of Sales.</span></p>' +
        '<p class="hv-line" style="--d:1"><b>R</b><span>Produce <code>output/deal-review.xlsx</code> + a memo.</span></p>' +
        '<p class="hv-line" style="--d:2"><b>I</b><span>Use only <code>pipeline-q3.csv</code>. No web.</span></p>' +
        '<p class="hv-line" style="--d:3"><b>E</b><span>Never estimate a missing amount.</span></p>' +
        '<p class="hv-line" style="--d:4"><b>F</b><span>Flag every row you exclude, and why.</span></p>' +
        '<div class="hv-score"><span>5 / 5</span> signals present</div></div>' +
      '<div class="hv-card hv-term"><span class="p">$</span> npm test<span class="ok">✓ 42 passed</span></div>' +
      '<div class="hv-card hv-flash"><div class="hv-flip"><span class="f"><small>Question</small>What does <b>F</b> stand for?</span><span class="b"><small>Answer</small>Flag — surface it, don\'t decide it.</span></div></div>' +
      '<div class="hv-chip">🔥 3-day streak <b>+20 XP</b></div></div>';
  }
  function renderHub() {
    currentCourseId = null;
    refreshTopProgress(null);
    buildHubNav();
    document.title = SITE.title + " — Hands-on courses for Claude Cowork and Claude Code";
    var lessons = 0, labs = 0, minutes = 0;
    COURSES.forEach(function (c) { countable(c).forEach(function (x) { lessons++; if (isLab(x.lesson)) labs++; minutes += x.lesson.minutes || 0; }); });
    var html = '<section class="hub-hero"><div class="hub-hero-copy">';
    html += '<span class="hero-eyebrow">✦ Claude Lab 2.0 · Hands-on · Open source</span>';
    html += "<h1>Get genuinely good at <span class=\"grad\">Claude</span>.</h1>";
    html += '<p class="hero-sub">' + esc(SITE.tagline) + " Learn one idea, practise it in a lab, check yourself, and let the review deck make it stick. Everything saves in your browser — no account.</p>";
    html += '<div class="hero-cta"><a class="btn btn-primary" href="' + courseHref(COURSES[0].id) + '">' + COURSES[0].emoji + " Start with Cowork →</a>" + (COURSES[1] ? '<a class="btn btn-ghost" href="' + courseHref(COURSES[1].id) + '">' + COURSES[1].emoji + " I write code →</a>" : "") + "</div>";
    html += "</div>" + heroVisual() + "</section>";

    var last = store.last && byId[store.last.c] && lessonInfo(byId[store.last.c], store.last.l);
    var st = streaks(), due = dueCards().length, xp = totalXp();
    if (last || xp) {
      html += '<div class="today-row">';
      if (last) html += '<a class="resume-card" href="' + lessonHref(last.course.id, last.lesson.id) + '"><span class="resume-kicker">Continue where you left off</span><strong>' + esc(last.lesson.title) + "</strong><small>" + last.course.emoji + " " + esc(last.module.title) + '</small><span class="resume-go" aria-hidden="true">→</span></a>';
      html += '<a class="today-card" href="#/review"><b>' + due + "</b><span>" + (due === 1 ? "card" : "cards") + ' due</span></a>';
      html += '<a class="today-card" href="#/me"><b>' + st.current + '</b><span>day streak</span></a>';
      html += '<a class="today-card" href="#/me"><b>' + xp + "</b><span>XP · " + levelOf(xp).name + "</span></a></div>";
    }

    html += '<div class="stats-strip">' +
      '<div data-stat="lessons"><b>' + lessons + "</b><span>lessons</span></div>" +
      '<div data-stat="labs"><b>' + labs + "</b><span>hands-on labs</span></div>" +
      '<div data-stat="hours"><b>' + Math.round(minutes / 60) + "</b><span>hours of practice</span></div>" +
      '<div data-stat="tracks"><b>' + COURSES.length + "</b><span>tracks</span></div></div>";

    html += '<section class="daily-slot" id="dailySlot" aria-live="polite"></section>';
    html += '<h2 class="section-title">Choose your track</h2><p class="section-desc">Two hands-on courses. Start wherever fits you today — progress in each is saved separately.</p>';
    html += '<div class="course-grid">';
    COURSES.forEach(function (c) {
      var p = progressPct(c);
      var resume = countable(c).filter(function (x) { return !cstate(c.id).completed[x.lesson.id]; })[0];
      var startId = resume ? resume.lesson.id : c.modules[0].lessons[0].id;
      var cta = p.done === 0 ? "Start course" : (p.pct === 100 ? "Review" : "Resume");
      var cLabs = countable(c).filter(function (x) { return isLab(x.lesson); }).length;
      html += '<a class="course-card" href="' + lessonHref(c.id, startId) + '">';
      html += '<div class="course-card-top"><span class="course-emoji">' + c.emoji + "</span>";
      html += '<span class="course-ring" style="--p:' + p.pct + '"><span>' + p.pct + "%</span></span></div>";
      html += "<h2>" + c.title + "</h2>";
      html += '<p class="course-aud">' + esc(c.audience) + "</p>";
      html += '<p class="course-tag">' + esc(c.tagline) + "</p>";
      html += '<div class="course-meta"><span>' + countable(c).length + " lessons</span><span class=\"dot\">·</span><span>" + cLabs + " labs</span><span class=\"dot\">·</span><span>" + c.level + "</span></div>";
      html += '<span class="course-btn">' + cta + ' <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
      html += "</a>";
    });
    html += "</div>";

    html += '<h2 class="section-title">How Claude Lab teaches</h2><p class="section-desc">Reading about Claude does not make you good at it. Every module runs the same four-step loop.</p><div class="how-grid">';
    [["📖", "Learn", "Short lessons, one idea each, with the why — not just the clicks."],
     ["🛠️", "Practise", "Labs on your real work, a terminal simulator, scenarios, and find-the-flaw reviews."],
     ["✅", "Check", "Scored quizzes, ordering exercises, and checkers for your briefs and CLAUDE.md."],
     ["🔁", "Remember", "Flashcards return on a schedule; your notebook keeps every reflection."]].forEach(function (s, k) {
      html += '<div class="how-step"><span class="how-num">' + (k + 1) + '</span><span class="how-emoji">' + s[0] + "</span><h3>" + s[1] + "</h3><p>" + s[2] + "</p></div>";
    });
    html += "</div>";
    html += '<footer class="hub-foot"><span>Open source &amp; built to be remixed. <a href="' + SITE.repo + '" target="_blank" rel="noopener">Fork it on GitHub</a> to make an internal edition for your team.</span><span class="kbd-hint">Press <kbd>?</kbd> for shortcuts</span></footer>';
    $("#content").innerHTML = html;
    window.scrollTo(0, 0);
    fillDaily();
  }

  /* ---------- Daily 3: retrieval practice from finished lessons ---------- */
  function fillDaily() {
    var slot = $("#dailySlot"); if (!slot) return;
    var done = [];
    COURSES.forEach(function (c) { countable(c).forEach(function (x) { if (cstate(c.id).completed[x.lesson.id]) done.push({ c: c, lesson: x.lesson }); }); });
    if (!done.length) { slot.remove(); return; }
    Promise.all(done.map(function (d) { return fetchBody(d.lesson.file).then(function (md) { return { d: d, md: md }; }, function () { return null; }); })).then(function (list) {
      if (!slot.isConnected) return;
      var pool = [], re = /```quiz\s*\n([\s\S]*?)```/g;
      list.forEach(function (item) {
        if (!item) return;
        var m; re.lastIndex = 0;
        while ((m = re.exec(item.md))) m[1].split(/^(?=Q:)/m).forEach(function (block) { if (/^Q:/.test(block)) pool.push({ text: block.trim(), c: item.d.c, lesson: item.d.lesson }); });
      });
      if (!pool.length) { slot.remove(); return; }
      // same three questions all day: shuffle with a seed taken from today's date
      var day = WIDGETS.srs.today(), seed = parseInt(MD.hash(day), 36) % 2147483647 || 7;
      for (var k = pool.length - 1; k > 0; k--) { seed = (seed * 16807) % 2147483647; var j = seed % (k + 1), t = pool[k]; pool[k] = pool[j]; pool[j] = t; }
      var picked = pool.slice(0, 3), prev = (store.daily || {})[day];
      slot.innerHTML = '<div class="daily"><div class="daily-head"><span class="widget-kicker">🎯 Your daily ' + picked.length + '</span><span>Questions from lessons you have finished. Recalling an answer is what makes it stick. New questions tomorrow.</span></div>' +
        (prev ? '<p class="daily-done">Done today: ' + prev.c + " / " + prev.t + ". Try again if you like — your best score counts.</p>" : "") +
        MD.render("```quiz\n" + picked.map(function (p) { return p.text; }).join("\n\n") + "\n```") + "</div>";
      $all(".daily .quiz-q").forEach(function (q, i) {
        var p = picked[i], from = document.createElement("p");
        from.className = "quiz-from"; from.innerHTML = 'From <a href="' + lessonHref(p.c.id, p.lesson.id) + '">' + p.c.emoji + " " + esc(p.lesson.title) + "</a>";
        q.appendChild(from);
      });
    });
  }

  /* ---------- Weak spots: what to practise next ---------- */
  function weakSpots() {
    var quizzes = [], shaky = {};
    COURSES.forEach(function (c) {
      var s = cstate(c.id);
      Object.keys(s.quiz).forEach(function (k) {
        var q = s.quiz[k], lid = k.split(":")[0], info = lessonInfo(c, lid);
        if (info && q.c < q.t) quizzes.push({ ratio: q.c / q.t, href: lessonHref(c.id, lid), icon: "🧩", title: "Retry the quiz — " + info.lesson.title, detail: "Best score " + q.c + " / " + q.t + ". Reread the explanations first." });
      });
    });
    objVals(store.cards).forEach(function (card) { if (card.box === 1) { var key = card.c + "/" + card.l; shaky[key] = (shaky[key] || 0) + 1; } });
    var cards = Object.keys(shaky).map(function (key) {
      var bits = key.split("/"), c = byId[bits[0]], info = c && lessonInfo(c, bits[1]), n = shaky[key];
      return { href: "#/review", icon: "🃏", title: n + (n === 1 ? " shaky card" : " shaky cards") + " — " + (info ? info.lesson.title : bits[1]), detail: n === 1 ? "Still in box 1. Review it today and it starts to stick." : "Still in box 1. Review them today and they start to stick." };
    });
    quizzes.sort(function (a, b) { return a.ratio - b.ratio; });
    return quizzes.slice(0, 5).concat(cards.slice(0, 3));
  }

  /* ---------- Course home ---------- */
  function renderCourseHome(cid) {
    var c = byId[cid]; if (!c) { location.hash = "#/"; return; }
    currentCourseId = cid;
    refreshTopProgress(cid);
    buildCourseNav(c, null);
    document.title = c.title + " · " + SITE.title;
    var p = progressPct(c), s = cstate(cid);
    var resume = countable(c).filter(function (x) { return !s.completed[x.lesson.id]; })[0];
    var resumeId = resume ? resume.lesson.id : c.modules[0].lessons[0].id;
    var resumeLabel = p.done === 0 ? "Start the course" : (p.pct === 100 ? "Review from the top" : "Resume where you left off");
    var earned = earnedBadges(c);

    var html = "";
    html += '<div class="lesson-top"><a class="crumb" href="#/">All courses</a><span>›</span><span class="crumb">' + c.emoji + " " + c.title + "</span></div>";
    html += '<section class="hero">';
    html += '<span class="hero-eyebrow">' + c.emoji + " " + esc(c.audience) + "</span>";
    html += "<h1>" + c.title + "</h1>";
    html += '<p class="hero-sub">' + esc(c.tagline) + "</p>";
    html += '<div class="hero-cta">';
    html += '<a class="btn btn-primary" href="' + lessonHref(c.id, resumeId) + '">' + resumeLabel + ' <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></a>';
    html += '<a class="btn btn-ghost" href="#/">← All courses</a>';
    html += "</div></section>";

    html += '<div class="dash">';
    html += '<div class="ring" style="--p:' + p.pct + '"><span class="ring-label">' + p.pct + "%</span></div>";
    html += '<div class="dash-info"><h3>Your progress</h3><p>' + p.done + " of " + p.total + " lessons complete · " + courseXp(c) + " XP. " + (p.pct === 100 ? "You finished the whole course — 🏆" : "Work top-to-bottom, or jump around.") + "</p>";
    html += '<div class="badge-row">';
    (c.badges || []).forEach(function (b) { var has = earned.indexOf(b) !== -1; html += '<span class="badge ' + (has ? "earned" : "") + '">' + (has ? b.emoji : "🔒") + " " + b.label + "</span>"; });
    html += '</div><a class="cert-link" href="' + courseHref(cid) + '/certificate">' + (p.pct === 100 ? "🎓 Get your certificate →" : "🎓 Certificate unlocks at 100%") + "</a></div></div>";

    if (c.fastPaths && c.fastPaths.length) {
      html += '<h2 class="section-title">Choose your route</h2><p class="section-desc">Short on time? Pick the outcome closest to your job. Every route still counts toward the full course.</p>';
      html += '<details class="route-chooser"><summary>60-second route chooser</summary><div class="route-chooser-body">';
      html += '<p><strong>Choose “Essentials”</strong> if you are new or unsure. Otherwise, choose the role or outcome you need this week. You can switch routes at any time; progress is shared.</p>';
      html += '<p class="route-question"><strong>Quick check:</strong> Can you already explain the safety model, write a constrained brief, and verify an output? If not, start with Essentials.</p></div></details>';
      html += '<div class="fast-path-grid">';
      c.fastPaths.forEach(function (path) {
        var mins = fastPathMinutes(c, path), doneN = path.lessons.filter(function (id) { return s.completed[id]; }).length;
        html += '<a class="fast-path-card" href="' + fastPathHref(c.id, path.id) + '"><span class="fast-path-emoji">' + path.emoji + '</span><div><h3>' + esc(path.title) + '</h3><p>' + esc(path.desc) + '</p><span class="fast-path-meta">' + path.lessons.length + ' lessons · about ' + mins + ' min' + (doneN ? " · " + doneN + " done" : "") + '</span></div></a>';
      });
      html += "</div>";
    }

    var mods = c.modules.filter(function (m) { return !isRef(m); });
    var current = mods.filter(function (m) { return moduleProgress(c, m).pct < 100; })[0];
    html += '<h2 class="section-title">Your journey</h2><p class="section-desc">' + mods.length + " modules. Each ends with a knowledge check or a hands-on lab.</p>";
    html += '<ol class="journey">';
    mods.forEach(function (m, k) {
      var mp = moduleProgress(c, m), state = mp.pct === 100 ? "done" : m === current ? "current" : "todo";
      var target = m.lessons.filter(function (l) { return !s.completed[l.id]; })[0] || m.lessons[0];
      var mins = m.lessons.reduce(function (t, l) { return t + (l.minutes || 0); }, 0);
      html += '<li class="journey-node ' + state + '"><a href="' + lessonHref(c.id, target.id) + '">';
      html += '<span class="jn-dot">' + (state === "done" ? "✓" : k + 1) + "</span>";
      html += '<div class="jn-body"><div class="jn-top"><span class="jn-emoji">' + m.emoji + "</span><h3>" + m.title + '</h3><span class="jn-meta">' + mp.done + "/" + mp.total + " · " + mins + " min</span></div>";
      html += "<p>" + m.desc + "</p>";
      html += '<div class="mc-bar"><div style="width:' + mp.pct + '%"></div></div>' + (state === "current" ? '<span class="jn-here">You are here · next: ' + esc(target.title) + "</span>" : "") + "</div></a></li>";
    });
    html += "</ol>";

    var ref = c.modules.filter(function (m) { return isRef(m); })[0];
    if (ref) {
      html += '<h2 class="section-title">📚 Keep these handy</h2><div class="module-grid">';
      ref.lessons.forEach(function (l) { html += '<a class="module-card" href="' + lessonHref(c.id, l.id) + '"><h3>' + l.title + "</h3><p>" + l.summary + "</p></a>"; });
      html += "</div>";
    }
    $("#content").innerHTML = html;
    window.scrollTo(0, 0);
  }

  function renderFastPath(cid, pid) {
    var c = byId[cid]; if (!c) { location.hash = "#/"; return; }
    var path = (c.fastPaths || []).filter(function (x) { return x.id === pid; })[0];
    if (!path) { location.hash = courseHref(cid); return; }
    currentCourseId = cid;
    refreshTopProgress(cid);
    buildCourseNav(c, null);
    document.title = path.title + " · " + c.title;
    var s = cstate(cid);
    var firstOpen = path.lessons.filter(function (id) { return !s.completed[id]; })[0] || path.lessons[0];
    var html = '<div class="lesson-top"><a class="crumb" href="#/">All courses</a><span>›</span><a class="crumb" href="' + courseHref(c.id) + '">' + c.emoji + ' ' + c.title + '</a><span>›</span><span class="crumb">' + path.emoji + ' ' + esc(path.title) + '</span></div>';
    html += '<section class="path-hero"><span class="hero-eyebrow">' + path.emoji + ' Curated learning route</span><h1>' + esc(path.title) + '</h1><p class="hero-sub">' + esc(path.desc) + '</p><p class="path-audience"><strong>Best for:</strong> ' + esc(path.audience) + '</p><div class="hero-cta"><a class="btn btn-primary" href="' + lessonHref(cid, firstOpen) + '">' + (s.completed[firstOpen] ? 'Review route' : 'Start or resume') + ' →</a><a class="btn btn-ghost" href="' + courseHref(cid) + '">← Course home</a></div></section>';
    html += '<div class="path-summary"><strong>' + path.lessons.length + ' lessons</strong><span>·</span><strong>about ' + fastPathMinutes(c, path) + ' minutes</strong><span>·</span><span>complete in this order</span></div>';
    html += '<ol class="path-list">';
    path.lessons.forEach(function (id, index) {
      var info = lessonInfo(c, id); if (!info) return;
      var done = !!s.completed[id];
      html += '<li><a href="' + lessonHref(cid, id) + '"><span class="path-step">' + (done ? '✓' : index + 1) + '</span><span class="path-copy"><strong>' + esc(info.lesson.title) + '</strong><small>' + esc(info.module.title) + ' · ' + info.lesson.minutes + ' min</small></span><span class="path-arrow">→</span></a></li>';
    });
    html += '</ol>';
    $("#content").innerHTML = html;
    window.scrollTo(0, 0);
  }

  /* ---------- Learner stats: XP, levels, streaks ---------- */
  var LEVELS = [
    { xp: 0, name: "Curious" }, { xp: 120, name: "Apprentice" }, { xp: 300, name: "Practitioner" }, { xp: 600, name: "Operator" },
    { xp: 1000, name: "Builder" }, { xp: 1600, name: "Expert" }, { xp: 2400, name: "Mentor" }, { xp: 3400, name: "Architect" }
  ];
  function objVals(o) { return Object.keys(o || {}).map(function (k) { return o[k]; }); }
  // XP is derived from saved state, never accumulated, so it cannot drift or double-count.
  function courseXp(c) {
    var s = cstate(c.id), xp = 0;
    xp += Object.keys(s.completed).length * 20 + Object.keys(s.checks).length * 2 + Object.keys(s.ex).length * 15;
    objVals(s.quiz).forEach(function (q) { xp += q.c * 5; });
    objVals(store.cards).forEach(function (card) { if (card.c === c.id) xp += 2 + (card.box - 1) * 3; });
    objVals(store.notes).forEach(function (n) { if (n.c === c.id) xp += 10; });
    return xp;
  }
  function totalXp() { return COURSES.reduce(function (t, c) { return t + courseXp(c); }, 0) + objVals(store.daily).reduce(function (t, d) { return t + d.c * 5; }, 0); }
  function levelOf(xp) {
    var i = 0; LEVELS.forEach(function (l, k) { if (xp >= l.xp) i = k; });
    var next = LEVELS[i + 1];
    return { idx: i + 1, name: LEVELS[i].name, next: next, pct: next ? Math.round((xp - LEVELS[i].xp) / (next.xp - LEVELS[i].xp) * 100) : 100 };
  }
  function streaks() {
    var days = Object.keys(store.activity || {}).sort(), set = {}, srs = WIDGETS.srs;
    days.forEach(function (d) { set[d] = 1; });
    var best = 0, run = 0, prev = null;
    days.forEach(function (d) { run = prev && srs.addDays(prev, 1) === d ? run + 1 : 1; best = Math.max(best, run); prev = d; });
    var d = srs.today(); if (!set[d]) d = srs.addDays(d, -1);
    var current = 0; while (set[d]) { current++; d = srs.addDays(d, -1); }
    return { current: current, best: best, days: days.length };
  }
  function dueCards() { return objVals(store.cards).filter(function (c) { return WIDGETS.srs.isDue(c); }); }
  function download(name, type, text) {
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }
  function learnNav() {
    var due = dueCards().length;
    return '<div class="nav-learn">' +
      '<a href="#/review" title="Review deck"><span aria-hidden="true">🔁</span><span class="nav-title">Review</span>' + (due ? '<span class="nav-count">' + due + "</span>" : "") + "</a>" +
      '<a href="#/notebook" title="Notebook"><span aria-hidden="true">📓</span><span class="nav-title">Notebook</span></a>' +
      '<a href="#/me" title="My progress"><span aria-hidden="true">📈</span><span class="nav-title">Progress</span></a></div>';
  }
  function pageShell(title) { currentCourseId = null; refreshTopProgress(null); buildHubNav(); document.title = title + " · " + SITE.title; window.scrollTo(0, 0); }
  function crumbs(label) { return '<div class="lesson-top"><a class="crumb" href="#/">All courses</a><span>›</span><span class="crumb">' + label + "</span></div>"; }
  function lessonLink(cid, lid) { var c = byId[cid], info = c && lessonInfo(c, lid); return info ? '<a href="' + lessonHref(cid, lid) + '">' + c.emoji + " " + esc(info.lesson.title) + "</a>" : esc(lid); }

  /* ---------- Review deck ---------- */
  function renderReview() {
    pageShell("Review deck");
    var all = objVals(store.cards);
    var due = Object.keys(store.cards || {}).filter(function (id) { return WIDGETS.srs.isDue(store.cards[id]); }).map(function (id) { var c = store.cards[id]; return { id: id, f: c.f, b: c.b, c: c.c, l: c.l, box: c.box, due: c.due }; })
      .sort(function (a, b) { return a.box - b.box || (a.due || "").localeCompare(b.due || ""); });
    var boxes = [1, 2, 3, 4, 5].map(function (b) { return all.filter(function (c) { return c.box === b; }).length; });
    var html = crumbs("🔁 Review deck");
    html += '<section class="page-hero"><span class="hero-eyebrow">🔁 Spaced repetition</span><h1>Review deck</h1><p class="hero-sub">Every flashcard you meet in a lesson lands here and comes back just before you would forget it. Five minutes a day keeps each framework within reach.</p></section>';
    html += '<div class="review-stats"><div class="review-due"><b>' + due.length + '</b><span>due today</span></div><div><b>' + all.length + '</b><span>cards in your deck</span></div><div><b>' + boxes[4] + '</b><span>mastered</span></div></div>';
    html += '<div class="box-bar" aria-label="Cards by box">' + boxes.map(function (n, k) {
      return '<div class="box-col"><div class="box-fill" style="--h:' + (all.length ? Math.round(n / all.length * 100) : 0) + '%"></div><b>' + n + "</b><small>Box " + (k + 1) + " · " + (WIDGETS.srs.INTERVALS[k + 1] ? "every " + WIDGETS.srs.INTERVALS[k + 1] + "d" : "daily") + "</small></div>";
    }).join("") + "</div>";
    if (due.length) html += '<div class="flash review-deck"><div class="flash-head"><span class="flash-kicker">Today\'s review</span><span class="flash-count"></span></div><div class="flash-stage"></div></div>';
    else {
      var next = all.map(function (c) { return c.due; }).filter(Boolean).sort()[0];
      html += '<div class="empty-state"><span class="empty-emoji">🌿</span><h3>' + (all.length ? "All caught up." : "Your deck is empty.") + "</h3><p>" +
        (all.length ? "Nothing is due today. The next card comes back on " + formatVerifiedDate(next) + "." : 'Flashcards join your deck when you grade them in a lesson. Start with ' + lessonLink("cowork", "the-brief") + ".") + "</p></div>";
    }
    $("#content").innerHTML = html;
    var deckEl = $(".review-deck");
    if (deckEl) WIDGETS.deck(deckEl, due, {
      lookup: function (id) { return store.cards[id]; },
      onGrade: function (card, r) { WIDGETS.saveCard({ store: store, save: save, touch: touch }, card, r); },
      doneHtml: function (n) { buildHubNav(); return "<strong>Review done — " + n + (n === 1 ? " card" : " cards") + ".</strong> Each one is rescheduled. The ones you knew come back later; the ones you missed come back sooner."; }
    });
  }

  /* ---------- Notebook ---------- */
  function renderNotebook() {
    pageShell("Notebook");
    var notes = Object.keys(store.notes || {}).map(function (k) { return store.notes[k]; }).sort(function (a, b) { return b.t - a.t; });
    var html = crumbs("📓 Notebook");
    html += '<section class="page-hero"><span class="hero-eyebrow">📓 Your reflections</span><h1>Notebook</h1><p class="hero-sub">Everything you wrote in a Reflect box, in one place. Export it as Markdown to keep it, share it with your manager, or paste it into your own notes.</p>';
    html += '<div class="hero-cta"><button class="btn btn-primary" id="notebookExport" type="button"' + (notes.length ? "" : " disabled") + '>Export as Markdown</button></div></section>';
    if (!notes.length) html += '<div class="empty-state"><span class="empty-emoji">🪞</span><h3>No reflections yet.</h3><p>Reflect boxes sit at the end of labs. Your first one is in ' + lessonLink("cowork", "lab-first-run") + ".</p></div>";
    html += '<div class="note-list">' + notes.map(function (n) {
      return '<article class="note-card"><div class="note-meta">' + lessonLink(n.c, n.l) + "<span>" + new Date(n.t).toLocaleDateString() + '</span></div><p class="note-q">' + esc(n.q) + '</p><div class="note-a">' + esc(n.a).replace(/\n/g, "<br>") + "</div></article>";
    }).join("") + "</div>";
    $("#content").innerHTML = html;
    var btn = $("#notebookExport");
    if (btn) btn.addEventListener("click", function () {
      var md = "# My Claude Lab notebook\n\nExported " + new Date().toLocaleDateString() + "\n";
      notes.forEach(function (n) { var info = byId[n.c] && lessonInfo(byId[n.c], n.l); md += "\n## " + (info ? info.lesson.title : n.l) + "\n\n**" + n.q + "**\n\n" + n.a.trim() + "\n"; });
      download("claude-lab-notebook.md", "text/markdown", md);
    });
  }

  /* ---------- My progress ---------- */
  function heatmap() {
    var srs = WIDGETS.srs, end = srs.today(), cells = "";
    for (var k = 111; k >= 0; k--) {
      var d = srs.addDays(end, -k), n = (store.activity || {})[d] || 0;
      var lv = n === 0 ? "" : n === 1 ? " l1" : n <= 3 ? " l2" : n <= 6 ? " l3" : " l4";
      cells += '<i class="heat-cell' + lv + '" title="' + formatVerifiedDate(d) + " · " + n + (n === 1 ? " action" : " actions") + '"></i>';
    }
    return '<div class="heat-wrap"><div class="heat" role="img" aria-label="Activity over the last 16 weeks">' + cells + '</div><div class="heat-legend" aria-hidden="true">Less <i class="heat-cell"></i><i class="heat-cell l1"></i><i class="heat-cell l2"></i><i class="heat-cell l3"></i><i class="heat-cell l4"></i> More</div></div>';
  }
  function renderMe() {
    pageShell("My progress");
    var xp = totalXp(), lv = levelOf(xp), st = streaks(), cards = objVals(store.cards);
    var q = { c: 0, t: 0 }, ex = 0, lessons = 0;
    COURSES.forEach(function (c) { var s = cstate(c.id); objVals(s.quiz).forEach(function (r) { q.c += r.c; q.t += r.t; }); ex += Object.keys(s.ex).length; lessons += progressPct(c).done; });
    var html = crumbs("📈 My progress");
    html += '<section class="page-hero level-hero"><span class="hero-eyebrow">📈 Level ' + lv.idx + "</span><h1>" + lv.name + "</h1>";
    html += '<div class="xp-bar"><div class="xp-fill" style="width:' + lv.pct + '%"></div></div><p class="xp-note">' + xp + " XP" + (lv.next ? " · " + (lv.next.xp - xp) + " XP to " + lv.next.name : " · top level reached") + "</p></section>";
    html += '<div class="stat-grid">' +
      '<div class="stat stat-xp"><span class="stat-num">' + xp + '</span><span class="stat-lbl">XP earned</span></div>' +
      '<div class="stat stat-streak"><span class="stat-num">' + st.current + '</span><span class="stat-lbl">day streak · best ' + st.best + "</span></div>" +
      '<div class="stat"><span class="stat-num">' + lessons + '</span><span class="stat-lbl">lessons complete</span></div>' +
      '<div class="stat"><span class="stat-num">' + (q.t ? Math.round(q.c / q.t * 100) + "%" : "—") + '</span><span class="stat-lbl">quiz accuracy</span></div>' +
      '<div class="stat"><span class="stat-num">' + ex + '</span><span class="stat-lbl">exercises solved</span></div>' +
      '<div class="stat"><span class="stat-num">' + cards.length + '</span><span class="stat-lbl">cards in deck</span></div></div>';
    var weak = weakSpots();
    html += '<h2 class="section-title">Practise next</h2><p class="section-desc">Built from your quiz scores and your flashcard boxes — the fastest way to turn "I read it" into "I know it".</p>';
    html += weak.length ? '<div class="weak-list">' + weak.map(function (w) { return '<a class="weak-item" href="' + w.href + '"><span class="weak-icon" aria-hidden="true">' + w.icon + '</span><span><strong>' + esc(w.title) + "</strong><small>" + esc(w.detail) + '</small></span><span class="weak-go" aria-hidden="true">→</span></a>'; }).join("") + "</div>"
      : '<div class="empty-state weak-empty"><span class="empty-emoji">💪</span><h3>No weak spots yet.</h3><p>Missed quiz questions and cards you grade "Again" show up here, so you know exactly what to practise.</p></div>';
    html += '<h2 class="section-title">Last 16 weeks</h2><p class="section-desc">Each square is a day. Any lesson, checklist, quiz, card or reflection counts.</p>' + heatmap();
    html += '<p class="xp-rules">XP: 20 per lesson · 15 per exercise solved · 10 per reflection · 5 per quiz answer right (daily 3 included) · 2–14 per flashcard as it climbs the boxes · 2 per checklist item.</p>';
    html += '<h2 class="section-title">Courses</h2><div class="course-stats">';
    COURSES.forEach(function (c) {
      var p = progressPct(c), earned = earnedBadges(c);
      html += '<a class="course-stat" href="' + courseHref(c.id) + '"><span class="course-ring" style="--p:' + p.pct + '"><span>' + p.pct + '%</span></span><div><h3>' + c.emoji + " " + esc(c.title) + "</h3><p>" + p.done + " of " + p.total + " lessons · " + courseXp(c) + " XP · " + earned.length + " of " + c.badges.length + ' badges</p><p class="badge-line">' + earned.map(function (b) { return b.emoji; }).join(" ") + "</p></div></a>";
    });
    html += "</div>";
    html += '<h2 class="section-title">Your data</h2><p class="section-desc">Progress lives only in this browser. Export it to move to another device or keep a backup.</p>';
    html += '<div class="data-actions"><button class="btn btn-ghost" id="progressExport" type="button">⬇ Export progress</button><label class="btn btn-ghost file-btn">⬆ Import progress<input type="file" id="progressImport" accept="application/json,.json"></label></div>';
    $("#content").innerHTML = html;
    $("#progressExport").addEventListener("click", function () { download("claude-lab-progress.json", "application/json", JSON.stringify(store, null, 2)); });
    $("#progressImport").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0]; if (!file) return;
      file.text().then(function (text) {
        var data = JSON.parse(text);
        if (!data || typeof data !== "object" || typeof data.courses !== "object") throw new Error("not a progress export");
        store = data; store.courses = store.courses || {}; save(); renderMe(); toast("✓ Progress imported");
      }).catch(function (err) { toast("⚠️ Import failed: that file is not a Claude Lab progress export (" + err.message + ")"); });
    });
  }

  /* ---------- Certificate ---------- */
  function renderCertificate(cid) {
    var c = byId[cid]; if (!c) { location.hash = "#/"; return; }
    currentCourseId = cid; refreshTopProgress(cid); buildCourseNav(c, null);
    document.title = "Certificate · " + c.title; window.scrollTo(0, 0);
    var p = progressPct(c), s = cstate(cid);
    var html = '<div class="lesson-top no-print"><a class="crumb" href="#/">All courses</a><span>›</span><a class="crumb" href="' + courseHref(cid) + '">' + c.emoji + " " + esc(c.title) + '</a><span>›</span><span class="crumb">Certificate</span></div>';
    if (p.pct < 100) {
      var next = countable(c).filter(function (x) { return !s.completed[x.lesson.id]; })[0];
      html += '<div class="cert-locked"><span class="empty-emoji">🔒</span><h2>Your certificate unlocks at 100%</h2><p>' + p.done + " of " + p.total + " lessons complete — " + (p.total - p.done) + ' to go.</p><div class="xp-bar"><div class="xp-fill" style="width:' + p.pct + '%"></div></div>' +
        (next ? '<a class="btn btn-primary" href="' + lessonHref(cid, next.lesson.id) + '">Continue: ' + esc(next.lesson.title) + " →</a>" : "") + "</div>";
      $("#content").innerHTML = html; return;
    }
    var name = store.name || "";
    html += '<div class="cert-controls no-print"><label for="certName">Name on the certificate</label><input id="certName" type="text" autocomplete="name" placeholder="Your name" value="' + esc(name).replace(/"/g, "&quot;") + '"><button class="btn btn-primary" id="certPrint" type="button">🖨 Print or save as PDF</button></div>';
    html += '<div class="cert"><div class="cert-inner"><span class="cert-mark">✦</span><p class="cert-kicker">Certificate of completion</p><p class="cert-small">This certifies that</p><p class="cert-name">' + (esc(name) || "Your name") + '</p><p class="cert-small">completed every lesson and lab of</p><h2 class="cert-course">' + esc(c.title) + '</h2>' +
      '<p class="cert-detail">' + p.total + " lessons · " + c.modules.filter(function (m) { return !isRef(m); }).length + " modules · " + earnedBadges(c).map(function (b) { return b.emoji; }).join(" ") + '</p><div class="cert-foot"><span>' + formatVerifiedDate(s.doneAt || WIDGETS.srs.today()) + '</span><span class="cert-sign">Claude Lab</span></div>' +
      '<p class="cert-fine">Self-issued from progress saved in the learner\'s browser. Claude Lab is a community project, not affiliated with Anthropic.</p></div></div>';
    $("#content").innerHTML = html;
    $("#certName").addEventListener("input", function (e) { store.name = e.target.value.trim(); save(); $(".cert-name").textContent = store.name || "Your name"; });
    $("#certPrint").addEventListener("click", function () { window.print(); });
  }

  /* ---------- Lesson ---------- */
  function fetchBody(file) {
    if (bodyCache[file]) return Promise.resolve(bodyCache[file]);
    return fetch("content/" + file, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); }).then(function (t) { bodyCache[file] = t; return t; });
  }

  function renderLesson(cid, id, section) {
    var c = byId[cid]; if (!c) { location.hash = "#/"; return; }
    var info = lessonInfo(c, id); if (!info) { location.hash = courseHref(cid); return; }
    currentCourseId = cid;
    var l = info.lesson, m = info.module;
    var order = flatOrder(c), pos = order.indexOf(id);
    var prevId = pos > 0 ? order[pos - 1] : null;
    var nextId = pos < order.length - 1 ? order[pos + 1] : null;

    $("#content").innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading lesson…</p></div>';
    window.scrollTo(0, 0);
    buildCourseNav(c, id);
    refreshTopProgress(cid);
    document.title = l.title + " · " + c.title;

    fetchBody(l.file).then(function (md) {
      var bodyHtml = MD.render(md, { lessonId: id });
      var s = cstate(cid);
      var html = "";
      html += '<div class="lesson-top">';
      html += '<a class="crumb" href="#/">All courses</a><span>›</span>';
      html += '<a class="crumb" href="' + courseHref(c.id) + '">' + c.emoji + " " + c.title + "</a><span>›</span>";
      html += '<span class="crumb">' + m.emoji + " " + m.title + "</span><span style=\"flex:1\"></span>";
      var freshness = c.freshness && c.freshness[id];
      if (freshness) html += '<a class="freshness" href="' + freshness.sourceUrl + '" target="_blank" rel="noopener">Verified ' + formatVerifiedDate(freshness.verifiedDate) + ' · ' + esc(freshness.sourceLabel) + '</a>';
      html += '<span class="lesson-meta">' + levelChip(l.level) + (l.minutes ? "<span>· " + l.minutes + " min</span>" : "") + "</span>";
      html += "</div>";
      var modIdx = c.modules.indexOf(m) + 1, lessonIdx = m.lessons.indexOf(l) + 1;
      html += '<div class="lesson-pos">' + (isRef(m) ? "Reference" : "Module " + modIdx) + " · Lesson " + lessonIdx + " of " + m.lessons.length + '<span class="lesson-pos-dots" aria-hidden="true">' +
        m.lessons.map(function (x) { return '<i class="' + (x.id === id ? "now" : s.completed[x.id] ? "done" : "") + '"></i>'; }).join("") + "</span></div>";
      html += '<div class="lesson-grid"><div class="lesson-main">';
      html += '<article class="lesson">' + bodyHtml + "</article>";

      html += '<div class="lesson-foot">';
      if (!isRef(m)) {
        var done = !!s.completed[id];
        html += '<div class="complete-row"><button class="complete-btn' + (done ? " done" : "") + '" id="completeBtn">' + (done ? "✓ Completed — nice!" : "Mark this lesson complete") + "</button>";
        html += '<span class="complete-hint">' + (done ? "You can revisit any time." : "Finish the activities above, then mark it done to track progress.") + "</span></div>";
      }
      html += '<div class="pager">';
      if (prevId) { var pi = lessonInfo(c, prevId); html += '<a href="' + lessonHref(c.id, prevId) + '"><span class="dir">← Previous</span><span class="ptitle">' + pi.lesson.title + "</span></a>"; }
      else { html += '<a href="' + courseHref(c.id) + '"><span class="dir">← Back</span><span class="ptitle">Course home</span></a>'; }
      if (nextId) { var ni = lessonInfo(c, nextId); html += '<a class="next" href="' + lessonHref(c.id, nextId) + '"><span class="dir">Next →</span><span class="ptitle">' + ni.lesson.title + "</span></a>"; }
      else { html += '<a class="next" href="' + courseHref(c.id) + '"><span class="dir">Done →</span><span class="ptitle">Course home</span></a>'; }
      html += "</div></div>";
      html += '</div><aside class="toc-rail"></aside></div>';

      $("#content").innerHTML = html;
      $("#content").classList.add("with-toc");
      setActiveNav(id);
      wireLesson(cid, id);
      buildToc(cid, id);
      linkTerms(c, id);
      store.last = { c: cid, l: id, t: Date.now() }; save();
      if (section) { var target = document.getElementById(section); if (target) target.scrollIntoView(); }
      updateReadProgress();
      var cb = $("#completeBtn"); if (cb) cb.addEventListener("click", function () { toggleComplete(cid, id); });
    }).catch(function (err) { $("#content").innerHTML = errorHtml(l.file, err); });
  }

  /* ---------- Glossary terms: first mention in a lesson opens its definition ---------- */
  var TERM_SKIP = /^(cowork|brief|deliverable|the plan|project|decay|the drift|claude\.ai|claude desktop|claude code|claude for excel|web and mobile|observed)/i;
  var glossaryCache = {};
  function loadGlossary(c) {
    var info = c.glossary && lessonInfo(c, c.glossary);
    if (!info) return Promise.resolve([]);
    if (glossaryCache[c.id]) return Promise.resolve(glossaryCache[c.id]);
    return fetchBody(info.lesson.file).then(function (md) {
      var terms = [];
      md.replace(/^\*\*(.+?)\*\*\s+—\s+(.+)$/gm, function (m, name, def) {
        if (TERM_SKIP.test(name)) return m;
        var aliases = [], paren = name.match(/^(.+?)\s*\((.+)\)$/);
        if (paren) aliases.push(paren[1].trim(), paren[2].trim()); else aliases.push(name.replace(/^The\s+/, ""));
        def = def.trim(); terms.push({ name: name, def: def.charAt(0).toUpperCase() + def.slice(1), aliases: aliases });
        return m;
      });
      return (glossaryCache[c.id] = terms);
    }).catch(function () { return []; });
  }
  // "Skill" and "Effort" are also ordinary English words ("the skill of briefing"), so they must keep their capital.
  var TERM_EXACT_CASE = /^(Skill|Effort)$/;
  function aliasRe(a) {
    var body = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // any case, plus a plural ("connectors", "worktrees") for terms ending in a letter
    return new RegExp("(^|[^\\w-])(" + body + (/[a-z]$/i.test(a) ? "(?:e?s)?" : "") + ")(?![\\w-])", TERM_EXACT_CASE.test(a) ? "" : "i");
  }
  function linkTerms(c, id) {
    if (!c.glossary || id === c.glossary) return;
    loadGlossary(c).then(function (terms) {
      var article = $("article.lesson"); if (!article || !terms.length || currentCourseId !== c.id) return;
      var skip = "h1,h2,h3,h4,code,pre,a,button,textarea,label,.quiz,.flash,.scenario,.order,.spot,.lint,.reflect,.ccsim,.prompt-card,.codeblock,.callout-title,.lab-head";
      var linked = 0;
      terms.slice().sort(function (a, b) { return b.aliases[0].length - a.aliases[0].length; }).forEach(function (t) {
        if (linked >= 12) return;
        var walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return n.parentElement.closest(skip) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
        var node, done = false;
        while (!done && (node = walker.nextNode())) {
          t.aliases.some(function (a) {
            var m = aliasRe(a).exec(node.nodeValue); if (!m) return false;
            var start = m.index + m[1].length, range = document.createRange();
            range.setStart(node, start); range.setEnd(node, start + m[2].length);
            var btn = document.createElement("button");
            btn.type = "button"; btn.className = "term"; btn.dataset.term = t.name; btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "termPop");
            range.surroundContents(btn);
            linked++; done = true; return true;
          });
        }
      });
      article.dataset.terms = String(linked);
    });
  }
  function termPop() {
    var pop = $("#termPop");
    if (!pop) { pop = document.createElement("div"); pop.id = "termPop"; pop.className = "term-pop"; pop.setAttribute("role", "dialog"); pop.hidden = true; document.body.appendChild(pop); }
    return pop;
  }
  var openTerm = null;
  function closeTerm() { var pop = $("#termPop"); if (pop) pop.hidden = true; if (openTerm) { openTerm.setAttribute("aria-expanded", "false"); openTerm = null; } }
  function showTerm(btn) {
    var c = byId[currentCourseId]; if (!c) return;
    var t = (glossaryCache[c.id] || []).filter(function (x) { return x.name === btn.dataset.term; })[0]; if (!t) return;
    if (openTerm === btn) { closeTerm(); return; }
    closeTerm();
    var pop = termPop(), cardId = "glossary:" + MD.hash(c.id + ":" + t.name), has = !!(store.cards || {})[cardId];
    pop.setAttribute("aria-label", t.name);
    pop.innerHTML = '<p class="term-name">' + MD.parseInline(t.name) + '</p><p class="term-def">' + MD.parseInline(t.def) + '</p><div class="term-actions"><button class="term-add btn-sm" type="button"' + (has ? " disabled" : "") + ">" + (has ? "✓ In your review deck" : "＋ Add to review deck") + '</button><a href="' + lessonHref(c.id, c.glossary) + '">Full glossary →</a></div>';
    pop.hidden = false; openTerm = btn; btn.setAttribute("aria-expanded", "true");
    var r = btn.getBoundingClientRect(), w = Math.min(340, window.innerWidth - 24);
    pop.style.width = w + "px";
    pop.style.left = Math.max(12, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - w - 12)) + "px";
    pop.style.top = (r.bottom + window.scrollY + 8) + "px";
    $(".term-add", pop).addEventListener("click", function (e) {
      WIDGETS.saveCard({ store: store, save: save, touch: touch, course: c.id, lesson: c.glossary }, { id: cardId, f: MD.parseInline(t.name), b: MD.parseInline(t.def), c: c.id, l: c.glossary }, "good");
      e.target.disabled = true; e.target.textContent = "✓ In your review deck"; buildHubNavIfNeeded(); toast("🃏 " + t.name + " added to your review deck");
    });
  }
  function buildHubNavIfNeeded() { var c = byId[currentCourseId]; if (c) { var active = $(".nav-link.active"); buildCourseNav(c, active ? active.dataset.lesson : null); } }
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".term"); if (t) { showTerm(t); return; }
    if (openTerm && !e.target.closest("#termPop")) closeTerm();
  });

  /* ---------- On this page + reading progress ---------- */
  var tocObserver = null;
  function buildToc(cid, id) {
    if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
    var rail = $(".toc-rail"), heads = $all("article.lesson h2");
    if (!rail || heads.length < 2) return;
    var kit = [[".quiz-q", "🧩", "quiz question"], [".flash", "🃏", "flashcard deck"], [".lab-box", "🧪", "lab"], [".ccsim", "⌨️", "simulation"], ["[data-scn]", "🧭", "scenario"], [".order, .spot, .lint", "🎯", "exercise"], [".reflect", "🪞", "reflection"]]
      .map(function (k) { var n = $all(k[0], $("article.lesson")).length; return n ? '<li><span aria-hidden="true">' + k[1] + "</span>" + n + " " + k[2] + (n === 1 ? "" : "s") + "</li>" : ""; }).join("");
    rail.innerHTML = '<nav class="toc" aria-label="On this page"><p class="toc-title">On this page</p><ol>' +
      heads.map(function (h) { return '<li><a href="' + lessonHref(cid, id) + '" data-target="' + h.id + '">' + esc(h.textContent) + "</a></li>"; }).join("") + "</ol>" +
      (kit ? '<p class="toc-title">In this lesson</p><ul class="toc-kit">' + kit + "</ul>" : "") + "</nav>";
    $all(".toc a", rail).forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); var t = document.getElementById(a.dataset.target); if (t) t.scrollIntoView({ behavior: "smooth" }); });
    });
    if (!("IntersectionObserver" in window)) return;
    tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $all(".toc a", rail).forEach(function (a) { a.classList.toggle("active", a.dataset.target === en.target.id); });
      });
    }, { rootMargin: "-10% 0px -75% 0px" });
    heads.forEach(function (h) { tocObserver.observe(h); });
  }
  var readTick = false;
  function updateReadProgress() {
    var bar = $("#readProgress"); if (!bar) return;
    var onLesson = !!$("article.lesson");
    bar.hidden = !onLesson;
    if (!onLesson) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, Math.round(window.scrollY / max * 100)) : 100;
    bar.firstElementChild.style.width = pct + "%";
    bar.setAttribute("aria-valuenow", String(pct));
  }
  window.addEventListener("scroll", function () { if (readTick) return; readTick = true; requestAnimationFrame(function () { readTick = false; updateReadProgress(); }); }, { passive: true });

  function errorHtml(file, err) {
    var isFile = location.protocol === "file:";
    return '<div class="error-box"><h3>⚠️ Couldn\'t load this lesson</h3>' +
      (isFile
        ? '<p>You opened the files directly from disk. Browsers block loading lesson files that way.</p><p><strong>Run a tiny local server:</strong></p><div class="codeblock"><div class="codeblock-head"><span class="codeblock-lang">terminal</span></div><pre><code>python3 -m http.server 8080\n# then open http://localhost:8080</code></pre></div>'
        : "<p>Tried <code>content/" + file + "</code> → <code>" + (err && err.message ? err.message : err) + "</code>.</p>") + "</div>";
  }

  function toggleComplete(cid, id) {
    var c = byId[cid], s = cstate(cid);
    var was = !!s.completed[id];
    var prev = earnedBadges(c).map(function (b) { return b.id; });
    if (was) delete s.completed[id]; else { s.completed[id] = true; touch(); }
    if (!was && progressPct(c).pct === 100 && !s.doneAt) s.doneAt = WIDGETS.srs.today();
    save();
    var cb = $("#completeBtn");
    if (cb) { cb.classList.toggle("done", !was); cb.textContent = !was ? "✓ Completed — nice!" : "Mark this lesson complete"; var hint = $(".complete-hint"); if (hint) hint.textContent = !was ? "You can revisit any time." : "Finish the activities above, then mark it done to track progress."; }
    var navA = $('.nav-link[data-lesson="' + id + '"]'); if (navA) navA.classList.toggle("done", !was);
    refreshTopProgress(cid); refreshNavMeters(c);
    if (!was) {
      var fresh = earnedBadges(c).filter(function (b) { return prev.indexOf(b.id) === -1; });
      if (fresh.length) { burstConfetti(); toast("🎉 Badge unlocked: " + fresh[0].emoji + " " + fresh[0].label); }
      else toast("✓ Marked complete");
    }
  }

  /* ---------- Wire interactive widgets ---------- */
  function wireLesson(cid, id) {
    var s = cstate(cid);
    $all(".check-item", $("#content")).forEach(function (label) {
      var key = id + ":" + label.dataset.check;
      var input = label.querySelector("input");
      if (s.checks[key]) { input.checked = true; label.classList.add("checked"); }
      input.addEventListener("change", function () {
        label.classList.toggle("checked", input.checked);
        if (input.checked) { s.checks[key] = true; touch(); } else delete s.checks[key];
        save(); maybeCelebrate(label);
      });
    });
    wireSims($("#content"));
    var api = { course: cid, lesson: id, state: s, store: store, save: save, toast: toast, touch: touch };
    WIDGETS.wire($("#content"), api);
    window.CHECKERS.wire($("#content"), api);
  }
  function maybeCelebrate(label) {
    var list = label.closest(".checklist"); if (!list) return;
    var inputs = $all('input[type="checkbox"]', list);
    if (inputs.length > 1 && inputs.every(function (i) { return i.checked; })) toast("✅ Checklist complete!");
  }

  /* ---------- Terminal simulator ---------- */
  function wireSims(scope) {
    $all(".ccsim", scope).forEach(function (sim) {
      if (sim.dataset.wired) return; sim.dataset.wired = "1";
      var steps; try { steps = JSON.parse(sim.dataset.steps || "[]"); } catch (e) { steps = []; }
      var intro = sim.dataset.intro || "";
      var screen = $("[data-screen]", sim), input = $("[data-input]", sim), runBtn = $("[data-run]", sim), promptEl = $("[data-prompt]", sim), resetBtn = $(".ccsim-reset", sim);
      var i = 0, busy = false;
      function scrollDown() { screen.scrollTop = screen.scrollHeight; }
      function resp(t) { return esc(t).replace(/\n/g, "<br>"); }
      function clearMismatch() { var old = $(".ccsim-mismatch", sim); if (old) old.remove(); input.removeAttribute("aria-invalid"); }
      function showStep() {
        if (i >= steps.length) {
          promptEl.textContent = ""; input.value = ""; input.placeholder = "✓ done — press Reset to replay"; input.disabled = true; runBtn.disabled = true;
          var d = document.createElement("div"); d.className = "ccsim-done"; d.textContent = "✓ Simulation complete"; screen.appendChild(d); scrollDown(); return;
        }
        var st = steps[i];
        promptEl.textContent = st.kind === "shell" ? "$" : "❯";
        input.placeholder = st.cmd || "type a command…";
      }
      function reset() {
        i = 0; busy = false; input.disabled = false; runBtn.disabled = false; input.value = "";
        clearMismatch();
        screen.innerHTML = intro ? '<div class="ccsim-intro">' + resp(intro) + "</div>" : "";
        showStep();
      }
      function run() {
        if (busy || i >= steps.length) return;
        var st = steps[i];
        var entered = input.value.trim(), expected = (st.cmd || "").trim();
        if (entered && expected && entered.replace(/\s+/g, " ") !== expected.replace(/\s+/g, " ")) {
          clearMismatch();
          var mismatch = document.createElement("div"); mismatch.className = "ccsim-mismatch"; mismatch.setAttribute("role", "status"); mismatch.textContent = "Guided step: type the suggested command shown in the field, or leave it blank and choose Run.";
          sim.insertBefore(mismatch, $(".ccsim-note", sim)); input.setAttribute("aria-invalid", "true"); input.focus(); return;
        }
        clearMismatch();
        var typed = entered || expected;
        var line = document.createElement("div"); line.className = "ccsim-line";
        line.innerHTML = '<span class="ccsim-prompt">' + (st.kind === "shell" ? "$" : "❯") + '</span> <span class="ccsim-cmd">' + esc(typed) + "</span>";
        screen.appendChild(line); input.value = ""; scrollDown();
        var out = document.createElement("div"); out.className = "ccsim-out" + (st.kind === "shell" ? " shell" : "");
        if (st.kind !== "shell") { var tag = document.createElement("span"); tag.className = "ccsim-tag"; tag.textContent = "claude"; out.appendChild(tag); }
        var body = document.createElement("span"); body.className = "ccsim-respbody"; out.appendChild(body);
        screen.appendChild(out);
        busy = true; input.disabled = true; runBtn.disabled = true;
        var text = st.response || "";
        (function typeOut() {
          if (!text) { finish(); return; }
          var n = text.length, k = 0, stepN = Math.max(2, Math.round(n / 90));
          (function tick() {
            k = Math.min(n, k + stepN);
            body.innerHTML = resp(text.slice(0, k)) + (k < n ? '<span class="ccsim-caret">▋</span>' : "");
            scrollDown();
            if (k < n) setTimeout(tick, 16); else finish();
          })();
        })();
        function finish() { busy = false; input.disabled = false; runBtn.disabled = false; i++; showStep(); scrollDown(); input.focus(); }
      }
      runBtn.addEventListener("click", run);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); run(); } });
      if (resetBtn) resetBtn.addEventListener("click", reset);
      reset();
    });
  }

  /* ---------- Delegated: copy + quiz ---------- */
  document.addEventListener("click", function (e) {
    var copyBtn = e.target.closest("[data-copy]"); if (copyBtn) { handleCopy(copyBtn); return; }
    var opt = e.target.closest(".quiz-opt"); if (opt) { handleQuiz(opt); return; }
    var retry = e.target.closest(".quiz-retry"); if (retry) { retryQuiz(retry.closest(".quiz")); return; }
  });
  function handleCopy(btn) {
    var text = "";
    var cb = btn.closest(".codeblock"); if (cb) { var code = cb.querySelector("pre code"); text = code ? code.textContent : ""; }
    else { var pc = btn.closest(".prompt-card"); if (pc) { var b = pc.querySelector(".prompt-body"); text = b ? b.textContent : ""; } }
    if (!text) return;
    var done = function () { var old = btn.textContent; btn.textContent = "Copied!"; btn.classList.add("copied"); setTimeout(function () { btn.textContent = old; btn.classList.remove("copied"); }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(function () { legacyCopy(text); done(); });
    else { legacyCopy(text); done(); }
  }
  function legacyCopy(text) { var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta); }
  function handleQuiz(opt) {
    var q = opt.closest(".quiz-q"); if (!q || q.classList.contains("answered")) return;
    q.classList.add("answered");
    var correct = opt.dataset.correct === "1";
    opt.classList.add(correct ? "correct" : "wrong");
    if (!correct) { var right = q.querySelector('.quiz-opt[data-correct="1"]'); if (right) right.classList.add("correct"); }
    $all(".quiz-opt", q).forEach(function (b) { b.disabled = true; });
    var ex = q.querySelector(".quiz-explain"); if (ex) ex.classList.add("show");
    if (correct) { q.classList.add("got-it"); toast("✓ Correct!"); }
    touch(); save();
    scoreQuiz(q.closest(".quiz"));
  }
  // When every question in a quiz is answered: show the score, keep the best one, offer a retry.
  function scoreQuiz(quiz) {
    var qs = $all(".quiz-q", quiz), answered = qs.filter(function (q) { return q.classList.contains("answered"); });
    var daily = !!quiz.closest(".daily");
    if (answered.length !== qs.length || (!currentCourseId && !daily)) return;
    var right = qs.filter(function (q) { return q.classList.contains("got-it"); }).length;
    if (daily) {
      var day = WIDGETS.srs.today(); store.daily = store.daily || {};
      if (!store.daily[day] || right > store.daily[day].c) store.daily[day] = { c: right, t: qs.length };
    } else {
      var lessonId = (location.hash.match(/#\/[^/]+\/([^/?]+)/) || [])[1] || "";
      var key = lessonId + ":" + $all(".quiz", $("#content")).indexOf(quiz), s = cstate(currentCourseId);
      if (!s.quiz[key] || right > s.quiz[key].c) s.quiz[key] = { c: right, t: qs.length };
    }
    save();
    var msg = right === qs.length ? "Perfect score. That idea is yours now." : right >= qs.length / 2 ? "Solid. Read the explanations for the ones you missed, then retry." : "Worth another pass — reread the section, then retry.";
    var row = $(".quiz-score", quiz) || document.createElement("div");
    row.className = "quiz-score"; row.setAttribute("role", "status");
    row.innerHTML = '<span class="quiz-score-num">' + right + " / " + qs.length + '</span><span class="quiz-score-msg">' + msg + '</span><button class="quiz-retry btn-sm" type="button">↻ Retry</button>';
    quiz.appendChild(row);
    if (right === qs.length && qs.length > 1) burstConfetti();
  }
  function retryQuiz(quiz) {
    $all(".quiz-q", quiz).forEach(function (q) { q.classList.remove("answered", "got-it"); });
    $all(".quiz-opt", quiz).forEach(function (b) { b.disabled = false; b.classList.remove("correct", "wrong"); });
    $all(".quiz-explain", quiz).forEach(function (x) { x.classList.remove("show"); });
    var row = $(".quiz-score", quiz); if (row) row.remove();
    var first = $(".quiz-opt", quiz); if (first) first.focus();
  }

  /* ---------- Toast + Confetti ---------- */
  var toastTimer;
  function toast(msg) { var t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); } t.textContent = msg; requestAnimationFrame(function () { t.classList.add("show"); }); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600); }
  function burstConfetti() {
    var canvas = $("#confetti"), ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight; canvas.classList.add("active");
    var colors = ["#d97757", "#2f8f6b", "#8b5cf6", "#4a73c4", "#c98a16"], pieces = [];
    for (var i = 0; i < 130; i++) pieces.push({ x: canvas.width / 2 + (Math.random() - 0.5) * 220, y: canvas.height / 3, vx: (Math.random() - 0.5) * 12, vy: Math.random() * -12 - 4, size: Math.random() * 8 + 4, color: colors[i % colors.length], rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3 });
    var start = performance.now();
    (function frame(now) {
      var el = now - start; ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(function (p) { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, 1 - el / 2200); ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6); ctx.restore(); });
      if (el < 2200) requestAnimationFrame(frame); else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.classList.remove("active"); }
    })(performance.now());
  }

  /* ---------- Search (across all courses) ---------- */
  var searchSel = -1, searchHits = [], searchReturnFocus = null;
  function allSearchItems() { var items = []; COURSES.forEach(function (c) { courseLessons(c).forEach(function (x) { items.push({ course: c, module: x.module, lesson: x.lesson }); }); }); return items; }
  function openSearch() {
    var modal = $("#searchModal"); if (modal.hidden) searchReturnFocus = document.activeElement; modal.hidden = false;
    var input = $("#searchInput"); input.value = ""; input.focus(); runSearch("");
    if (!textIndex) buildIndex().then(function () { if (!modal.hidden) runSearch(input.value); });
  }
  function closeSearch() { var modal = $("#searchModal"); if (modal.hidden) return; modal.hidden = true; searchSel = -1; var target = searchReturnFocus && searchReturnFocus.isConnected ? searchReturnFocus : $("#searchBtn"); searchReturnFocus = null; if (target && target.focus) target.focus(); }
  /* Full-text index: every lesson body split into ## sections, built lazily on first search. */
  var textIndex = null, indexing = null;
  function plain(md) {
    return md.replace(/^```[\w-]*\s*$/gm, " ").replace(/^\s*[-*]\s+\[[ xX]\]\s+/gm, " ").replace(/^:::\w*\s*/gm, " ").replace(/\[\[([^|\]]*)\|[^\]]*\]\]/g, "$1")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/^(Q:|A:|S:|[+~-]\s|>\s*|\$\s|#+\s)/gm, " ").replace(/[`*_|]/g, " ").replace(/\s+/g, " ").trim();
  }
  function buildIndex() {
    if (indexing) return indexing;
    indexing = Promise.all(allSearchItems().map(function (x) {
      return fetchBody(x.lesson.file).then(function (md) {
        var parts = md.split(/^## /m), out = [];
        parts.forEach(function (chunk, k) {
          var nl = chunk.indexOf("\n"), head = k === 0 ? "" : chunk.slice(0, nl).trim(), body = k === 0 ? chunk.replace(/^#\s+.*$/m, "") : chunk.slice(nl + 1);
          out.push({ item: x, heading: head, slug: head ? MD.slug(head) : "", text: plain(body) });
        });
        return out;
      }).catch(function () { return []; });
    })).then(function (lists) { textIndex = [].concat.apply([], lists); return textIndex; });
    return indexing;
  }
  function snippet(text, words) {
    var low = text.toLowerCase(), at = low.indexOf(words[0]), start = Math.max(0, at - 50);
    var cut = (start ? "…" : "") + text.slice(start, start + 150) + (start + 150 < text.length ? "…" : "");
    var html = esc(cut);
    words.forEach(function (w) { if (w.length > 1) html = html.replace(new RegExp("\\b(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>"); });
    return html;
  }
  function runSearch(q) {
    q = q.trim().toLowerCase();
    var items = allSearchItems(), words = q.split(/\s+/).filter(Boolean), hits = [];
    if (!q) hits = items.slice(0, 8).map(function (x) { return { x: x }; });
    else {
      items.forEach(function (x) {
        var hay = (x.lesson.title + " " + (x.lesson.summary || "") + " " + (x.lesson.keywords || []).join(" ") + " " + x.module.title + " " + x.course.title).toLowerCase();
        if (words.every(function (w) { return hay.indexOf(w) !== -1; })) hits.push({ x: x });
      });
      if (textIndex) {
        var perLesson = {}, phrase = words.join(" ");
        textIndex.map(function (sec) {
          var low = sec.text.toLowerCase();
          if (!words.every(function (w) { return low.indexOf(w) !== -1; })) return null;
          return { sec: sec, score: (low.indexOf(phrase) !== -1 ? 10 : 0) + (sec.heading.toLowerCase().indexOf(words[0]) !== -1 ? 5 : 0) };
        }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).forEach(function (h) {
          var key = h.sec.item.course.id + "/" + h.sec.item.lesson.id;
          if ((perLesson[key] = (perLesson[key] || 0) + 1) > 2) return;
          hits.push({ x: h.sec.item, sec: h.sec, snip: snippet(h.sec.text, words) });
        });
      }
      hits = hits.slice(0, 14);
    }
    searchHits = hits; searchSel = hits.length ? 0 : -1;
    var ul = $("#searchResults");
    if (!hits.length) { ul.innerHTML = '<li class="search-empty">' + (textIndex ? "No matches. Try “plan mode”, “CLAUDE.md”, or “connector”." : "Searching lesson text…") + "</li>"; return; }
    ul.innerHTML = hits.map(function (h, i) {
      var x = h.x, href = lessonHref(x.course.id, x.lesson.id) + (h.sec && h.sec.slug ? "?s=" + encodeURIComponent(h.sec.slug) : "");
      return '<li><a href="' + href + '" class="' + (i === 0 ? "sel" : "") + '" data-i="' + i + '"><span class="sr-main"><span class="sr-title">' + esc(x.lesson.title) + (h.sec && h.sec.heading ? ' <span class="sr-sec">› ' + esc(h.sec.heading) + "</span>" : "") + "</span>" +
        (h.snip ? '<span class="sr-snippet">' + h.snip + "</span>" : "") + '</span><span class="sr-group">' + x.course.emoji + " " + esc(x.module.title) + "</span></a></li>";
    }).join("") + (textIndex ? "" : '<li class="search-empty sr-loading">Searching lesson text…</li>');
    $all("#searchResults a").forEach(function (a) { a.addEventListener("click", closeSearch); a.addEventListener("mousemove", function () { setSel(parseInt(a.dataset.i, 10)); }); });
  }
  function setSel(i) { searchSel = i; $all("#searchResults a").forEach(function (a, idx) { a.classList.toggle("sel", idx === i); }); }
  $("#searchBtn").addEventListener("click", openSearch);
  $("#searchInput").addEventListener("input", function (e) { runSearch(e.target.value); });
  $all("[data-close-search]").forEach(function (el) { el.addEventListener("click", closeSearch); });
  $("#searchInput").addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(Math.min(searchSel + 1, searchHits.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(Math.max(searchSel - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); var link = $all("#searchResults a")[searchSel]; if (link) { location.hash = link.getAttribute("href"); closeSearch(); } }
  });
  $("#searchModal").addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var focusable = $all('input, a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', e.currentTarget).filter(function (el) { return !el.hidden && el.offsetParent !== null; });
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- Shortcuts sheet ---------- */
  function openShortcuts() { var m = $("#shortcutsModal"); m.hidden = false; $(".shortcuts-close", m).focus(); }
  function closeShortcuts() { var m = $("#shortcutsModal"); if (m && !m.hidden) m.hidden = true; }
  $all("[data-close-shortcuts]").forEach(function (el) { el.addEventListener("click", closeShortcuts); });

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { var wasOpen = openTerm; closeTerm(); if (wasOpen) wasOpen.focus(); closeSearch(); closeNav(); closeShortcuts(); return; }
    var typing = /input|textarea|select/i.test(e.target.tagName || "") || e.target.isContentEditable;
    if (e.key === "/" && !typing) { e.preventDefault(); openSearch(); return; }
    if (typing) return;
    if (e.key === "?") { e.preventDefault(); openShortcuts(); return; }
    var m = location.hash.split("?")[0].match(/#\/([^/]+)\/(.+)$/);
    if (m && byId[m[1]]) {
      var c = byId[m[1]], order = flatOrder(c), pos = order.indexOf(m[2]);
      if (e.key === "ArrowRight" && pos > -1 && pos < order.length - 1) location.hash = lessonHref(c.id, order[pos + 1]);
      if (e.key === "ArrowLeft" && pos > 0) location.hash = lessonHref(c.id, order[pos - 1]);
    }
  });

  /* ---------- Mobile nav ---------- */
  function openNav() { $("#sidebar").classList.add("open"); $("#scrim").hidden = false; $("#navToggle").setAttribute("aria-expanded", "true"); }
  function closeNav() { $("#sidebar").classList.remove("open"); $("#scrim").hidden = true; $("#navToggle").setAttribute("aria-expanded", "false"); }
  $("#navToggle").addEventListener("click", function () { $("#sidebar").classList.contains("open") ? closeNav() : openNav(); });
  $("#scrim").addEventListener("click", closeNav);
  $("#nav").addEventListener("click", function (e) { if (e.target.closest("a") && window.innerWidth <= 980) closeNav(); });

  /* ---------- Reset ---------- */
  $("#resetBtn").addEventListener("click", function () {
    if (confirm("Clear ALL saved progress, checklists, and badges across every course? This can't be undone.")) {
      store = { theme: store.theme, courses: {} }; save(); toast("Progress reset."); route();
    }
  });

  /* ---------- Router ---------- */
  function route() {
    var raw = location.hash.replace(/^#\/?/, "");
    var query = raw.split("?")[1] || "", section = (query.match(/(?:^|&)s=([^&]+)/) || [])[1];
    raw = raw.split("?")[0];
    var parts = raw.split("/").filter(Boolean);
    $("#content").classList.remove("with-toc");
    if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
    closeShortcuts();
    closeTerm();
    if (!parts.length) { renderHub(); return; }
    if (parts[0] === "review") { renderReview(); return; }
    if (parts[0] === "notebook") { renderNotebook(); return; }
    if (parts[0] === "me") { renderMe(); return; }
    if (parts[0] === "lesson" && parts[1]) { renderLesson(currentCourseId || COURSES[0].id, parts.slice(1).join("/")); return; }
    var c = byId[parts[0]];
    if (c) {
      if (parts[1] === "path" && parts[2]) { renderFastPath(c.id, parts.slice(2).join("/")); return; }
      if (parts[1] === "certificate") { renderCertificate(c.id); return; }
      if (parts[1] === "lesson" && parts[2]) { renderLesson(c.id, parts.slice(2).join("/")); return; }
      if (parts[1]) { renderLesson(c.id, parts.slice(1).join("/"), section && decodeURIComponent(section)); return; }
      renderCourseHome(c.id); return;
    }
    renderHub();
  }
  window.addEventListener("hashchange", function () { route(); updateReadProgress(); });

  /* ---------- Boot ---------- */
  route();
})();
