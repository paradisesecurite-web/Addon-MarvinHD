// Simulation du quiz : node test-quiz.js (vérifie classes, races, nombre de questions, combinaisons valides, mots interdits)
const Q = require('./quiz.js');
const D = Q.data; const AX = D.AXES;
let seed = 12345; const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const VALID = {}; for (const r in D.RACES) for (const c of D.RACES[r].classes) VALID[c + '/' + r] = 1;
function play(chooser) {
  const s = new Q.Session(rng); let guard = 0; const ids = [];
  while (guard++ < 60) { const c = s.next(); if (!c) break; if (c.type === 'joke') { s.ackJoke(); continue; } ids.push(c.q.id); s.answer(chooser(c, s)); }
  return { r: s.result(), n: s.history.length, ids, s };
}
const problems = [];
const randomChooser = c => Math.floor(rng() * c.options.length);
// Persona = une spé + une race préférée ; choisit la réponse la plus proche (avec un peu de bruit)
function personaChooser(spec, race, noise = 0.6) {
  const sp = Q.SPECS.find(x => x.id === spec);
  return c => {
    let best = 0, bv = -1e9;
    c.options.forEach((o, i) => {
      let v = rng() * noise;
      if (o.fx) { for (let k = 0; k < AX.length; k++) v += o.fx.ax[k] * sp.vh[k]; v += 0.45 * ((o.fx.c[sp.cls] || 0) + (o.fx.s[sp.id] || 0)); }
      if (o.race) v += o.race === race ? 3 : 0;
      if (v > bv) { bv = v; best = i; }
    });
    return best;
  };
}
function check(res, tag) {
  const { r, n } = res;
  if (n < 18 || n > 25) problems.push(`${tag}: ${n} questions`);
  if (!VALID[r.cls + '/' + r.race]) problems.push(`${tag}: combo invalide ${r.cls}/${r.race}`);
  if (r.spec.cls !== r.cls) problems.push(`${tag}: spé hors classe`);
  if (new Set(res.ids).size !== res.ids.length) problems.push(`${tag}: doublon de question`);
}
// 1) Aléatoire
const cnt = {}, rc = {}, lens = {};
for (let i = 0; i < 1500; i++) { const res = play(randomChooser); check(res, 'random' + i); cnt[res.r.cls] = (cnt[res.r.cls] || 0) + 1; rc[res.r.race] = (rc[res.r.race] || 0) + 1; lens[res.n] = (lens[res.n] || 0) + 1; }
console.log('ALEATOIRE classes', cnt); console.log('ALEATOIRE races', rc); console.log('longueurs', lens);
// 2) Personas : chaque spé x chaque race compatible, 20 parties
let ok = 0, tot = 0, specOk = 0; const conf = {}; const raceOk = { ok: 0, tot: 0 }; const allCls = {}, allRace = {};
for (const sp of Q.SPECS) {
  for (const race of Q.compatRaces(sp.cls)) {
    for (let k = 0; k < 20; k++) {
      const res = play(personaChooser(sp.id, race)); check(res, 'persona ' + sp.id);
      tot++; if (res.r.cls === sp.cls) { ok++; if (res.r.spec.id === sp.id) specOk++; if (true) { raceOk.tot++; if (res.r.race === race) raceOk.ok++; } }
      else { const key = sp.id + '→' + res.r.cls; conf[key] = (conf[key] || 0) + 1; }
      allCls[res.r.cls] = 1; allRace[res.r.race] = 1;
    }
  }
}
console.log(`PERSONAS : bonne classe ${(100 * ok / tot).toFixed(1)} %, bonne spé ${(100 * specOk / tot).toFixed(1)} %, bonne race ${(100 * raceOk.ok / raceOk.tot).toFixed(1)} %`);
console.log('erreurs fréquentes', Object.entries(conf).sort((a, b) => b[1] - a[1]).slice(0, 12));
// per-class accuracy
const per = {};
// 3) Toujours "soigner"
const HEAL = ['pretre', 'paladin', 'chaman', 'druide']; let healOk = 0, healSpec = 0;
const soinIdx = AX.indexOf('soin');
for (let i = 0; i < 300; i++) {
  const res = play(c => { let b = 0, bv = -1e9; c.options.forEach((o, j) => { const v = (o.fx ? o.fx.ax[soinIdx] : 0) + rng() * 0.3; if (v > bv) { bv = v; b = j; } }); return b; });
  check(res, 'soin'); if (HEAL.includes(res.r.cls)) healOk++; if (/restauration|sacre|discipline/.test(res.r.spec.id)) healSpec++;
}
console.log(`TOUJOURS SOIGNER : classe de soigneur ${healOk}/300, spé de soin ${healSpec}/300`);
// 4) Toujours "protéger"
const tankIdx = AX.indexOf('tank'); let tankOk = 0;
for (let i = 0; i < 200; i++) { const res = play(c => { let b = 0, bv = -1e9; c.options.forEach((o, j) => { const v = (o.fx ? o.fx.ax[tankIdx] : 0) + rng() * 0.3; if (v > bv) { bv = v; b = j; } }); return b; }); check(res, 'tank'); if (/protection|farouche/.test(res.r.spec.id)) tankOk++; }
console.log(`TOUJOURS PROTÉGER : spé de tank ${tankOk}/200`);
// 5) Toutes classes/races vues
console.log('classes vues', Object.keys(allCls).length, 'races vues', Object.keys(allRace).length);
// 6) Variété : même persona, questions différentes ?
const a = play(personaChooser('mage.givre', 'troll')).ids.join(), b = play(personaChooser('mage.givre', 'troll')).ids.join();
console.log('deux parties identiques ?', a === b);
// 7) Mots interdits
const bad = /(?<!\p{L})(guerri[eè]re?s?|chasseu[rs]e?s?|mages?|voleu[rs]e?s?|d[ée]monistes?|chamans?|pr[êe]tres?(se)?s?|paladins?|druides?|orcs?|orques?|mort-vivants?|morts-vivants?|taurens?|trolls?|skyborne|elfes?|d[ée]mons?)(?!\p{L})/iu;
for (const q of [...Q.QUESTIONS, ...Q.RQUESTIONS]) for (const t of [q.text, ...q.opts.map(o => o.text)]) if (bad.test(t)) problems.push('MOT INTERDIT : ' + t);
for (const t of D.NEUTRES) if (bad.test(t)) problems.push('MOT INTERDIT : ' + t);
console.log('banque :', Q.QUESTIONS.length + Q.RQUESTIONS.length, 'questions');
const pc = {}; for (const q of Q.QUESTIONS) pc[q.phase] = (pc[q.phase] || 0) + 1; console.log(pc, 'race', Q.RQUESTIONS.length);
// exemple de résultat
const ex = play(personaChooser('paladin.vindicte', 'mortvivant')); console.log('EXEMPLE', ex.r.cls, ex.r.race, ex.r.spec.id, ex.n, JSON.stringify(ex.r.top3.map(x => [x.cls, x.pct])), ex.r.worst.cls, ex.r.worst.pct); ex.r.highlights.forEach(h => console.log('  -', h.a, '=>', h.raison));
console.log('PROBLEMES', problems.length, problems.slice(0, 15));
