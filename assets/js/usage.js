/* Anonymous usage beacon for the course provider.
   Sends nothing until a collector origin is set on window.SITE.analytics
   or injected by analytics/server.mjs. No reflections, prompts, or checker text. */
(function () {
  "use strict";

  var meta = document.querySelector('meta[name="claudelab-analytics"]');
  if (window.SITE && !window.SITE.analytics && meta && meta.getAttribute("content")) window.SITE.analytics = meta.getAttribute("content");

  var pending = [];
  var flushTimer = null;
  var flushing = false;
  var current = null;
  var maxScroll = 0;
  var hiddenAt = 0;
  var sessionSent = false;
  var searchTimer = null;

  function endpoint() {
    var base = window.SITE && window.SITE.analytics ? String(window.SITE.analytics) : "";
    base = base.replace(/\/+$/, "");
    if (!/^https?:\/\/[^/?#]+$/i.test(base)) return "";
    return base + "/api/collect";
  }
  function randomId() {
    var bytes = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(bytes, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }
  function visitorId() {
    try {
      var id = localStorage.getItem("claudelab.usage");
      if (!id) { id = randomId(); localStorage.setItem("claudelab.usage", id); }
      return id;
    } catch (e) { return randomId(); }
  }
  function sessionId() {
    var visitor = visitorId();
    var mark = visitor.slice(0, 16);
    var now = Date.now();
    var fresh = function () { return { id: mark + randomId().slice(0, 16), at: now }; };
    try {
      var cur = JSON.parse(sessionStorage.getItem("claudelab.usage.session") || "null");
      if (!cur || !cur.id || String(cur.id).slice(0, 16) !== mark || now - cur.at > 30 * 60 * 1000) cur = fresh();
      cur.at = now;
      sessionStorage.setItem("claudelab.usage.session", JSON.stringify(cur));
      return cur.id;
    } catch (e) { return fresh().id; }
  }
  function safeQuery(raw) {
    var q = String(raw || "").replace(/\s+/g, " ").trim();
    if (q.length < 3 || q.length > 80 || q.split(" ").length > 8) return "";
    if (q.indexOf("@") !== -1) return "";
    if (/sk-|xox[baprs]-|ghp_|github_pat_|akia|bearer\s|api[_-]?key|secret|token/i.test(q)) return "";
    if (/\b[a-f0-9]{16,}\b/i.test(q)) return "";
    return q;
  }
  function parseHash() {
    var raw = (location.hash || "").replace(/^#\/?/, "").split("?")[0];
    var parts = raw.split("/").filter(Boolean);
    var loc = { page: "hub", course: "", lesson: "", at: Date.now() };
    if (!parts.length) return loc;
    if (parts[0] === "review" || parts[0] === "notebook") { loc.page = parts[0]; return loc; }
    if (parts[0] === "me") { loc.page = "progress"; return loc; }
    loc.course = parts[0];
    if (!parts[1]) { loc.page = "course"; return loc; }
    if (parts[1] === "path") { loc.page = "path"; loc.lesson = parts[2] || ""; return loc; }
    if (parts[1] === "certificate") { loc.page = "certificate"; return loc; }
    loc.page = "lesson";
    loc.lesson = parts[1];
    return loc;
  }
  function place(loc) {
    var out = { page: loc.page };
    if (loc.course) out.course = loc.course;
    if (loc.lesson) out.lesson = loc.lesson;
    return out;
  }
  function same(a, b) { return a && b && a.page === b.page && a.course === b.course && a.lesson === b.lesson; }
  function measureScroll() {
    var el = document.scrollingElement || document.documentElement;
    if (!el) return;
    var span = el.scrollHeight - el.clientHeight;
    var pct = span <= 0 ? 100 : Math.round((el.scrollTop / span) * 100);
    if (pct > maxScroll) maxScroll = pct;
  }
  function trackingOff() {
    if (!endpoint()) return true;
    try {
      if (navigator.webdriver && localStorage.getItem("claudelab.usage.allow") !== "1") return true;
    } catch (e) {}
    return false;
  }
  function dropIds(ids) {
    pending = pending.filter(function (ev) { return !ids[ev.id]; });
  }
  function again(ms) {
    if (!flushTimer) flushTimer = setTimeout(function () { flush(false); }, ms);
  }
  function flush(unload) {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    if (!pending.length) return;
    var url = endpoint();
    if (!url) return;
    var batch = pending.slice(0, 20);
    var body = JSON.stringify({ events: batch });
    var ids = {};
    for (var i = 0; i < batch.length; i++) ids[batch[i].id] = 1;
    if (unload) {
      try { if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: "text/plain" })); } catch (e) {}
      return;
    }
    if (flushing) { again(500); return; }
    flushing = true;
    fetch(url, { method: "POST", body: body, headers: { "content-type": "text/plain" }, keepalive: true, mode: "cors" })
      .then(function (res) {
        flushing = false;
        if (res.status === 204) { dropIds(ids); return null; }
        if (!res.ok) { again(4000); return null; }
        return res.json().then(function (data) {
          if (!data || !Array.isArray(data.accept) || !Array.isArray(data.reject)) { dropIds(ids); return; }
          var gone = {};
          var list = data.accept.concat(data.reject);
          for (var i = 0; i < list.length; i++) gone[list[i]] = 1;
          dropIds(gone);
          if (pending.length) again(4000);
        }).catch(function () { dropIds(ids); });
      })
      .catch(function () { flushing = false; again(4000); });
  }
  function queue(ev) {
    if (trackingOff()) return;
    if (!sessionSent && ev.type !== "session") {
      sessionSent = true;
      var host = "";
      try { if (document.referrer) host = new URL(document.referrer).host; } catch (e) {}
      queue({ type: "session", ref: host });
    }
    ev.id = randomId();
    ev.t = Date.now();
    ev.visitor = visitorId();
    ev.session = sessionId();
    ev.narrow = window.innerWidth < 720;
    pending.push(ev);
    if (pending.length > 40) pending.splice(0, pending.length - 40);
    if (pending.length >= 8) flush(false);
    else if (!flushTimer) flushTimer = setTimeout(function () { flush(false); }, 2000);
  }
  function leave() {
    if (!current) return;
    measureScroll();
    var loc = current;
    current = null;
    queue(Object.assign({ type: "leave", dwell: Date.now() - loc.at, scroll: maxScroll }, place(loc)));
  }
  function route() {
    var next = parseHash();
    if (same(current, next)) return;
    if (current) leave();
    current = next;
    maxScroll = 0;
    queue(Object.assign({ type: "view" }, place(next)));
  }
  function indexOf(list, el) {
    for (var i = 0; i < list.length; i++) if (list[i] === el) return i;
    return -1;
  }
  function recordSearch(tries) {
    var input = document.getElementById("searchInput");
    var list = document.getElementById("searchResults");
    if (!input || !list) return;
    var value = input.value || "";
    var text = list.textContent || "";
    if (text.indexOf("Searching lesson text") !== -1 && tries < 8) {
      setTimeout(function () { recordSearch(tries + 1); }, 500);
      return;
    }
    var safe = safeQuery(value);
    var redacted = !safe && String(value).trim().length >= 3;
    if (!safe && !redacted) return;
    var hits = list.querySelectorAll("a").length;
    if (text.indexOf("No matches") !== -1) hits = 0;
    queue({ type: "search", q: safe, hits: hits, redacted: redacted });
  }

  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target : (e.target && e.target.parentElement);
    if (!el || !el.closest) return;
    var done = el.closest("#completeBtn");
    if (done) {
      var loc = current && current.page === "lesson" ? current : parseHash();
      if (loc.page === "lesson") queue(Object.assign({ type: "complete", done: !done.classList.contains("done"), dwell: current && same(current, loc) ? Date.now() - current.at : 0 }, place(loc)));
      return;
    }
    var opt = el.closest(".quiz-opt");
    if (!opt || opt.closest(".daily")) return;
    var question = opt.closest(".quiz-q");
    if (!question || question.classList.contains("answered")) return;
    var quiz = question.closest(".quiz");
    if (!quiz) return;
    var loc2 = current && current.page === "lesson" ? current : parseHash();
    queue(Object.assign({
      type: "quiz",
      quiz: Math.max(0, indexOf(document.querySelectorAll("#content .quiz"), quiz)),
      question: Math.max(0, indexOf(quiz.querySelectorAll(".quiz-q"), question)),
      correct: opt.getAttribute("data-correct") === "1"
    }, place(loc2)));
  }, true);

  document.addEventListener("input", function (e) {
    if (!e.target || e.target.id !== "searchInput" || !endpoint()) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { recordSearch(0); }, 800);
  });
  window.addEventListener("hashchange", route);
  window.addEventListener("scroll", measureScroll, { passive: true });
  window.addEventListener("pagehide", function () { leave(); flush(true); });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") { hiddenAt = Date.now(); flush(true); }
    else if (hiddenAt && current) { current.at += Date.now() - hiddenAt; hiddenAt = 0; }
  });
  route();
})();
