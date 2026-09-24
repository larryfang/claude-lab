/* ============================================================
   Claude Lab — tiny self-contained Markdown engine
   Supports: headings, lists (nested + ordered), task checklists,
   tables, blockquotes, code blocks, inline styling, links/images,
   and custom blocks:  :::tip/note/warning/concept/try/lab/details,
   ```prompt  and  ```quiz
   ============================================================ */
(function () {
  "use strict";

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }
  // URL sanitizer: allow relative URLs + in-page anchors + a safe scheme allow-list.
  // Anything with a scheme outside the list (javascript:, data:, vbscript:, …) becomes "#".
  // Content is author-trusted, but forks accept community Markdown — keep this.
  function safeUrl(s) {
    s = String(s).trim();
    if (/^[a-z][a-z0-9+.\-]*:/i.test(s) && !/^(https?|mailto|tel):/i.test(s)) return "#";
    return s;
  }
  function slug(s) {
    return String(s).toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  }

  function emphasize(text) {
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    text = text.replace(/(^|[^*\w])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    text = text.replace(/(^|[^_\w])_([^_\n]+)_/g, "$1<em>$2</em>");
    text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    return text;
  }

  function parseInline(text) {
    if (text == null) return "";
    const codes = [];
    text = text.replace(/`([^`]+)`/g, function (m, c) { codes.push(c); return "\u0000" + (codes.length - 1) + "\u0000"; });
    text = escapeHtml(text);
    // image/link tags are frozen as placeholders so the emphasis pass cannot
    // pair underscores inside hrefs or the target="_blank" attribute
    const frozen = [];
    function freeze(html) { frozen.push(html); return "\u0001" + (frozen.length - 1) + "\u0001"; }
    // images
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, function (m, alt, src, title) {
      return freeze('<img src="' + escAttr(safeUrl(src)) + '" alt="' + escAttr(alt) + '"' + (title ? ' title="' + escAttr(title) + '"' : "") + ' loading="lazy">');
    });
    // links
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, function (m, t, href, title) {
      const ext = /^https?:/i.test(href);
      return freeze('<a href="' + escAttr(safeUrl(href)) + '"' + (title ? ' title="' + escAttr(title) + '"' : "") + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + emphasize(t) + "</a>");
    });
    text = emphasize(text);
    // restore frozen HTML before code spans: link text may contain a \u0000 code placeholder
    text = text.replace(/\u0001(\d+)\u0001/g, function (m, i) { return frozen[+i]; });
    text = text.replace(/\u0000(\d+)\u0000/g, function (m, i) { return "<code>" + escapeHtml(codes[+i]) + "</code>"; });
    return text;
  }

  function isBlockStart(l) {
    return /^```/.test(l) || /^:::/.test(l) || /^#{1,6}\s/.test(l) || /^>\s?/.test(l) ||
      /^\s*([-*+]|\d+\.)\s+/.test(l) || /^(\s*[-*_]){3,}\s*$/.test(l);
  }

  function splitRow(r) {
    return r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(function (c) { return c.trim(); });
  }

  function renderTable(buf) {
    const header = splitRow(buf[0]);
    const seps = splitRow(buf[1]);
    const aligns = seps.map(function (s) {
      const l = /^:/.test(s), r = /:$/.test(s);
      return l && r ? "center" : r ? "right" : l ? "left" : "";
    });
    let h = '<div class="table-wrap"><table><thead><tr>';
    header.forEach(function (c, idx) { h += "<th" + (aligns[idx] ? ' style="text-align:' + aligns[idx] + '"' : "") + ">" + parseInline(c) + "</th>"; });
    h += "</tr></thead><tbody>";
    for (let k = 2; k < buf.length; k++) {
      if (!buf[k].includes("|")) continue;
      const cells = splitRow(buf[k]);
      h += "<tr>";
      cells.forEach(function (c, idx) { h += "<td" + (aligns[idx] ? ' style="text-align:' + aligns[idx] + '"' : "") + ">" + parseInline(c) + "</td>"; });
      h += "</tr>";
    }
    h += "</tbody></table></div>";
    return h;
  }

  function renderItems(items, ctx) {
    if (!items.length) return "";
    const isTask = items.every(function (it) { return /^\[[ xX]\]\s/.test(it.text); });
    if (isTask) {
      let h = '<ul class="checklist">';
      items.forEach(function (it) {
        const mm = it.text.match(/^\[([ xX])\]\s([\s\S]*)$/);
        const checked = mm[1].toLowerCase() === "x";
        const idx = ctx.checkIdx++;
        const text = mm[2].replace(/\n/g, " ");
        h += "<li><label class=\"check-item" + (checked ? " checked" : "") + "\" data-lesson=\"" + escAttr(ctx.lessonId || "") + "\" data-check=\"" + idx + "\">" +
          '<input type="checkbox"' + (checked ? " checked" : "") + ">" +
          '<span class="check-box">✓</span>' +
          '<span class="check-text">' + parseInline(text) + "</span></label>";
        if (it.children.length) h += renderItems(it.children, ctx);
        h += "</li>";
      });
      return h + "</ul>";
    }
    const tag = items[0].ordered ? "ol" : "ul";
    let h = "<" + tag + ">";
    items.forEach(function (it) {
      h += "<li>" + parseInline(it.text.replace(/\n/g, " "));
      if (it.children.length) h += renderItems(it.children, ctx);
      h += "</li>";
    });
    return h + "</" + tag + ">";
  }

  function renderList(buf, ctx) {
    const items = [];
    buf.forEach(function (ln) {
      const m = ln.match(/^(\s*)([-*+]|\d+\.)\s+([\s\S]*)$/);
      if (m) items.push({ indent: m[1].length, ordered: /\d+\./.test(m[2]), text: m[3], children: [] });
      else if (items.length) items[items.length - 1].text += "\n" + ln.trim();
    });
    const root = [];
    const stack = [{ indent: -1, children: root }];
    items.forEach(function (it) {
      while (stack.length > 1 && it.indent <= stack[stack.length - 1].indent) stack.pop();
      stack[stack.length - 1].children.push(it);
      stack.push(it);
    });
    return renderItems(root, ctx);
  }

  function renderQuiz(code) {
    const blocks = [];
    let cur = null;
    code.split("\n").forEach(function (raw) {
      const line = raw.trim();
      if (!line) return;
      let qm = line.match(/^Q:\s*(.*)$/i);
      if (qm) { if (cur) blocks.push(cur); cur = { q: qm[1], opts: [], explain: "" }; return; }
      let em = line.match(/^>\s*(.*)$/);
      if (em && cur) { cur.explain += (cur.explain ? " " : "") + em[1]; return; }
      let om = line.match(/^([-+])\s+(.*)$/);
      if (om && cur) { cur.opts.push({ correct: om[1] === "+", text: om[2] }); return; }
    });
    if (cur) blocks.push(cur);
    if (!blocks.length) return "";
    const letters = ["A", "B", "C", "D", "E", "F"];
    let h = '<div class="quiz" data-quiz><div class="quiz-head"><span class="quiz-emoji">🧩</span><span class="quiz-kicker">Knowledge check</span></div>';
    blocks.forEach(function (b) {
      h += '<div class="quiz-q" data-q><p class="quiz-q-text">' + parseInline(b.q) + '</p><div class="quiz-options">';
      b.opts.forEach(function (o, idx) {
        h += '<button class="quiz-opt" type="button" data-correct="' + (o.correct ? "1" : "0") + '"><span class="opt-marker">' + (letters[idx] || "•") + "</span><span>" + parseInline(o.text) + "</span></button>";
      });
      h += "</div>";
      if (b.explain) h += '<div class="quiz-explain"><strong>Answer.</strong> ' + parseInline(b.explain) + "</div>";
      h += "</div>";
    });
    return h + "</div>";
  }

  function renderPrompt(code) {
    const txt = code.replace(/\s+$/, "").replace(/^\n+/, "");
    return '<div class="prompt-card"><div class="prompt-head">' +
      '<span class="prompt-icon" aria-hidden="true">💬</span><span class="prompt-label">Try this prompt</span>' +
      '<button class="copy-btn" type="button" data-copy>Copy</button></div>' +
      '<div class="prompt-body">' + escapeHtml(txt) + "</div></div>";
  }

  function renderSim(code) {
    var lines = String(code).replace(/\r\n?/g, "\n").split("\n");
    var intro = [], steps = [], cur = null;
    function pushCur() { if (cur) { cur.response = cur.response.replace(/\n+$/, "").replace(/^\n+/, ""); steps.push(cur); cur = null; } }
    lines.forEach(function (line) {
      var mShell = line.match(/^\$\s+(.*)$/);
      var mClaude = line.match(/^>\s+(.*)$/);
      var mIntro = line.match(/^#\s?(.*)$/);
      if (mShell) { pushCur(); cur = { kind: "shell", cmd: mShell[1], response: "" }; return; }
      if (mClaude) { pushCur(); cur = { kind: "claude", cmd: mClaude[1], response: "" }; return; }
      if (mIntro && !cur) { intro.push(mIntro[1]); return; }
      if (cur) { cur.response += (cur.response ? "\n" : "") + line; }
      else if (line.trim()) { intro.push(line); }
    });
    pushCur();
    var data = escAttr(JSON.stringify(steps));
    var introTxt = escAttr(intro.join("\n"));
    return '<div class="ccsim" data-ccsim data-steps="' + data + '" data-intro="' + introTxt + '">' +
      '<div class="ccsim-bar"><span class="ccsim-dots"><i></i><i></i><i></i></span><span class="ccsim-title">claude — simulated session</span><button class="ccsim-reset" type="button">↻ Reset</button></div>' +
      '<div class="ccsim-screen" data-screen></div>' +
      '<div class="ccsim-inputline"><span class="ccsim-prompt" data-prompt>❯</span><input class="ccsim-input" data-input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder=""><button class="ccsim-run" data-run type="button">Run ▶</button></div>' +
      '<div class="ccsim-note">Guided simulation — type the suggested command exactly, or leave the field blank and choose Run. Always run real commands in your own terminal.</div>' +
      "</div>";
  }

  // Stable short id from text, so saved state survives edits elsewhere in a lesson.
  function hash(s) {
    let h = 5381;
    for (let k = 0; k < s.length; k++) h = ((h << 5) + h + s.charCodeAt(k)) | 0;
    return (h >>> 0).toString(36);
  }

  // ```flashcards — "Q: front" then "A: back" (A: may continue on following lines).
  function renderFlashcards(code, ctx) {
    const cards = [];
    let cur = null;
    code.split("\n").forEach(function (raw) {
      const line = raw.trim();
      if (!line) return;
      const q = line.match(/^Q:\s*(.*)$/i), a = line.match(/^A:\s*(.*)$/i);
      if (q) { cur = { f: q[1], b: "" }; cards.push(cur); return; }
      if (a && cur) { cur.b = a[1]; return; }
      if (cur && cur.b) cur.b += " " + line;
    });
    const data = cards.filter(function (c) { return c.f && c.b; }).map(function (c) {
      return { id: (ctx.lessonId || "x") + ":" + hash(c.f), f: parseInline(c.f), b: parseInline(c.b) };
    });
    if (!data.length) return "";
    return '<div class="flash" data-flash data-cards="' + escAttr(JSON.stringify(data)) + '">' +
      '<div class="flash-head"><span class="flash-kicker">🃏 Flashcards</span><span class="flash-count">1 / ' + data.length + "</span></div>" +
      '<div class="flash-stage"></div></div>';
  }

  // ```order — "# prompt", then the items in the CORRECT order ("1. item"), then "> explanation".
  function renderOrder(code) {
    let title = "Put these in the right order.", explain = "";
    const items = [];
    code.split("\n").forEach(function (raw) {
      const line = raw.trim();
      if (!line) return;
      let m;
      if ((m = line.match(/^#\s*(.*)$/))) { title = m[1]; return; }
      if ((m = line.match(/^>\s*(.*)$/))) { explain += (explain ? " " : "") + m[1]; return; }
      if ((m = line.match(/^(?:\d+\.|[-*])\s+(.*)$/))) items.push(parseInline(m[1]));
    });
    if (items.length < 2) return "";
    return '<div class="order" data-order data-items="' + escAttr(JSON.stringify(items)) + '" data-explain="' + escAttr(parseInline(explain)) + '">' +
      '<div class="order-head"><span class="order-kicker">↕️ Put it in order</span></div>' +
      '<p class="order-title">' + parseInline(title) + "</p><ol class=\"order-list\"></ol>" +
      '<div class="order-actions"><button class="order-check btn-sm" type="button">Check order</button><span class="order-result" role="status"></span></div></div>';
  }

  // ```scenario — "S: situation", "Q: question", then options "+ best" "~ partial" "- poor", each followed by "> consequence".
  function renderScenario(code) {
    const blocks = [];
    let cur = null, opt = null;
    code.split("\n").forEach(function (raw) {
      const line = raw.trim();
      if (!line) return;
      let m;
      if ((m = line.match(/^S:\s*(.*)$/i))) { cur = { s: m[1], q: "", opts: [] }; blocks.push(cur); opt = null; return; }
      if (!cur) return;
      if ((m = line.match(/^Q:\s*(.*)$/i))) { cur.q = m[1]; return; }
      if ((m = line.match(/^([+~-])\s+(.*)$/))) { opt = { g: { "+": "best", "~": "okay", "-": "poor" }[m[1]], t: m[2], fb: "" }; cur.opts.push(opt); return; }
      if ((m = line.match(/^>\s*(.*)$/)) && opt) { opt.fb += (opt.fb ? " " : "") + m[1]; return; }
      if (!opt && !cur.q) cur.s += " " + line;
    });
    if (!blocks.length) return "";
    const letters = ["A", "B", "C", "D", "E", "F"];
    const verdict = { best: "Strong move.", okay: "Workable, but not the best.", poor: "This goes badly." };
    let h = '<div class="scenario"><div class="scn-head"><span class="scn-kicker">🧭 What would you do?</span></div>';
    blocks.forEach(function (b) {
      h += '<div class="scn" data-scn><p class="scn-situation">' + parseInline(b.s) + "</p>" + (b.q ? '<p class="scn-q">' + parseInline(b.q) + "</p>" : "") + '<div class="scn-opts">';
      b.opts.forEach(function (o, k) {
        h += '<button class="scn-opt" type="button" data-grade="' + o.g + '" data-i="' + k + '"><span class="opt-marker">' + (letters[k] || "•") + "</span><span>" + parseInline(o.t) + "</span></button>";
      });
      h += "</div>";
      b.opts.forEach(function (o, k) {
        h += '<div class="scn-fb scn-fb-' + o.g + '" data-for="' + k + '" hidden><strong>' + verdict[o.g] + "</strong> " + parseInline(o.fb) + "</div>";
      });
      h += "</div>";
    });
    return h + "</div>";
  }

  // ```reflect — the question. The learner's answer autosaves to their notebook.
  function renderReflect(code, ctx) {
    const q = code.trim().replace(/\s*\n\s*/g, " ");
    if (!q) return "";
    const id = (ctx.lessonId || "x") + ":" + hash(q);
    const dom = "reflect-" + hash(id);
    return '<div class="reflect" data-reflect data-id="' + escAttr(id) + '" data-q="' + escAttr(q) + '">' +
      '<label class="reflect-q" for="' + dom + '"><span class="reflect-kicker">🪞 Reflect</span>' + parseInline(q) + "</label>" +
      '<textarea class="reflect-input" id="' + dom + '" rows="4" placeholder="Write a few lines. It saves in this browser only."></textarea>' +
      '<div class="reflect-foot"><span class="reflect-status" aria-live="polite"></span><a href="#/notebook">Open your notebook →</a></div></div>';
  }

  // ```spot — "# instructions", then a draft where [[flawed text|why it is wrong]] marks each planted error.
  function renderSpot(code) {
    let title = "Some of these sentences should not survive a review. Select each one you would challenge, then check.";
    const body = [];
    code.split("\n").forEach(function (raw) {
      const m = raw.match(/^#\s*(.*)$/);
      if (m) title = m[1]; else body.push(raw);
    });
    const text = body.join(" ").replace(/\s+/g, " ").trim();
    const segs = [];
    text.split(/(\[\[[\s\S]*?\]\])/).forEach(function (part) {
      const f = part.match(/^\[\[([\s\S]*?)\|([\s\S]*?)\]\]$/);
      if (f) { segs.push({ t: f[1].trim(), why: f[2].trim() }); return; }
      part.split(/(?<=[.!?])\s+/).forEach(function (s) { if (s.trim()) segs.push({ t: s.trim() }); });
    });
    const flaws = segs.filter(function (s) { return s.why; }).length;
    if (!flaws) return "";
    let n = 0;
    let h = '<div class="spot" data-spot><div class="spot-head"><span class="spot-kicker">🔎 Find the flaws</span><span class="spot-meta">' + flaws + " planted errors</span></div>" +
      '<p class="spot-title">' + parseInline(title) + '</p><div class="spot-text">';
    segs.forEach(function (s) {
      h += '<span class="spot-seg" role="button" tabindex="0" aria-pressed="false" data-flaw="' + (s.why ? "1" : "0") + '"' + (s.why ? ' data-n="' + (++n) + '"' : "") + ">" + parseInline(s.t) + "</span> ";
    });
    h += '</div><div class="spot-actions"><button class="spot-check btn-sm" type="button">Check my review</button><span class="spot-result" role="status"></span></div><ol class="spot-why" hidden>';
    segs.forEach(function (s) { if (s.why) h += "<li>" + parseInline(s.why) + "</li>"; });
    return h + "</ol></div>";
  }

  // ```brief-check / ```claudemd-check — an editable box plus a heuristic checker (checkers.js).
  function renderLint(kind, code) {
    const brief = kind === "brief";
    const body = code.replace(/\n$/, "");
    const rows = Math.min(18, Math.max(brief ? 7 : 10, body.split("\n").length + 1));
    return '<div class="lint" data-lint="' + kind + '"><div class="lint-head"><span class="lint-kicker">' + (brief ? "🔍 Brief checker" : "🔍 CLAUDE.md checker") + "</span>" +
      '<span class="lint-note">Heuristic: it checks for signals, not quality</span></div>' +
      '<textarea class="lint-input" rows="' + rows + '" spellcheck="false" aria-label="' + (brief ? "Your brief" : "Your CLAUDE.md") + '" placeholder="' + (brief ? "Paste your brief here…" : "Paste your CLAUDE.md here…") + '">' + escapeHtml(body) + "</textarea>" +
      '<div class="lint-actions"><button class="lint-run btn-sm" type="button">Check it</button><span class="lint-privacy">Runs in your browser. Nothing is sent anywhere.</span></div><div class="lint-result" aria-live="polite"></div></div>';
  }

  function renderFence(lang, code, ctx) {
    lang = (lang || "").toLowerCase();
    if (lang === "quiz") return renderQuiz(code);
    if (lang === "prompt") return renderPrompt(code);
    if (lang === "claude-sim" || lang === "terminal") return renderSim(code);
    if (lang === "flashcards") return renderFlashcards(code, ctx);
    if (lang === "order") return renderOrder(code);
    if (lang === "scenario") return renderScenario(code);
    if (lang === "reflect") return renderReflect(code, ctx);
    if (lang === "spot") return renderSpot(code);
    if (lang === "brief-check") return renderLint("brief", code);
    if (lang === "claudemd-check") return renderLint("claudemd", code);
    const label = lang || "text";
    return '<div class="codeblock"><div class="codeblock-head"><span class="codeblock-lang">' + escapeHtml(label) +
      '</span><button class="copy-btn" type="button" data-copy>Copy</button></div><pre><code>' +
      escapeHtml(code.replace(/\n$/, "")) + "</code></pre></div>";
  }

  function renderContainer(type, title, body, ctx) {
    type = (type || "note").toLowerCase();
    if (type === "lab") {
      return '<div class="lab-box"><div class="lab-head"><span class="lab-badge">Lab</span><span class="lab-name">' +
        parseInline(title || "Hands-on lab") + '</span></div><div class="lab-body">' + render(body, ctx) + "</div></div>";
    }
    if (type === "details" || type === "faq") {
      return '<details class="accordion"><summary>' + parseInline(title || "Details") + '</summary><div class="acc-body">' + render(body, ctx) + "</div></details>";
    }
    const known = { tip: 1, note: 1, warning: 1, concept: 1, try: 1 };
    const cls = known[type] ? type : "note";
    return '<div class="callout ' + cls + '">' + (title ? '<p class="callout-title">' + parseInline(title) + "</p>" : "") + render(body, ctx) + "</div>";
  }

  function render(src, ctx) {
    ctx = ctx || {};
    if (ctx.checkIdx === undefined) ctx.checkIdx = 0;
    const lines = String(src).replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n");
    let i = 0;
    const out = [];
    while (i < lines.length) {
      const line = lines[i];
      if (/^\s*$/.test(line)) { i++; continue; }

      const fence = line.match(/^```(\s*[\w-]+)?\s*$/);
      if (fence) {
        const lang = (fence[1] || "").trim();
        const buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        out.push(renderFence(lang, buf.join("\n"), ctx));
        continue;
      }

      const cont = line.match(/^:::\s*(\w+)\s*(.*)$/);
      if (cont) {
        const type = cont[1];
        const title = cont[2].trim();
        const buf = [];
        let depth = 1;
        i++;
        while (i < lines.length) {
          if (/^:::\s*\w+/.test(lines[i])) { depth++; buf.push(lines[i]); i++; continue; }
          if (/^:::\s*$/.test(lines[i])) { depth--; if (depth === 0) { i++; break; } buf.push(lines[i]); i++; continue; }
          buf.push(lines[i]); i++;
        }
        out.push(renderContainer(type, title, buf.join("\n"), ctx));
        continue;
      }

      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { const lv = h[1].length; out.push("<h" + lv + ' id="' + slug(h[2]) + '">' + parseInline(h[2]) + "</h" + lv + ">"); i++; continue; }

      if (/^(\s*[-*_]){3,}\s*$/.test(line) && !/^\s*[-*+]\s/.test(line)) { out.push("<hr>"); i++; continue; }

      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
        out.push("<blockquote>" + render(buf.join("\n"), ctx) + "</blockquote>");
        continue;
      }

      if (line.includes("|") && i + 1 < lines.length && /-/.test(lines[i + 1]) && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
        const buf = [line];
        i++;
        buf.push(lines[i]); i++;
        while (i < lines.length && lines[i].includes("|") && !/^\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        out.push(renderTable(buf));
        continue;
      }

      if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && !/^\s*$/.test(lines[i]) && (/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) || /^\s+\S/.test(lines[i]))) { buf.push(lines[i]); i++; }
        out.push(renderList(buf, ctx));
        continue;
      }

      const buf = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !isBlockStart(lines[i])) { buf.push(lines[i]); i++; }
      if (!buf.length) { buf.push(lines[i]); i++; } // a block-start line no handler consumed: emit as text rather than loop forever
      out.push("<p>" + parseInline(buf.join("\n").trim()).replace(/\n/g, " ") + "</p>");
    }
    return out.join("\n");
  }

  window.MD = { render: render, slug: slug, parseInline: parseInline, hash: hash };
})();
