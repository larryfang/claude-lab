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
    var nav = $("#nav"); nav.innerHTML = "";
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
    var nav = $("#nav"); nav.innerHTML = "";
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
  function renderHub() {
    currentCourseId = null;
    refreshTopProgress(null);
    buildHubNav();
    document.title = SITE.title + " — Cowork for Sales, GTM, Product & Finance";
    var html = "";
    html += '<section class="hero">';
    html += '<span class="hero-eyebrow">✦ Hands-on · Interactive · Open source</span>';
    html += "<h1>Get genuinely good at <span class=\"grad\">Claude</span>.</h1>";
    html += '<p class="hero-sub">' + esc(SITE.tagline) + " Pick a track below and start practicing — progress, quizzes, and badges save automatically in your browser.</p>";
    html += "</section>";
    html += '<h2 class="section-title">Choose your track</h2><p class="section-desc">Two hands-on courses. Start wherever fits you today.</p>';
    html += '<div class="course-grid">';
    COURSES.forEach(function (c) {
      var p = progressPct(c);
      var resume = countable(c).filter(function (x) { return !cstate(c.id).completed[x.lesson.id]; })[0];
      var startId = resume ? resume.lesson.id : c.modules[0].lessons[0].id;
      var cta = p.done === 0 ? "Start course" : (p.pct === 100 ? "Review" : "Resume");
      html += '<a class="course-card" href="' + lessonHref(c.id, startId) + '">';
      html += '<div class="course-card-top"><span class="course-emoji">' + c.emoji + "</span>";
      html += '<span class="course-ring" style="--p:' + p.pct + '"><span>' + p.pct + "%</span></span></div>";
      html += "<h2>" + c.title + "</h2>";
      html += '<p class="course-aud">' + esc(c.audience) + "</p>";
      html += '<p class="course-tag">' + esc(c.tagline) + "</p>";
      html += '<div class="course-meta"><span>' + countable(c).length + " lessons</span><span class=\"dot\">·</span><span>" + c.modules.filter(function (m) { return !isRef(m); }).length + " modules</span><span class=\"dot\">·</span><span>" + c.level + "</span></div>";
      html += '<span class="course-btn">' + cta + ' <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
      html += "</a>";
    });
    html += "</div>";
    html += '<p style="margin-top:44px;color:var(--muted);font-size:.85rem">Open source &amp; built to be remixed. <a href="' + SITE.repo + '" target="_blank" rel="noopener">Fork it on GitHub</a> to make an internal edition for your team.</p>';
    $("#content").innerHTML = html;
    window.scrollTo(0, 0);
  }

  /* ---------- Course home ---------- */
  function renderCourseHome(cid) {
    var c = byId[cid]; if (!c) { location.hash = "#/"; return; }
    currentCourseId = cid;
    refreshTopProgress(cid);
    buildCourseNav(c, null);
    document.title = c.title + " · " + SITE.title;
    var p = progressPct(c);
    var resume = countable(c).filter(function (x) { return !cstate(c.id).completed[x.lesson.id]; })[0];
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
    html += '<div class="dash-info"><h3>Your progress</h3><p>' + p.done + " of " + p.total + " lessons complete. " + (p.pct === 100 ? "You finished the whole course — 🏆" : "Work top-to-bottom, or jump around.") + "</p>";
    html += '<div class="badge-row">';
    (c.badges || []).forEach(function (b) { var has = earned.indexOf(b) !== -1; html += '<span class="badge ' + (has ? "earned" : "") + '">' + (has ? b.emoji : "🔒") + " " + b.label + "</span>"; });
    html += "</div></div></div>";

    if (c.fastPaths && c.fastPaths.length) {
      html += '<h2 class="section-title">Choose your route</h2><p class="section-desc">Short on time? Pick the outcome closest to your job. Every route still counts toward the full course.</p>';
      html += '<details class="route-chooser"><summary>60-second route chooser</summary><div class="route-chooser-body">';
      html += '<p><strong>Choose “Essentials”</strong> if you are new or unsure. Otherwise, choose the role or outcome you need this week. You can switch routes at any time; progress is shared.</p>';
      html += '<p class="route-question"><strong>Quick check:</strong> Can you already explain the safety model, write a constrained brief, and verify an output? If not, start with Essentials.</p></div></details>';
      html += '<div class="fast-path-grid">';
      c.fastPaths.forEach(function (path) {
        var mins = fastPathMinutes(c, path);
        html += '<a class="fast-path-card" href="' + fastPathHref(c.id, path.id) + '"><span class="fast-path-emoji">' + path.emoji + '</span><div><h3>' + esc(path.title) + '</h3><p>' + esc(path.desc) + '</p><span class="fast-path-meta">' + path.lessons.length + ' lessons · about ' + mins + ' min</span></div></a>';
      });
      html += "</div>";
    }

    html += '<h2 class="section-title">The path</h2><p class="section-desc">' + c.modules.filter(function (m) { return !isRef(m); }).length + " modules. Each ends with a knowledge check or a hands-on lab.</p>";
    html += '<div class="module-grid">';
    var step = 0;
    c.modules.forEach(function (m) {
      if (isRef(m)) return;
      step++;
      var mp = moduleProgress(c, m);
      html += '<a class="module-card" href="' + lessonHref(c.id, m.lessons[0].id) + '">';
      html += '<span class="mc-step">' + step + "</span>";
      html += '<span class="mc-emoji">' + m.emoji + "</span><h3>" + m.title + "</h3><p>" + m.desc + "</p>";
      html += '<div class="mc-foot"><span>' + m.lessons.length + " lessons</span><span>" + mp.done + "/" + mp.total + " done</span></div>";
      html += '<div class="mc-bar"><div style="width:' + mp.pct + '%"></div></div></a>';
    });
    html += "</div>";

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

  /* ---------- Lesson ---------- */
  function fetchBody(file) {
    if (bodyCache[file]) return Promise.resolve(bodyCache[file]);
    return fetch("content/" + file, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); }).then(function (t) { bodyCache[file] = t; return t; });
  }

  function renderLesson(cid, id) {
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

      $("#content").innerHTML = html;
      setActiveNav(id);
      wireLesson(cid, id);
      var cb = $("#completeBtn"); if (cb) cb.addEventListener("click", function () { toggleComplete(cid, id); });
    }).catch(function (err) { $("#content").innerHTML = errorHtml(l.file, err); });
  }

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
    if (was) delete s.completed[id]; else s.completed[id] = true;
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
    WIDGETS.wire($("#content"), { course: cid, lesson: id, state: s, store: store, save: save, toast: toast, touch: touch });
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
    if (answered.length !== qs.length || !currentCourseId) return;
    var right = qs.filter(function (q) { return q.classList.contains("got-it"); }).length;
    var lessonId = (location.hash.match(/#\/[^/]+\/([^/?]+)/) || [])[1] || "";
    var key = lessonId + ":" + $all(".quiz", $("#content")).indexOf(quiz), s = cstate(currentCourseId);
    if (!s.quiz[key] || right > s.quiz[key].c) s.quiz[key] = { c: right, t: qs.length };
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
  function openSearch() { var modal = $("#searchModal"); if (modal.hidden) searchReturnFocus = document.activeElement; modal.hidden = false; var input = $("#searchInput"); input.value = ""; input.focus(); runSearch(""); }
  function closeSearch() { var modal = $("#searchModal"); if (modal.hidden) return; modal.hidden = true; searchSel = -1; var target = searchReturnFocus && searchReturnFocus.isConnected ? searchReturnFocus : $("#searchBtn"); searchReturnFocus = null; if (target && target.focus) target.focus(); }
  function runSearch(q) {
    q = q.trim().toLowerCase();
    var items = allSearchItems(), hits;
    if (!q) hits = items.slice(0, 8);
    else hits = items.filter(function (x) {
      var hay = (x.lesson.title + " " + (x.lesson.summary || "") + " " + (x.lesson.keywords || []).join(" ") + " " + x.module.title + " " + x.course.title).toLowerCase();
      return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
    }).slice(0, 12);
    searchHits = hits; searchSel = hits.length ? 0 : -1;
    var ul = $("#searchResults");
    if (!hits.length) { ul.innerHTML = '<li class="search-empty">No matches. Try “plan mode”, “CLAUDE.md”, or “connector”.</li>'; return; }
    ul.innerHTML = hits.map(function (x, i) {
      return '<li><a href="' + lessonHref(x.course.id, x.lesson.id) + '" class="' + (i === 0 ? "sel" : "") + '" data-i="' + i + '"><span class="sr-title">' + x.lesson.title + '</span><span class="sr-group">' + x.course.emoji + " " + x.module.title + "</span></a></li>";
    }).join("");
    $all("#searchResults a").forEach(function (a) { a.addEventListener("click", closeSearch); a.addEventListener("mousemove", function () { setSel(parseInt(a.dataset.i, 10)); }); });
  }
  function setSel(i) { searchSel = i; $all("#searchResults a").forEach(function (a, idx) { a.classList.toggle("sel", idx === i); }); }
  $("#searchBtn").addEventListener("click", openSearch);
  $("#searchInput").addEventListener("input", function (e) { runSearch(e.target.value); });
  $all("[data-close-search]").forEach(function (el) { el.addEventListener("click", closeSearch); });
  $("#searchInput").addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(Math.min(searchSel + 1, searchHits.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(Math.max(searchSel - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (searchHits[searchSel]) { location.hash = lessonHref(searchHits[searchSel].course.id, searchHits[searchSel].lesson.id); closeSearch(); } }
  });
  $("#searchModal").addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var focusable = $all('input, a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', e.currentTarget).filter(function (el) { return !el.hidden && el.offsetParent !== null; });
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeSearch(); closeNav(); return; }
    var typing = /input|textarea/i.test(e.target.tagName || "") || e.target.isContentEditable;
    if (e.key === "/" && !typing) { e.preventDefault(); openSearch(); return; }
    if (typing) return;
    var m = location.hash.match(/#\/([^/]+)\/(.+)$/);
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
    var parts = raw.split("/").filter(Boolean);
    if (!parts.length) { renderHub(); return; }
    if (parts[0] === "lesson" && parts[1]) { renderLesson(currentCourseId || COURSES[0].id, parts.slice(1).join("/")); return; }
    var c = byId[parts[0]];
    if (c) {
      if (parts[1] === "path" && parts[2]) { renderFastPath(c.id, parts.slice(2).join("/")); return; }
      if (parts[1] === "lesson" && parts[2]) { renderLesson(c.id, parts.slice(2).join("/")); return; }
      if (parts[1]) { renderLesson(c.id, parts.slice(1).join("/")); return; }
      renderCourseHome(c.id); return;
    }
    renderHub();
  }
  window.addEventListener("hashchange", route);

  /* ---------- Boot ---------- */
  route();
})();
