/* =====================================================================
   QUIZ « Quel perso dois-tu jouer ? » — MOTEUR EN ENTONNOIR + ÉCRANS
   ---------------------------------------------------------------------
   Les questions et les textes sont dans quiz-data.js.
   Fonctionnement :
     1. Tri        : 6 questions, une par grand axe (rôle, portée, groupe,
                     PvP/PvE, tempo, complexité), tirées au hasard.
     2. Affinage   : 10 à 13 questions choisies parce qu'elles séparent le
                     mieux les spécialisations encore en tête.
     3. Confirmation : 2 à 3 mises en situation entre les 3 meilleures classes.
     4. Race       : 3 à 4 questions, seulement entre races compatibles.
   Total : 18 à 25 questions. Les points sont secrets (rien n'est affiché).
   ===================================================================== */
(function (root) {
  'use strict';
  const D = root.MVS_QUIZ_DATA || (typeof require !== 'undefined' ? require('./quiz-data.js') : null);
  if (!D) return;

  /* ---------- Réglages de l'entonnoir ---------- */
  const CFG = {
    TRI_NEEDS: ['role', 'portee', 'groupe', 'mode', 'tempo', 'complexite'],
    AFF_MIN: 10, AFF_MAX: 13,     // questions d'affinage
    CONF_MIN: 2, CONF_MAX: 3,     // questions de confirmation
    RACE_MIN: 3, RACE_MAX: 4,     // questions de race
    TOTAL_MIN: 18, TOTAL_MAX: 25,
    MARGE_NETTE: 0.10,            // avance qui permet de s'arrêter plus tôt
    W_DIRECT: 0.45,               // poids des bonus directs de classe/spé
    MAX_PAR_BESOIN: 2,            // questions équivalentes posées au maximum
  };
  const AXES = D.AXES;
  const ALIAS = { distance: ['contact', -1], groupe: ['solo', -1], pve: ['pvp', -1], patient: ['explosif', -1], simple: ['complexe', -1] };
  const CLASS_IDS = Object.keys(D.CLASSES);
  const RACE_IDS = Object.keys(D.RACES);

  /* ---------- Lecture des effets (« axe+2 c.mage+1 s.mage.feu+2 ») ---------- */
  function parseFx(str) {
    const fx = { ax: new Float64Array(AXES.length), c: {}, s: {} };
    for (const tok of String(str || '').trim().split(/\s+/).filter(Boolean)) {
      const m = tok.match(/^(.+?)([+-]\d+(?:\.\d+)?)$/);
      if (!m) throw new Error('Effet illisible : ' + tok);
      let key = m[1], v = parseFloat(m[2]);
      if (key.startsWith('c.')) { const c = key.slice(2); if (!D.CLASSES[c]) throw new Error('Classe inconnue : ' + tok); fx.c[c] = (fx.c[c] || 0) + v; continue; }
      if (key.startsWith('s.')) { const s = key.slice(2); if (!D.SPECS[s]) throw new Error('Spé inconnue : ' + tok); fx.s[s] = (fx.s[s] || 0) + v; continue; }
      if (ALIAS[key]) { v *= ALIAS[key][1]; key = ALIAS[key][0]; }
      const i = AXES.indexOf(key); if (i < 0) throw new Error('Axe inconnu : ' + tok);
      fx.ax[i] += v;
    }
    return fx;
  }
  const unit = v => { const n = Math.hypot(...v) || 1; return Array.from(v, x => x / n); };
  const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

  const SPECS = Object.entries(D.SPECS).map(([id, d]) => ({ id, cls: id.split('.')[0], nom: d.nom, texte: d.texte, vh: unit(parseFx(d.v).ax) }));
  const RACEV = {}; for (const r of RACE_IDS) RACEV[r] = unit(parseFx(D.RACES[r].v).ax);
  let qn = 0;
  const QUESTIONS = D.QUESTIONS.map(q => ({ id: q.phase + '-' + q.need + '-' + (++qn), phase: q.phase, need: q.need, text: q.q, opts: q.a.map(([t, f]) => ({ text: t, fx: parseFx(f) })) }));
  const RQUESTIONS = D.RACE_QUESTIONS.map((q, i) => ({ id: 'race-' + (i + 1), phase: 'race', need: 'race', text: q.q, opts: RACE_IDS.map(r => ({ text: q.r[r], race: r })) }));
  const byPhase = p => QUESTIONS.filter(q => q.phase === p);
  const POOL = { tri: byPhase('tri'), affinage: byPhase('affinage'), confirmation: byPhase('confirmation') };
  const compatRaces = cls => RACE_IDS.filter(r => D.RACES[r].classes.includes(cls));

  /* ---------- Une partie ---------- */
  function Session(rng) {
    this.rng = rng || Math.random;
    this.P = new Float64Array(AXES.length); this.C = {}; this.S = {}; this.R = {};
    this.history = []; this.asked = new Set(); this.needCount = {};
    this.counts = { tri: 0, affinage: 0, confirmation: 0, race: 0 };
    this.phase = 'tri'; this.current = null; this.jokeDone = false; this.done = false;
    this.confTarget = CFG.CONF_MIN; this.raceTarget = CFG.RACE_MIN;
    // Tri : une question tirée au hasard par grand axe, ordre mélangé (rôle en premier)
    const needs = this.shuffle(CFG.TRI_NEEDS.slice(1)); needs.unshift('role');
    this.triQueue = needs.map(n => this.pick(POOL.tri.filter(q => q.need === n)));
  }
  const S = Session.prototype;
  S.shuffle = function (a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  S.pick = function (a) { return a[Math.floor(this.rng() * a.length)]; };

  // Score d'une spécialisation = proximité du profil + bonus directs
  S.specScore = function (sp) { return dot(this.P, sp.vh) + CFG.W_DIRECT * ((this.C[sp.cls] || 0) + (this.S[sp.id] || 0)); };
  S.norm = function () {
    let c2 = 0; for (const k in this.C) c2 += this.C[k] ** 2; for (const k in this.S) c2 += this.S[k] ** 2;
    return Math.max(3, Math.hypot(...this.P) + CFG.W_DIRECT * Math.sqrt(c2));
  };
  S.rankSpecs = function () { return SPECS.map(sp => ({ sp, s: this.specScore(sp) })).sort((a, b) => b.s - a.s); };
  S.rankClasses = function () {
    const best = {};
    for (const x of this.rankSpecs()) if (!best[x.sp.cls]) best[x.sp.cls] = x;
    return CLASS_IDS.map(c => ({ cls: c, s: best[c].s, spec: best[c].sp })).sort((a, b) => b.s - a.s);
  };
  S.margin = function () { const r = this.rankClasses(); return (r[0].s - r[1].s) / this.norm(); };

  // Effet d'une réponse sur une spécialisation (sert à mesurer le pouvoir de départage)
  const optOnSpec = (o, sp) => dot(o.fx.ax, sp.vh) + CFG.W_DIRECT * ((o.fx.c[sp.cls] || 0) + (o.fx.s[sp.id] || 0));
  // Pouvoir de départage : en moyenne, à quel point chaque réponse écarte les candidats entre eux
  function discrimination(q, cands, effect) {
    let tot = 0;
    for (const o of q.opts) {
      const e = cands.map(c => effect(o, c)); const m = e.reduce((a, b) => a + b, 0) / e.length;
      tot += Math.sqrt(e.reduce((a, b) => a + (b - m) ** 2, 0) / e.length);
    }
    return tot / q.opts.length;
  }
  // Choisit la question la plus utile parmi le pool (un peu de hasard parmi les meilleures)
  S.pickBest = function (pool, cands, effect, maxPerNeed) {
    const scored = pool.filter(q => !this.asked.has(q.id) && (this.needCount[q.need] || 0) < maxPerNeed)
      .map(q => ({ q, v: discrimination(q, cands, effect) })).sort((a, b) => b.v - a.v);
    const top = scored.slice(0, 4).filter(x => x.v > 0);
    if (!top.length) return scored.length ? scored[0].q : null;
    const w = top.map(x => x.v * x.v); let r = this.rng() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < top.length; i++) { r -= w[i]; if (r <= 0) return top[i].q; }
    return top[0].q;
  };
  S.topClass = function () { return this.rankClasses()[0].cls; };
  S.raceScores = function (races) {
    const n = Math.hypot(...this.P) || 1;
    return races.map(r => ({ r, s: (this.R[r] || 0) + 1.5 * dot(this.P, RACEV[r]) / n })).sort((a, b) => b.s - a.s);
  };

  // Prochaine étape : une question, la blague « race unique », ou null quand c'est fini
  S.next = function () {
    if (this.current) return this.current;
    if (this.done) return null;
    const total = this.history.length;
    let q = null;
    if (this.phase === 'tri') {
      if (this.counts.tri < this.triQueue.length) q = this.triQueue[this.counts.tri];
      else this.phase = 'affinage';
    }
    if (!q && this.phase === 'affinage') {
      const k = this.counts.affinage;
      const top = this.topClass();
      const projected = total + CFG.CONF_MIN + (compatRaces(top).length > 1 ? CFG.RACE_MIN : 0);
      const stop = k >= CFG.AFF_MAX || (k >= CFG.AFF_MIN && this.margin() > CFG.MARGE_NETTE && projected >= CFG.TOTAL_MIN);
      if (!stop) {
        const cands = this.rankSpecs().slice(0, 6).map(x => x.sp);
        q = this.pickBest(POOL.affinage, cands, optOnSpec, CFG.MAX_PAR_BESOIN);
      }
      if (!q) { this.phase = 'confirmation'; this.confTarget = this.margin() > CFG.MARGE_NETTE ? CFG.CONF_MIN : CFG.CONF_MAX; }
    }
    if (!q && this.phase === 'confirmation') {
      const top = this.topClass(); const needMore = compatRaces(top).length === 1 && total < CFG.TOTAL_MIN;
      if (this.counts.confirmation < this.confTarget || needMore) {
        const cands = this.rankClasses().slice(0, 3).map(x => x.spec);
        q = this.pickBest(POOL.confirmation, cands, optOnSpec, 99) || this.pickBest(POOL.affinage, cands, optOnSpec, 99);
      }
      if (!q) {
        this.phase = 'race';
        const races = compatRaces(this.topClass());
        if (races.length === 1) {
          if (!this.jokeDone) { this.current = { type: 'joke', text: D.BLAGUE_RACE_UNIQUE }; return this.current; }
        }
      }
    }
    if (!q && this.phase === 'race') {
      const races = compatRaces(this.topClass());
      const room = CFG.TOTAL_MAX - total;
      if (races.length > 1 && room > 0) {
        if (this.counts.race === CFG.RACE_MIN) { const rs = this.raceScores(races); if (rs[0].s - rs[1].s < 1.5) this.raceTarget = CFG.RACE_MAX; }
        if (this.counts.race < Math.min(this.raceTarget, room)) {
          const effect = (o, r) => (o.race === r ? 3 : 0);
          const pool = RQUESTIONS.filter(x => !this.asked.has(x.id)).map(x => ({ ...x, opts: x.opts.filter(o => races.includes(o.race)) }));
          q = this.pickBest(pool, races, effect, 99);
        }
      }
      if (!q) { this.done = true; return null; }
    }
    // Présentation : réponses mélangées (et une réponse neutre s'il n'en reste que 2)
    let opts = q.opts.map(o => ({ ...o }));
    if (q.phase === 'race' && opts.length > 4) opts = this.shuffle(opts).slice(0, 4);
    if (opts.length < 3) opts.push({ text: this.pick(D.NEUTRES), fx: null, race: null });
    this.current = { type: 'question', q, phase: q.phase, text: q.text, options: this.shuffle(opts), number: total + 1, estimate: this.estimate() };
    return this.current;
  };
  S.ackJoke = function () { this.jokeDone = true; this.current = null; this.done = true; };
  // Estimation du nombre total de questions (pour la barre de progression)
  S.estimate = function () {
    const t = this.history.length;
    const raceN = compatRaces(this.topClass()).length > 1 ? (this.phase === 'race' ? this.raceTarget : CFG.RACE_MIN) : 0;
    if (this.phase === 'tri') return 22;
    if (this.phase === 'affinage') return Math.min(CFG.TOTAL_MAX, CFG.TRI_NEEDS.length + Math.max(this.counts.affinage + 1, CFG.AFF_MIN + 1) + CFG.CONF_MIN + raceN);
    if (this.phase === 'confirmation') return Math.min(CFG.TOTAL_MAX, t + 1 + Math.max(0, this.confTarget - this.counts.confirmation - 1) + raceN);
    return Math.min(CFG.TOTAL_MAX, t + 1 + Math.max(0, this.raceTarget - this.counts.race - 1));
  };
  S.answer = function (i) {
    const cur = this.current; if (!cur || cur.type !== 'question') return;
    const o = cur.options[i]; if (!o) return;
    if (o.fx) { for (let k = 0; k < AXES.length; k++) this.P[k] += o.fx.ax[k]; for (const c in o.fx.c) this.C[c] = (this.C[c] || 0) + o.fx.c[c]; for (const s in o.fx.s) this.S[s] = (this.S[s] || 0) + o.fx.s[s]; }
    if (o.race) this.R[o.race] = (this.R[o.race] || 0) + 3;
    this.history.push({ q: cur.q, o });
    this.asked.add(cur.q.id); this.needCount[cur.q.need] = (this.needCount[cur.q.need] || 0) + 1;
    this.counts[cur.q.phase]++;
    this.current = null;
  };

  /* ---------- Le résultat ---------- */
  S.result = function () {
    const ranking = this.rankClasses(); const top = ranking[0];
    const races = compatRaces(top.cls); const race = this.raceScores(races)[0].r;
    const n = this.norm();
    // Pourcentage de compatibilité : proximité relative au profil, plafonnée à 99 %
    // Le premier est entre 86 et 98 % ; les autres perdent des points selon leur retard.
    const s0 = ranking[0].s, worstGap = Math.max(1e-6, s0 - ranking[ranking.length - 1].s);
    const target = Math.min(98, 86 + Math.round(60 * Math.max(0, this.margin())));
    const floorPct = Math.max(8, Math.min(30, Math.round(32 - 25 * worstGap / n)));
    const scored = ranking.map(x => ({ cls: x.cls, spec: x.spec, pct: Math.round(target - (target - floorPct) * Math.pow((s0 - x.s) / worstGap, 1.4)) }));
    // Réponses marquantes : celles qui ont le plus poussé vers le résultat
    const sp = top.spec; const hl = [];
    const contrib = this.history.filter(h => h.o.fx).map(h => {
      let best = -1, bestV = 0;
      for (let k = 0; k < AXES.length; k++) { const v = h.o.fx.ax[k] * sp.vh[k]; if (v > bestV) { bestV = v; best = k; } }
      const direct = CFG.W_DIRECT * ((h.o.fx.c[sp.cls] || 0) + (h.o.fx.s[sp.id] || 0));
      const raison = direct > bestV ? D.CLASSES[sp.cls].direct : (best >= 0 ? D.RAISONS[AXES[best]][h.o.fx.ax[best] > 0 ? 0 : 1] : null);
      return { q: h.q.text.replace(/\s*:\s*$/, ""), a: h.o.text, v: optOnSpec(h.o, sp), need: h.q.need, raison };
    }).filter(x => x.raison && x.v > 0).sort((a, b) => b.v - a.v);
    const seen = new Set();
    for (const c of contrib) { if (seen.has(c.need) || seen.has(c.raison)) continue; seen.add(c.need); seen.add(c.raison); hl.push(c); if (hl.length === 4) break; }
    return {
      cls: top.cls, spec: sp, race, top3: scored.slice(0, 3), worst: scored[scored.length - 1],
      highlights: hl, count: this.history.length, ranking: scored,
    };
  };

  const API = { Session, CFG, data: D, QUESTIONS, RQUESTIONS, SPECS, compatRaces, parseFx };
  root.MVSQuiz = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document === 'undefined') return;

  /* =====================================================================
     ÉCRANS DU QUIZ (HTML par-dessus la scène, sans 3D)
     ===================================================================== */
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sfx = k => { try { root.__mvsSfx && root.__mvsSfx(k); } catch (e) {} };
  let session = null, shownProgress = 0, busy = false, lastResultText = '';
  const box = () => $('quiz');

  function open() {
    root.__mvsQuizOpen = true; box().classList.remove('hidden'); box().scrollTop = 0; renderIntro();
    root.dispatchEvent(new Event('resize'));
  }
  function close() {
    root.__mvsQuizOpen = false; box().classList.add('hidden'); root.dispatchEvent(new Event('resize'));
  }
  function frame(inner) {
    box().innerHTML = `<div class="qz-wrap"><div class="qz-panel qz-in">${inner}</div></div>`;
    box().scrollTop = 0;
  }
  function renderIntro() {
    frame(`
      <div class="qz-kicker">WoW Forever · Classic+ · Horde</div>
      <h2 class="qz-title">Quel perso dois-tu jouer ?</h2>
      <p class="qz-lead">Entre 18 et 25 questions. Des questions de la vie de tous les jours, des mises en situation et quelques pièges.</p>
      <p class="qz-lead">Réponds avec ton cœur, pas avec ce que tu crois que le test veut entendre. Sauce lit par-dessus ton épaule.</p>
      <div class="qz-actions"><button class="bigbtn" id="qzGo">C'est parti</button></div>
      <div class="qz-actions"><button class="qz-link" id="qzHome">Retour à l'accueil</button></div>`);
    $('qzGo').onclick = () => { sfx('click'); start(); };
    $('qzHome').onclick = () => { sfx('click'); close(); };
  }
  function start() { session = new Session(); shownProgress = 0; step(); }
  function step() {
    const cur = session.next();
    if (!cur) return renderResult();
    if (cur.type === 'joke') {
      frame(`<div class="qz-kicker">Petite pause</div><p class="qz-q">${esc(cur.text)}</p>
        <div class="qz-actions"><button class="bigbtn" id="qzNext">Voir mon résultat</button></div>`);
      $('qzNext').onclick = () => { sfx('click'); session.ackJoke(); step(); };
      return;
    }
    const prog = Math.max(shownProgress, (cur.number - 1) / cur.estimate); shownProgress = prog;
    frame(`
      <div class="qz-top"><span>Question ${cur.number}</span><button class="qz-link" id="qzQuit">Quitter</button></div>
      <div class="qz-prog"><i style="width:${(prog * 100).toFixed(1)}%"></i></div>
      <p class="qz-q">${esc(cur.text)}</p>
      <div class="qz-answers">${cur.options.map((o, i) => `<button class="qz-ans" data-i="${i}"><b>${i + 1}</b><span>${esc(o.text)}</span></button>`).join('')}</div>`);
    box().querySelectorAll('.qz-ans').forEach(b => b.onclick = () => choose(+b.dataset.i, b));
    $('qzQuit').onclick = () => { sfx('click'); close(); };
    busy = false;
  }
  function choose(i, btn) {
    if (busy || !session || !session.current) return; busy = true;
    sfx('click'); if (btn) btn.classList.add('on');
    const p = box().querySelector('.qz-panel');
    setTimeout(() => { if (p) p.classList.add('qz-out'); }, 120);
    setTimeout(() => { session.answer(i); step(); }, 300);
  }
  function renderResult() {
    const r = session.result(); const C = D.CLASSES[r.cls]; const Rc = D.RACES[r.race];
    const title = `${Rc.nom} ${C.nom}`;
    const hl = r.highlights.map(h => `<li>À « ${esc(h.q)} », tu as répondu « ${esc(h.a)} » : ${esc(h.raison)}.</li>`).join('');
    const bars = r.top3.map(x => { const c = D.CLASSES[x.cls]; return `<div class="qz-bar"><span class="qz-bn">${c.emoji} ${c.nom}</span><span class="qz-bt"><i style="width:${x.pct}%;background:${c.couleur}"></i></span><span class="qz-bp">${x.pct} %</span></div>`; }).join('');
    const W = D.CLASSES[r.worst.cls];
    frame(`
      <div class="qz-sheet" style="--cc:${C.couleur}">
        <div class="qz-head"><div class="qz-por">${C.emoji}</div><div>
          <div class="qz-kicker">Tu dois jouer :</div>
          <h2 class="qz-res">${esc(title)}</h2>
          <div class="qz-spec">Spécialisation conseillée : <b>${esc(r.spec.nom)}</b> — ${esc(r.spec.texte)}</div>
        </div></div>
        <div class="qz-sec"><h3>Pourquoi</h3><p>${esc(C.pourquoi)}</p>${hl ? `<ul class="qz-hl">${hl}</ul>` : ''}</div>
        <div class="qz-cols">
          <div class="qz-sec"><h3>Tes points forts</h3><ul>${C.forts.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div class="qz-sec"><h3>Ce qui va t'agacer</h3><ul>${C.agacer.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        </div>
        <p class="qz-concl">« ${esc(C.conclusion)} »</p>
        <div class="qz-sec"><h3>${Rc.emoji} Ta race</h3><p>${esc(Rc.phrase)}</p></div>
        <div class="qz-sec"><h3>Ton top 3</h3>${bars}</div>
        <div class="qz-sec qz-worst"><h3>Ce que tu ne dois surtout pas jouer</h3><p><b>${W.emoji} ${W.nom}</b> (${r.worst.pct} %) — ${esc(W.pire)}</p></div>
        <p class="qz-wink">Quoi que tu choisisses, Sauce te battra quand même.</p>
        <div class="qz-actions qz-btns">
          <button class="bigbtn" id="qzCopy">Copier mon résultat</button>
          <button class="medbtn" id="qzAgain">Refaire le test</button>
          <button class="medbtn" id="qzBack">Retour à l'accueil</button>
        </div>
        <div class="qz-copied" id="qzCopied"></div>
      </div>`);
    const url = location.href.split('#')[0].split('?')[0];
    lastResultText = `🎮 « Quel perso dois-tu jouer ? » — WoW Forever, Horde\n` +
      `Je dois jouer : ${title} (${r.spec.nom}) — ${r.top3[0].pct} % de compatibilité\n` +
      `Top 3 : ${r.top3.map(x => `${D.CLASSES[x.cls].nom} ${x.pct} %`).join(', ')}\n` +
      `À ne surtout pas jouer : ${W.nom}\n` +
      `Quoi que je choisisse, Sauce me battra quand même.\n👉 ${url}`;
    $('qzCopy').onclick = () => { sfx('click'); copy(lastResultText); };
    $('qzAgain').onclick = () => { sfx('click'); start(); };
    $('qzBack').onclick = () => { sfx('click'); close(); };
    sfx('result');
  }
  function copy(text) {
    const ok = () => { $('qzCopied').textContent = 'Copié ! Colle-le dans WhatsApp.'; };
    const fallback = () => {
      const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t);
      t.select(); let done = false; try { done = document.execCommand('copy'); } catch (e) {} t.remove();
      if (done) ok(); else $('qzCopied').textContent = 'Impossible de copier automatiquement : fais une capture d\'écran !';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }
  // Touches 1 à 4 pour répondre au clavier
  document.addEventListener('keydown', e => {
    if (!root.__mvsQuizOpen || !session || !session.current || session.current.type !== 'question') return;
    const m = e.code.match(/^(?:Digit|Numpad)([1-4])$/); if (!m) return;
    const i = +m[1] - 1; const b = box().querySelector(`.qz-ans[data-i="${i}"]`); if (b) { e.preventDefault(); choose(i, b); }
  });
  const btn = $('quizbtn'); if (btn) btn.addEventListener('click', () => { sfx('click'); open(); });
  API.open = open; API.close = close; API.getResultText = () => lastResultText;
})(typeof window !== 'undefined' ? window : globalThis);
