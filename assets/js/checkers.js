/* ============================================================
   Claude Lab — heuristic checkers
   Deterministic signal checks for a Cowork brief (B.R.I.E.F.) and
   a CLAUDE.md file. They look for signals, not quality: a 5/5
   brief can still be vague. The UI says so.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- B.R.I.E.F. ---------- */
  var LETTERS = [
    { key: "B", name: "Background", re: /\b(i am|i'm|i work|i run|i lead|we are|we're|we ran|our (team|company|customers?|product|aes?|reps?)|my (team|role|manager|boss)|this is for|for (my|our|the) (vp|cfo|ceo|execs?|leadership|team|manager|board|customers?|aes?))\b/i,
      hint: "Add two or three sentences: who you are, the situation, and who will read the result." },
    { key: "R", name: "Result", re: /(\b[\w\-\/]+\.(md|csv|xlsx|docx|pptx|pdf|html|json|txt)\b)|\b(produce|create|deliver|build|draft|write)\b[\s\S]{0,160}\b(sections?|table|columns?|slides?|tabs?|bullets?|headline|one-pager|deck|spreadsheet|workbook)\b/i,
      hint: "Name the artefact: the file name, the format, and the sections in order (for example `output/deal-review.md`)." },
    { key: "I", name: "Inputs", re: /\b(using only|use only|only use|only the|sources?|connectors?|transcripts?|exports?|the files? in|attached|do not use the web|don't use the web|from the crm)\b|`[\w\-.]+\/`/i,
      hint: "Say which sources to use (a folder, an export, a connector) and which to ignore. \"Use only …\" makes every claim checkable." },
    { key: "E", name: "Edges", re: /\b(never|do not|don't|must not|must|write only|only write|no more than|at most|rules?:|limit)\b/i,
      hint: "Add the rules that prevent your costly failures: \"Never estimate a missing number — write 'not recorded'\", \"Write only to `output/`\"." },
    { key: "F", name: "Flag", re: /\b(flag|surface|call out|tell me (about|if|where|when)|list (any|every|each)|ask me|before you start|show me (your|the) plan|wait for my)\b/i,
      hint: "Tell it what to surface instead of deciding silently: contradictions, exclusions, inferences. Ask to see the plan first." }
  ];
  var WISHES = ["be accurate", "be careful", "high quality", "make it good", "best possible", "be thorough", "do a good job", "make it great"];

  function brief(text) {
    text = String(text || "");
    var words = (text.trim().match(/\S+/g) || []).length;
    var letters = LETTERS.map(function (l) { return { key: l.key, name: l.name, ok: words > 0 && l.re.test(text), hint: l.hint }; });
    var warnings = [];
    if (words > 0 && words < 40) warnings.push("Very short (" + words + " words). Most briefs that work first time run 120–250 words.");
    WISHES.forEach(function (w) { if (text.toLowerCase().indexOf(w) !== -1) warnings.push("“" + w + "” is a wish, not an instruction. Say what it means here: which source, which check, which limit."); });
    if (words > 0 && !/\b(\w+\.(md|csv|xlsx|docx|pptx))\b/i.test(text)) warnings.push("No file name. Naming the output file makes the result concrete and easy to find.");
    return { score: letters.filter(function (l) { return l.ok; }).length, total: 5, letters: letters, warnings: warnings, words: words };
  }

  /* ---------- CLAUDE.md ---------- */
  var VAGUE = /(write (clean|good|readable|nice) code|follow (the )?best practices|be careful|make sure (it|everything) works|use common sense|keep (it|things) simple|high[- ]quality code|as needed|when appropriate)/i;
  var SECRET = /(sk-ant-[A-Za-z0-9_-]{10,}|\bsk-[A-Za-z0-9]{20,}|\bAKIA[0-9A-Z]{16}\b|\bgh[pousr]_[A-Za-z0-9]{20,}|\b(api[_-]?key|password|passwd|secret|token)\b\s*[:=]\s*["']?[^\s"']{6,})/i;
  var COMMANDS = /\b(npm|pnpm|yarn|bun|npx|uv|pip|pytest|make|cargo|go (test|build|run|vet)|mvn|gradle|gradlew|rake|bundle|dotnet|poetry|tox|jest|vitest|ruff|eslint|tsc|swift (build|test)|xcodebuild|flutter)\b/;
  var SHOUT = /\b(IMPORTANT|MUST|NEVER|ALWAYS|CRITICAL|MANDATORY|REQUIRED)\b/g;

  function claudemd(text) {
    text = String(text || "");
    var lines = text ? text.replace(/\r\n?/g, "\n").split("\n") : [];
    if (lines.length && lines[lines.length - 1] === "") lines.pop();
    var n = lines.length, checks = [];
    function add(id, label, level, detail) { checks.push({ id: id, label: label, level: level, detail: detail }); }
    function where(re) { var hits = []; lines.forEach(function (l, i) { if (re.test(l)) hits.push(i + 1); }); return hits; }

    add("length", "Length", n <= 200 ? "pass" : n <= 300 ? "warn" : "fail",
      n + " lines. " + (n <= 200 ? "Under the 200-line guideline — every line is loaded every session." : "Every line loads every session and competes with your task. Cut to under 200: move rarely-needed detail into @-imported files or skills."));

    add("commands", "Build & test commands", COMMANDS.test(text) ? "pass" : "warn",
      COMMANDS.test(text) ? "Exact commands are present, so Claude can verify its own work." : "No build, test or lint command found. Claude cannot guess them — add the exact commands.");

    var vague = where(VAGUE);
    add("vague", "Specific rules", vague.length ? "warn" : "pass",
      vague.length ? vague.slice(0, 4).map(function (ln) { return "Line " + ln + ": “" + lines[ln - 1].match(VAGUE)[0] + "” — say exactly what you mean, or cut it."; }).join(" ") : "No generic advice found. Generic rules cost context and change nothing.");

    var shouted = (text.match(SHOUT) || []).length;
    add("emphasis", "Emphasis", shouted >= 5 ? "warn" : "pass",
      shouted >= 5 ? shouted + " shouted words (IMPORTANT, MUST, NEVER…). When everything is urgent, nothing is — keep emphasis for the one or two rules that really bite." : "Emphasis is used sparingly.");

    var secret = where(SECRET);
    add("secrets", "No secrets", secret.length ? "fail" : "pass",
      secret.length ? "Line " + secret[0] + " looks like a credential. CLAUDE.md is committed and read every session — move it to an environment variable and rotate it." : "No credentials found.");

    var tree = where(/[├└]──|^\s*[│|]\s{2,}/);
    add("tree", "Nothing discoverable", tree.length >= 3 ? "warn" : "pass",
      tree.length >= 3 ? "A directory tree (line " + tree[0] + "). Claude can list files itself; keep only the locations it would not find." : "No pasted directory tree.");

    var gotchas = /\b(gotcha|watch out|don't|do not|never|avoid|instead of|prefer|rather than)\b/i.test(text.replace(SHOUT, ""));
    add("gotchas", "Project gotchas", gotchas ? "pass" : "warn",
      gotchas ? "Has project-specific rules — the things Claude would get wrong unprompted." : "No gotchas. The highest-value lines are the ones Claude would get wrong without being told.");

    // A paragraph is consecutive prose lines (not list, heading, quote, table, tree or code); long ones get skimmed.
    var longest = 0, at = 0, words = 0, start = 0, fence = false;
    lines.forEach(function (l, i) {
      if (/^\s*```/.test(l)) { fence = !fence; words = 0; return; }
      var prose = !fence && l.trim() && !/^\s*([-*+]|\d+\.|#|>|\||[├└│])/.test(l);
      if (!prose) { words = 0; return; }
      if (!words) start = i + 1;
      words += (l.match(/\S+/g) || []).length;
      if (words > longest) { longest = words; at = start; }
    });
    add("prose", "Scannable", longest > 40 ? "warn" : "pass",
      longest > 40 ? "Paragraph at line " + at + " is " + longest + " words. Split it into short bullets — they are easier for Claude to follow and for you to prune." : "Short lines and bullets.");

    var heads = where(/^#{1,3}\s/).length;
    add("headings", "Structure", heads >= 2 || n < 15 ? "pass" : "warn",
      heads >= 2 || n < 15 ? "Organised under headings." : "Add headings (Commands, Conventions, Gotchas) so rules are easy to find and prune.");

    return { score: checks.filter(function (c) { return c.level === "pass"; }).length, total: checks.length, checks: checks, lines: n };
  }

  /* ---------- UI ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function inline(s) { return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>"); }
  var ICON = { pass: "✓", warn: "!", fail: "✕" };

  function renderBrief(r) {
    var h = '<div class="lint-score"><span class="lint-num">' + r.score + " / 5</span><span>" +
      (r.score === 5 ? "All five signals present. Now reread it as the person receiving it: is anything still vague?" : "Missing " + (5 - r.score) + (5 - r.score === 1 ? " letter" : " letters") + ". Fix the brief, then check again.") + "</span></div>";
    h += '<div class="lint-letters">' + r.letters.map(function (l) {
      return '<span class="lint-letter ' + (l.ok ? "ok" : "miss") + '" title="' + l.name + '"><b>' + l.key + "</b><small>" + l.name + "</small></span>";
    }).join("") + "</div>";
    var todo = r.letters.filter(function (l) { return !l.ok; }).map(function (l) { return "<li><strong>" + l.name + ".</strong> " + inline(l.hint) + "</li>"; });
    var warn = r.warnings.map(function (w) { return '<li class="lint-warn">' + inline(w) + "</li>"; });
    if (todo.length || warn.length) h += '<ul class="lint-list">' + todo.join("") + warn.join("") + "</ul>";
    return h;
  }
  function renderMd(r) {
    var h = '<div class="lint-score"><span class="lint-num">' + r.score + " / " + r.total + "</span><span>" + r.lines + " lines checked.</span></div>";
    h += '<ul class="lint-checks">' + r.checks.map(function (c) {
      return '<li class="lint-check ' + c.level + '"><span class="lint-icon" aria-hidden="true">' + ICON[c.level] + '</span><span><strong>' + c.label + "</strong> " + inline(c.detail) + "</span></li>";
    }).join("") + "</ul>";
    return h;
  }

  function wire(scope, api) {
    Array.prototype.slice.call(scope.querySelectorAll("[data-lint]")).forEach(function (root, n) {
      var kind = root.dataset.lint, box = root.querySelector("textarea"), out = root.querySelector(".lint-result");
      var key = api.lesson + ":lint:" + n;
      root.querySelector(".lint-run").addEventListener("click", function () {
        var r = kind === "brief" ? brief(box.value) : claudemd(box.value);
        out.innerHTML = kind === "brief" ? renderBrief(r) : renderMd(r);
        api.touch();
        var passed = kind === "brief" ? r.score === 5 : r.score >= r.total - 1 && !r.checks.some(function (c) { return c.level === "fail"; });
        if (passed && !api.state.ex[key]) { api.state.ex[key] = 1; api.toast(kind === "brief" ? "🔍 All five letters present" : "🔍 That CLAUDE.md is in good shape"); }
        api.save();
      });
    });
  }

  window.CHECKERS = { brief: brief, claudemd: claudemd, wire: wire };
})();
