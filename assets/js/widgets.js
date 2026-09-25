/* ============================================================
   Claude Lab — interactive learning widgets
   Flashcards (with a spaced-repetition deck), ordering exercises,
   branching scenarios, reflections, and find-the-flaw reviews.
   markdown.js renders the markup; wire() makes it interactive.
   ============================================================ */
(function () {
  "use strict";

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function parse(json, fallback) { try { return JSON.parse(json); } catch (e) { return fallback; } }

  /* ---------- Spaced repetition (Leitner boxes 1–5) ---------- */
  var INTERVALS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 }; // days until the card is due again
  function today(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function addDays(iso, n) {
    var p = iso.split("-").map(Number), d = new Date(p[0], p[1] - 1, p[2] + n);
    return today(d);
  }
  function nextBox(box, rate) {
    box = box || 1;
    if (rate === "again") return 1;
    if (rate === "easy") return Math.min(5, box + 2);
    return Math.min(5, box + 1);
  }
  function grade(card, rate, now) {
    card.box = nextBox(card.box, rate);
    card.due = addDays(today(now), INTERVALS[card.box]);
    card.seen = (card.seen || 0) + 1;
    return card;
  }
  function isDue(card, now) { return !card.due || card.due <= today(now); }
  function dueLabel(box, rate) {
    var days = INTERVALS[nextBox(box, rate)];
    return days === 0 ? "today" : days === 1 ? "1 day" : days + " days";
  }

  /* ---------- Flashcard deck ---------- */
  var TOUCH = !!(window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches);
  // cards: [{ id, f, b, c?, l? }]. opts.onGrade(card, rate) persists; opts.doneHtml() renders the end panel.
  function deck(root, cards, opts) {
    var stage = $(".flash-stage", root), count = $(".flash-count", root);
    var i = 0, flipped = false;
    function boxOf(card) { var saved = opts.lookup && opts.lookup(card.id); return saved ? saved.box : 1; }
    function show() {
      if (i >= cards.length) {
        if (count) count.textContent = cards.length + " / " + cards.length;
        stage.innerHTML = '<div class="flash-done" role="status">' + opts.doneHtml(cards.length) + '<button class="flash-again btn-sm" type="button">Go again</button></div>';
        $(".flash-again", stage).addEventListener("click", function () { i = 0; show(); });
        return;
      }
      var card = cards[i], box = boxOf(card);
      flipped = false;
      if (count) count.textContent = (i + 1) + " / " + cards.length;
      stage.innerHTML =
        '<button class="flash-card" type="button" aria-label="Flashcard ' + (i + 1) + " of " + cards.length + '. Select to flip.">' +
          '<span class="flash-face flash-front"><span class="flash-side">Question</span><span class="flash-text">' + card.f + "</span></span>" +
          '<span class="flash-face flash-back" aria-hidden="true"><span class="flash-side">Answer</span><span class="flash-text">' + card.b + "</span></span>" +
        "</button>" +
        '<div class="flash-dots" aria-hidden="true">' + cards.map(function (_, k) { return '<i class="' + (k < i ? "done" : k === i ? "now" : "") + '"></i>'; }).join("") + "</div>" +
        '<p class="flash-hint">' + (TOUCH ? "Tap the card to flip it." : "Select the card (or press Space) to flip it.") + " Recall the answer first.</p>" +
        '<div class="flash-grades" hidden>' +
          '<button class="flash-grade" type="button" data-rate="again">Again<small>' + dueLabel(box, "again") + "</small></button>" +
          '<button class="flash-grade" type="button" data-rate="good">Got it<small>' + dueLabel(box, "good") + "</small></button>" +
          '<button class="flash-grade" type="button" data-rate="easy">Easy<small>' + dueLabel(box, "easy") + "</small></button>" +
        "</div>";
      var btn = $(".flash-card", stage);
      btn.addEventListener("click", flip);
      $all(".flash-grade", stage).forEach(function (g) { g.addEventListener("click", function () { rate(g.dataset.rate); }); });
    }
    function flip() {
      var btn = $(".flash-card", stage); if (!btn) return;
      flipped = !flipped;
      btn.classList.toggle("flipped", flipped);
      $(".flash-front", btn).setAttribute("aria-hidden", String(flipped));
      $(".flash-back", btn).setAttribute("aria-hidden", String(!flipped));
      if (flipped) { $(".flash-grades", stage).hidden = false; $(".flash-hint", stage).textContent = "How well did you recall it?"; }
    }
    function rate(r) {
      if (!flipped) return;
      opts.onGrade(cards[i], r);
      i++; show();
      var next = $(".flash-card", stage) || $(".flash-again", stage); if (next) next.focus();
    }
    root.addEventListener("keydown", function (e) {
      if (!flipped || /textarea|input/i.test(e.target.tagName)) return;
      var r = { "1": "again", "2": "good", "3": "easy" }[e.key];
      if (r) { e.preventDefault(); rate(r); }
    });
    show();
  }

  function saveCard(api, card, r) {
    var cards = api.store.cards = api.store.cards || {};
    var saved = cards[card.id] || { f: card.f, b: card.b, c: card.c || api.course, l: card.l || api.lesson, box: 1 };
    saved.f = card.f; saved.b = card.b;
    cards[card.id] = grade(saved, r);
    api.touch(); api.save();
  }

  function wireFlash(root, api) {
    var cards = parse(root.dataset.cards, []);
    deck(root, cards, {
      lookup: function (id) { return (api.store.cards || {})[id]; },
      onGrade: function (card, r) { saveCard(api, card, r); },
      doneHtml: function (n) { return "<strong>Deck done.</strong> These " + n + ' cards are now in your <a href="#/review">review deck</a>. It brings each one back just before you would forget it.'; }
    });
  }

  /* ---------- Ordering exercise ---------- */
  function seeded(seed) { var s = seed || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function wireOrder(root, api, key) {
    var items = parse(root.dataset.items, []), list = $(".order-list", root), result = $(".order-result", root);
    var seed = 0; items.join("").split("").forEach(function (ch) { seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647; });
    var keys = items.map(function (_, k) { return k; }), rnd = seeded(seed || 7);
    for (var k = keys.length - 1; k > 0; k--) { var j = Math.floor(rnd() * (k + 1)), t = keys[k]; keys[k] = keys[j]; keys[j] = t; }
    if (keys.every(function (v, idx) { return v === idx; })) keys.push(keys.shift());
    var tries = 0, dragged = null;
    list.innerHTML = keys.map(function (v) {
      return '<li class="order-item" data-key="' + v + '" draggable="true"><span class="order-grip" aria-hidden="true">⠿</span><span class="order-pos"></span>' +
        '<span class="order-text">' + items[v] + '</span><span class="order-moves">' +
        '<button class="order-up" type="button" aria-label="Move up">↑</button><button class="order-down" type="button" aria-label="Move down">↓</button></span></li>';
    }).join("");
    function refresh() {
      $all(".order-item", list).forEach(function (li, idx, all) {
        $(".order-pos", li).textContent = idx + 1;
        $(".order-up", li).disabled = idx === 0;
        $(".order-down", li).disabled = idx === all.length - 1;
      });
    }
    function moved() { root.classList.remove("solved"); $all(".order-item", list).forEach(function (li) { li.classList.remove("ok", "bad"); }); result.textContent = ""; refresh(); }
    list.addEventListener("click", function (e) {
      var up = e.target.closest(".order-up"), down = e.target.closest(".order-down");
      if (!up && !down) return;
      var li = e.target.closest(".order-item");
      if (up && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
      if (down && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
      moved();
      var btn = $(up ? ".order-up" : ".order-down", li); if (btn && !btn.disabled) btn.focus();
    });
    list.addEventListener("dragstart", function (e) { dragged = e.target.closest(".order-item"); if (dragged) { dragged.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; } });
    list.addEventListener("dragend", function () { if (dragged) dragged.classList.remove("dragging"); dragged = null; moved(); });
    list.addEventListener("dragover", function (e) {
      if (!dragged) return;
      e.preventDefault();
      var over = e.target.closest(".order-item"); if (!over || over === dragged) return;
      var box = over.getBoundingClientRect();
      list.insertBefore(dragged, e.clientY > box.top + box.height / 2 ? over.nextElementSibling : over);
    });
    $(".order-check", root).addEventListener("click", function () {
      var lis = $all(".order-item", list), right = 0;
      lis.forEach(function (li, idx) { var ok = Number(li.dataset.key) === idx; li.classList.toggle("ok", ok); li.classList.toggle("bad", !ok); if (ok) right++; });
      api.touch();
      if (right === lis.length) {
        root.classList.add("solved");
        result.innerHTML = "✓ Correct" + (tries ? " (after " + tries + (tries === 1 ? " retry" : " retries") + ")" : " first time") + ". " + (root.dataset.explain || "");
        api.state.ex[key] = 1; api.save(); api.toast("↕️ Order solved");
        return;
      }
      tries++;
      result.innerHTML = right + " of " + lis.length + " in the right place. Move the red ones and check again." + (tries >= 2 ? ' <button class="order-reveal linkish" type="button">Show the answer</button>' : "");
      var reveal = $(".order-reveal", result);
      if (reveal) reveal.addEventListener("click", function () {
        lis.slice().sort(function (a, b) { return a.dataset.key - b.dataset.key; }).forEach(function (li) { list.appendChild(li); });
        moved(); result.textContent = "Here is the answer. Read the explanation, then try the next one. " + (root.dataset.explain || "").replace(/<[^>]+>/g, "");
      });
    });
    refresh();
  }

  /* ---------- Scenario ---------- */
  function wireScenario(root, api, key) {
    $all(".scn-opt", root).forEach(function (opt) {
      opt.addEventListener("click", function () {
        $all(".scn-fb", root).forEach(function (fb) { fb.hidden = fb.dataset.for !== opt.dataset.i; });
        $all(".scn-opt", root).forEach(function (o) { o.classList.toggle("current", o === opt); });
        opt.classList.add("picked");
        api.touch();
        if (opt.dataset.grade === "best" && !root.classList.contains("solved")) {
          root.classList.add("solved"); api.state.ex[key] = 1; api.save(); api.toast("🧭 That's the strong call");
        } else api.save();
      });
    });
  }

  /* ---------- Reflection ---------- */
  function wireReflect(root, api) {
    var id = root.dataset.id, box = $("textarea", root), status = $(".reflect-status", root), timer;
    var notes = api.store.notes = api.store.notes || {};
    if (notes[id]) { box.value = notes[id].a; status.textContent = "Saved in your notebook"; }
    box.addEventListener("input", function () {
      status.textContent = "Saving…";
      clearTimeout(timer);
      timer = setTimeout(function () {
        var a = box.value.trim();
        if (a) notes[id] = { q: root.dataset.q, a: box.value, c: api.course, l: api.lesson, t: Date.now() };
        else delete notes[id];
        api.touch(); api.save();
        status.textContent = a ? "Saved ✓" : "Cleared";
      }, 450);
    });
  }

  /* ---------- Find the flaws ---------- */
  function wireSpot(root, api, key) {
    var segs = $all(".spot-seg", root), result = $(".spot-result", root), why = $(".spot-why", root), btn = $(".spot-check", root), checked = false;
    segs.forEach(function (s) {
      function toggle() {
        if (checked) return;
        var on = s.getAttribute("aria-pressed") !== "true";
        s.setAttribute("aria-pressed", String(on)); s.classList.toggle("picked", on);
      }
      s.addEventListener("click", toggle);
      s.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    });
    btn.addEventListener("click", function () {
      if (checked) {
        checked = false; why.hidden = true; result.textContent = ""; btn.textContent = "Check my review";
        segs.forEach(function (s) { s.classList.remove("found", "missed", "false", "picked"); s.setAttribute("aria-pressed", "false"); });
        return;
      }
      checked = true;
      var flaws = 0, found = 0, falses = 0;
      segs.forEach(function (s) {
        var flaw = s.dataset.flaw === "1", picked = s.classList.contains("picked");
        if (flaw) flaws++;
        if (flaw && picked) { found++; s.classList.add("found"); }
        else if (flaw) s.classList.add("missed");
        else if (picked) { falses++; s.classList.add("false"); }
      });
      result.textContent = "You caught " + found + " of " + flaws + " planted errors" + (falses ? " · " + falses + " false alarm" + (falses === 1 ? "" : "s") : "") + ". The numbered notes below explain each one.";
      why.hidden = false; btn.textContent = "Try again";
      api.touch();
      if (found === flaws && !falses) { api.state.ex[key] = 1; api.toast("🔎 Clean review — every error caught"); }
      api.save();
    });
  }

  /* ---------- Entry point ---------- */
  function wire(scope, api) {
    api.state.ex = api.state.ex || {};
    $all("[data-flash]", scope).forEach(function (el) { wireFlash(el, api); });
    $all("[data-order]", scope).forEach(function (el, n) { wireOrder(el, api, api.lesson + ":order:" + n); });
    $all("[data-scn]", scope).forEach(function (el, n) { wireScenario(el, api, api.lesson + ":scn:" + n); });
    $all("[data-reflect]", scope).forEach(function (el) { wireReflect(el, api); });
    $all("[data-spot]", scope).forEach(function (el, n) { wireSpot(el, api, api.lesson + ":spot:" + n); });
  }

  window.WIDGETS = { wire: wire, deck: deck, saveCard: saveCard, srs: { grade: grade, isDue: isDue, today: today, addDays: addDays, INTERVALS: INTERVALS } };
})();
