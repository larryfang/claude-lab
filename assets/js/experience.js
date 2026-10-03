/* Guided practice and session planning. All examples are fictional;
   checks run locally and never call a model or send entered text. */
(function () {
  "use strict";
  var paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6", book: "M12 6v15M3 4c3-1 6 0 9 2 3-2 6-3 9-2v15c-3-1-6 0-9 2-3-2-6-3-9-2Z",
    code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16", grid: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z",
    check: "m5 12 4 4L19 6", clock: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    repeat: "m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3",
    note: "M4 3h16v18H4ZM8 7h8M8 11h8M8 15h5", chart: "M4 3v18h17M8 16v-4m5 4V8m5 8V5",
    focus: "M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5M8 8h8v8H8Z", play: "m9 5 11 7-11 7Z",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5", spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"
  };
  function icon(name) { return '<svg class="ui-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (paths[name] || paths.grid) + '"></path></svg>'; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  var sample = "I run Sales Ops; this is for our weekly deal review.\n\nProduce output/deal-review.md with a recorded-value total, a deal table and an exceptions section.\n\nUse only practice-pipeline.csv. Do not use the web.\n\nNever estimate a missing amount. Write only to output/ and leave the source unchanged.\n\nFlag every missing amount by deal ID. Show me the plan before you start. I will check the total and every exception against the CSV before sharing.";
  var csv = "deal_id,account,amount_usd,stage\nD-01,Alder,12000,Proposal\nD-02,Birch,18000,Discovery\nD-03,Larch,,Negotiation\n";
  var feedback = [
    { good: false, reason: "The two recorded amounts add to $30,000. D-03 has no amount. $42,000 fills that gap without evidence.", label: "The pipeline is worth $42,000." },
    { good: true, reason: "There are three deal records. D-03 has a blank amount, so the full pipeline value is unknown.", label: "Three deals; one amount is not recorded." },
    { good: false, reason: "A negotiation stage is not a commitment. This file contains no promised close date.", label: "Larch will close this Friday." }
  ];
  function preview(full) {
    var id = full ? "full" : "preview";
    return '<section class="practice-studio hero-visual' + (full ? ' is-full' : '') + '" aria-label="Interactive practice example">' +
      '<div class="studio-chrome"><span class="studio-mark">' + icon("spark") + '</span><span>THE PRACTICE STUDIO</span><span class="studio-label">Fictional example</span></div>' +
      '<div class="studio-tabs" role="tablist" aria-label="Practice steps">' + ["Brief", "Plan", "Verify"].map(function (label, n) {
        return '<button type="button" role="tab" id="' + id + '-tab-' + n + '" aria-controls="' + id + '-panel-' + n + '" aria-selected="' + (n === 0) + '" tabindex="' + (n === 0 ? '0' : '-1') + '" data-studio-tab="' + n + '"><span>0' + (n + 1) + '</span>' + label + '</button>';
      }).join("") + '</div>' +
      '<div class="studio-panel" role="tabpanel" id="' + id + '-panel-0" aria-labelledby="' + id + '-tab-0" tabindex="0">' +
        '<div class="studio-panel-title"><span class="micro-label">THE JOB</span><span class="file-label">deal-review.md</span></div><h3>A useful result starts<br>with a clear brief.</h3>' +
        '<div class="brief-switch" role="group" aria-label="Compare briefs"><button type="button" data-brief-mode="vague" aria-pressed="false">Vague request</button><button type="button" data-brief-mode="clear" aria-pressed="true">Clear brief</button></div>' +
        '<div class="studio-brief" data-brief-copy><p><b>Result</b> A deal table, recorded-value total and exceptions.</p><p><b>Sources</b> Only <code>practice-pipeline.csv</code>.</p><p><b>Boundaries</b> Keep the source intact. Never fill a missing amount.</p><p><b>Review</b> Show the plan. Flag gaps by deal ID.</p></div>' +
        '<p class="studio-hint" data-brief-hint>Specific enough to act on. Concrete enough to check.</p><button class="studio-next" type="button" data-studio-next="1">Inspect the plan ' + icon("arrow") + '</button></div>' +
      '<div class="studio-panel" role="tabpanel" id="' + id + '-panel-1" aria-labelledby="' + id + '-tab-1" tabindex="0" hidden>' +
        '<span class="micro-label">BEFORE THE WORK STARTS</span><h3>A checkpoint,<br>not a leap of faith.</h3><ol class="studio-plan"><li><span>1</span><div><strong>Read the named source</strong><small>Three deal records. One blank amount.</small></div></li><li><span>2</span><div><strong>Keep the gaps visible</strong><small>Sum recorded values; flag D-03 separately.</small></div></li><li><span>3</span><div><strong>Write, then reconcile</strong><small>Check each claim against its source row.</small></div></li></ol><p class="studio-hint">Guided example: no agent or file changes are running.</p><button class="studio-next" type="button" data-studio-next="2">Question the output ' + icon("arrow") + '</button></div>' +
      '<div class="studio-panel" role="tabpanel" id="' + id + '-panel-2" aria-labelledby="' + id + '-tab-2" tabindex="0" hidden>' +
        '<div class="studio-panel-title"><span class="micro-label">YOUR REVIEW</span><span class="review-tally">0 / 3 checked</span></div><h3>Sounds plausible.<br>Is it supported?</h3>' +
        '<details class="studio-source"' + (full ? ' open' : '') + '><summary>Open the source · 3 records</summary><div class="source-table"><table><caption>Fictional pipeline · USD</caption><thead><tr><th>Deal</th><th>Amount</th><th>Stage</th></tr></thead><tbody><tr><td>D-01 · Alder</td><td>12,000</td><td>Proposal</td></tr><tr><td>D-02 · Birch</td><td>18,000</td><td>Discovery</td></tr><tr><td>D-03 · Larch</td><td>Not recorded</td><td>Negotiation</td></tr></tbody></table></div></details>' +
        '<p class="studio-instruction">Decide whether each claim has support in the file.</p><div class="studio-claims">' + feedback.map(function (f, n) {
          return '<div class="studio-claim" data-claim="' + n + '"><p>' + esc(f.label) + '</p><div class="claim-actions"><button type="button" data-verdict="supported" aria-label="Claim ' + (n + 1) + ': supported">Supported</button><button type="button" data-verdict="unsupported" aria-label="Claim ' + (n + 1) + ': unsupported">Unsupported</button></div><p class="claim-feedback" role="status" hidden></p></div>';
        }).join("") + '</div><div class="studio-review-done" role="status" hidden><strong>That is the habit to keep.</strong><p>Trace the total. Preserve the gap. Check the promise.</p><a href="#/cowork/the-brief">Build your next brief ' + icon("arrow") + '</a></div></div>' +
      '<div class="studio-foot"><span>' + icon("play") + ' Try it here · no Claude account needed</span>' + (full ? '<button type="button" data-studio-reset>Start again</button>' : '<a href="#/studio">Open studio ' + icon("arrow") + '</a>') + '</div></section>';
  }
  function wireStudio(root) {
    var tabs = Array.from(root.querySelectorAll('[data-studio-tab]'));
    var panels = Array.from(root.querySelectorAll('[role=tabpanel]'));
    function select(n, focus) {
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === n)); t.tabIndex = k === n ? 0 : -1; panels[k].hidden = k !== n; });
      if (focus) tabs[n].focus();
    }
    tabs.forEach(function (t, n) {
      t.addEventListener('click', function () { select(n, false); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? (n + 1) % 3 : e.key === 'ArrowLeft' ? (n + 2) % 3 : e.key === 'Home' ? 0 : e.key === 'End' ? 2 : null;
        if (k !== null) { e.preventDefault(); e.stopPropagation(); select(k, true); }
      });
    });
    root.querySelectorAll('[data-studio-next]').forEach(function (b) { b.addEventListener('click', function () { select(Number(b.dataset.studioNext), true); }); });
    var clear = root.querySelector('[data-brief-copy]').innerHTML;
    function setBrief(mode) {
      root.querySelectorAll('[data-brief-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.briefMode === mode)); });
      root.querySelector('[data-brief-copy]').innerHTML = mode === 'clear' ? clear : '<p class="vague-brief">“Look at my pipeline and make a great deal review. Be accurate.”</p>';
      root.querySelector('[data-brief-hint]').textContent = mode === 'clear' ? 'Specific enough to act on. Concrete enough to check.' : 'Which file? What result? What happens when an amount is missing?';
    }
    root.querySelectorAll('[data-brief-mode]').forEach(function (b) { b.addEventListener('click', function () { setBrief(b.dataset.briefMode); }); });
    var answered = {}, recordedCompletion = false;
    root.querySelectorAll('[data-verdict]').forEach(function (b) {
      b.addEventListener('click', function () {
        var claim = b.closest('[data-claim]'), n = Number(claim.dataset.claim), f = feedback[n];
        var right = (b.dataset.verdict === 'supported') === f.good;
        var out = claim.querySelector('.claim-feedback'); out.hidden = false; out.textContent = (right ? 'Correct. ' : 'Look again. ') + f.reason;
        claim.dataset.result = right ? 'correct' : 'retry';
        claim.querySelectorAll('[data-verdict]').forEach(function (v) { v.setAttribute('aria-pressed', String(v === b)); });
        if (right) answered[n] = true; else delete answered[n];
        var count = Object.keys(answered).length;
        root.querySelector('.review-tally').textContent = count + ' / 3 checked';
        root.querySelector('.studio-review-done').hidden = count !== 3;
        if (count === 3 && !recordedCompletion) { recordedCompletion = true; if (window.ACCOUNT) window.ACCOUNT.record({type:'studio',done:true}); }
      });
    });
    var reset = root.querySelector('[data-studio-reset]');
    if (reset) reset.addEventListener('click', function () {
      answered = {}; recordedCompletion = false; select(0, true); setBrief('clear');
      root.querySelector('.review-tally').textContent = '0 / 3 checked';
      root.querySelector('.studio-review-done').hidden = true;
      root.querySelectorAll('[data-claim]').forEach(function (c) { delete c.dataset.result; c.querySelector('.claim-feedback').hidden = true; });
      root.querySelectorAll('[data-verdict]').forEach(function (b) { b.removeAttribute('aria-pressed'); });
    });
  }

  var goals = [
    { id: 'essentials', label: 'Start with the basics', course: 'cowork', path: 'essentials', outcome: 'Write a clear brief and review the result.' },
    { id: 'sales', label: 'Sales & RevOps', course: 'cowork', path: 'sales', outcome: 'Build a deal review you can defend.' },
    { id: 'gtm', label: 'Marketing & GTM', course: 'cowork', path: 'gtm', outcome: 'Create a launch kit with traceable claims.' },
    { id: 'product', label: 'Product', course: 'cowork', path: 'product', outcome: 'Turn customer research into a grounded PRD.' },
    { id: 'finance', label: 'Finance', course: 'cowork', path: 'finance', outcome: 'Reconcile a variance pack back to its inputs.' },
    { id: 'code', label: 'Build with code', course: 'claude-code', path: 'foundations', outcome: 'Plan a change, verify it, and review the diff.' }
  ];
  function planner() {
    return '<section class="session-planner" aria-labelledby="plannerTitle"><div class="planner-intro"><span class="micro-label">MAKE IT YOURS</span><h2 id="plannerTitle">A little time. <br>A useful next step.</h2><p>Choose your work and the time you have. We’ll find a place to start.</p></div><div class="planner-controls"><label for="learningGoal">I want to practise</label><select id="learningGoal">' + goals.map(function (g) { return '<option value="' + g.id + '">' + g.label + '</option>'; }).join('') + '</select><label for="learningTime">Time for this session</label><select id="learningTime"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select></div><div class="planner-result" id="sessionRecommendation" aria-live="polite" aria-atomic="true"></div></section>';
  }
  function wirePlanner(api) {
    var goal = document.getElementById('learningGoal'), time = document.getElementById('learningTime'); if (!goal) return;
    var prefs = api.store.learning || {};
    if (goals.some(function (g) { return g.id === prefs.goal; })) goal.value = prefs.goal;
    if (['15', '30', '60'].indexOf(String(prefs.minutes)) !== -1) time.value = String(prefs.minutes);
    function update() {
      api.store.learning = { goal: goal.value, minutes: Number(time.value) }; api.save();
      var g = goals.filter(function (x) { return x.id === goal.value; })[0], c = api.byId[g.course];
      var p = c.fastPaths.filter(function (x) { return x.id === g.path; })[0];
      var pending = p.lessons.filter(function (id) { return !api.cstate(c.id).completed[id]; });
      var ids = pending.length ? pending : p.lessons, picked = [], mins = 0, limit = Number(time.value);
      ids.some(function (id) {
        var l = c.modules.flatMap(function (m) { return m.lessons; }).filter(function (x) { return x.id === id; })[0];
        if (mins + l.minutes > limit && picked.length) return true;
        picked.push(l); mins += l.minutes; return mins >= limit;
      });
      var first = picked[0], allDone = !pending.length;
      document.getElementById('sessionRecommendation').innerHTML = '<span class="micro-label">' + (allDone ? 'REVISIT YOUR ROUTE' : 'YOUR NEXT SESSION') + '</span><h3>' + esc(first.title) + '</h3><p class="session-estimate">' + icon('clock') + ' About ' + mins + ' min · ' + picked.length + (picked.length === 1 ? ' lesson' : ' lessons') + '</p>' +
        '<p class="session-first">' + (picked.length > 1 ? 'Then: ' + picked.slice(1).map(function (l) { return esc(l.title); }).join(' → ') : esc(first.summary)) + (mins > limit ? ' This lesson is longer than your time slot; pause whenever you need.' : '') + '</p><a class="btn btn-primary" href="' + api.pathLessonHref(c.id, first.id, p.id, allDone ? null : picked.map(function (l) { return l.id; }).join(',')) + '">' + (allDone ? 'Review' : 'Start this session') + ' ' + icon('arrow') + '</a><a class="session-route" href="#/' + c.id + '/path/' + p.id + '">Full route · ' + api.fastPathMinutes(c, p) + ' min ' + icon('arrow') + '</a><p class="session-note">Route outcome: ' + esc(g.outcome) + (allDone ? ' Review at your pace, or choose another route.' : ' Finish this session, then decide when to continue the route.') + '</p>';
    }
    goal.addEventListener('change', update); time.addEventListener('change', update); update();
    var jump = document.querySelector('[data-open-planner]');
    if (jump) jump.addEventListener('click', function () { goal.focus({ preventScroll: true }); document.querySelector('.session-planner').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); });
    if (jump && new URLSearchParams(location.hash.split('?')[1] || '').get('plan') === '1') jump.click();
  }

  function studioPage(api) {
    document.getElementById('content').innerHTML = '<section class="studio-page-hero"><span class="hero-eyebrow">' + icon('spark') + ' A SMALL JOB. THE WHOLE LOOP.</span><h1>Make a brief.<br><em>Keep your judgment.</em></h1><p>Compare two requests, inspect the plan, then catch the unsupported claims. Everything here runs in your browser with fictional practice data.</p></section><div class="studio-workspace">' + preview(true) + '<aside class="studio-workbench"><span class="micro-label">TAKE IT INTO CLAUDE</span><h2>Your first practice kit.</h2><p>Download the three-record CSV. Copy this brief, place the file in a safe practice folder, and compare Claude’s result against the same source.</p><button class="btn btn-ghost" id="practiceDownload" type="button">' + icon('download') + ' Download practice CSV</button><label for="practiceBrief">Your brief · edit before copying</label><textarea id="practiceBrief" rows="12">' + esc(sample) + '</textarea><div class="workbench-actions"><button class="btn btn-primary" id="practiceCopy" type="button">Copy brief</button><button class="btn btn-ghost" id="practiceCheck" type="button">Check signals</button></div><div id="practiceCheckResult" class="practice-check-result" role="status"></div><p class="workbench-note">The checker looks for B.R.I.E.F. signals. It cannot judge correctness or guarantee that Claude follows the brief.</p><a href="#/cowork/lab-setup">Set up your safe workspace ' + icon('arrow') + '</a></aside></div>';
    wireStudio(document.querySelector('.practice-studio'));
    document.getElementById('practiceDownload').addEventListener('click', function () { api.download('practice-pipeline.csv', 'text/csv', csv); api.toast('Practice CSV downloaded'); });
    document.getElementById('practiceCheck').addEventListener('click', function () {
      var result = window.CHECKERS.brief(document.getElementById('practiceBrief').value);
      document.getElementById('practiceCheckResult').textContent = result.score + ' / 5 signals found. ' + (result.score === 5 ? 'Now read it for ambiguity and define what you will check.' : 'Add: ' + result.letters.filter(function (l) { return !l.ok; }).map(function (l) { return l.name; }).join(', ') + '.');
    });
    document.getElementById('practiceCopy').addEventListener('click', function () {
      var box = document.getElementById('practiceBrief');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(box.value).then(function () { api.toast('Brief copied'); }).catch(fallback);
      else fallback();
      function fallback() { box.focus(); box.select(); api.toast('Brief selected — use your device’s Copy action'); }
    });
  }
  function orientLesson(l, m) {
    var article = document.querySelector('article.lesson'); if (!article) return;
    var summary = document.createElement('section'); summary.className = 'lesson-orientation'; summary.setAttribute('aria-label', 'Lesson overview');
    var activities = [ ['.quiz-q', 'question'], ['.ccsim', 'guided simulation'], ['[data-scn]', 'scenario'], ['.order, .spot, .lint', 'practice check'], ['.reflect', 'reflection'] ].map(function (a) { var n = article.querySelectorAll(a[0]).length; return n ? n + ' ' + a[1] + (n === 1 ? '' : 's') : ''; }).filter(Boolean);
    summary.innerHTML = '<div><span class="micro-label">' + (/reference/i.test(m.id) ? 'KEEP WITHIN REACH' : 'IN THIS LESSON') + '</span><p>' + esc(l.summary) + '</p></div><span class="lesson-activity-label">' + (activities.length ? activities.join(' · ') : 'Read, then apply it to your work') + '</span>';
    var title = article.querySelector('h1'); if (title) title.insertAdjacentElement('afterend', summary);
    if (/reference/i.test(m.id)) return;
    var questions = {
      'start-here': ['What result would make this task useful to you?', 'Which decision should Claude bring back to you before acting?'],
      fundamentals: ['Could someone else follow your brief without guessing the result or permitted sources?', 'What evidence would make you reject a plausible-looking output?'],
      connect: ['Did the connector retrieve the records and date range this task actually needs?', 'What happens when access is missing or a source contradicts another?'],
      sales: ['Can you trace each deal amount and commitment to the source record?', 'Does the recommendation separate observed facts from your interpretation?'],
      gtm: ['Which claims need a dated source before this reaches a customer?', 'Are quotes verbatim and attributed, with assumptions clearly labelled?'],
      product: ['Can you trace the proposed requirement to an interview, ticket or agreed goal?', 'Which contradictory evidence or minority need could this synthesis hide?'],
      finance: ['Do the totals reconcile, and are missing values and exclusions accounted for?', 'Which formula or assumption could change the decision if it is wrong?'],
      repeatable: ['Did you test the repeatable workflow on a case it might get wrong?', 'What will tell the owner that an input, permission or output has changed?'],
      trust: ['Which decision-critical claims did you verify directly?', 'Are unresolved flags visible, with an owner who can decide what happens next?'],
      capstone: ['Can you show the input, result, checks and a correction you made?', 'Could the next person repeat the task and recognize a bad result?'],
      'cc-foundations': ['Have you stated the observable result and the project context it needs?', 'What will you inspect beyond the agent’s claim that it is done?'],
      'cc-context-mod': ['Is the context current and relevant to this task?', 'Which assumption in memory or project instructions should you verify?'],
      'cc-workflow-mod': ['Did the checks run, cover the failure case, and test the intended behaviour?', 'Does the diff solve the reported problem without unrelated changes?'],
      'cc-customize-mod': ['Did you test this configuration on a case that could fail?', 'Does it load or trigger where you expect, with the intended permissions?'],
      'cc-scale-mod': ['What proves each parallel or automated task produced the intended result?', 'How will you detect a failed run or conflicting edit before release?'],
      'cc-finish-mod': ['Can you show runtime behaviour, failure recovery and the reviewed diff?', 'Can another developer reproduce the checks from your handover?']
    };
    var q = questions[m.id]; if (!q) return;
    var check = document.createElement('details'); check.className = 'judgment-check';
    check.innerHTML = '<summary>' + icon('check') + '<span>Before you move on: question the result</span></summary><div><p>Apply these questions to a task from your own work. A completed lesson records your activity here; your evidence is what shows whether the work is ready.</p><ol>' + q.map(function (text) { return '<li>' + esc(text) + '</li>'; }).join('') + '</ol></div>';
    document.querySelector('.lesson-foot').insertAdjacentElement('beforebegin', check);
  }
  window.EXPERIENCE = { icon: icon, preview: preview, wireStudio: wireStudio, planner: planner, wirePlanner: wirePlanner, studioPage: studioPage, orientLesson: orientLesson };
})();
