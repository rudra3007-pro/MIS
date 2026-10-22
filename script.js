const app = document.getElementById("app");
const L = ["A", "B", "C", "D"];
let S = {};
const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const total = () => Object.values(QUIZ).reduce((n, a) => n + a.length, 0);

function home() {
  const weeks = Object.keys(QUIZ);
  app.innerHTML = `
    <h2>Choose a quiz</h2>
    <label class="check"><input type="checkbox" id="shuf"> Shuffle questions</label>
    <div class="grid">
      ${weeks.map(w => `<button class="card" data-w="${w}">Week ${w}<small>${QUIZ[w].length} questions</small></button>`).join("")}
      <button class="card all" data-w="all">All weeks<small>${total()} questions</small></button>
    </div>`;
  app.querySelectorAll(".card").forEach(b =>
    b.onclick = () => start(b.dataset.w, document.getElementById("shuf").checked));
}

function start(w, shuffle) {
  const keys = w === "all" ? Object.keys(QUIZ) : [w];
  const qs = keys.flatMap(k => QUIZ[k].map(q => [...q, k]));
  if (shuffle) for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [qs[i], qs[j]] = [qs[j], qs[i]];
  }
  S = { w, qs, i: 0, score: 0, wrong: [] };
  show();
}

function show() {
  const [q, opts, ans, wk] = S.qs[S.i], n = S.qs.length;
  app.innerHTML = `
    <div class="top"><span>${S.w === "all" ? "Week " + wk + " · " : ""}Question ${S.i + 1} of ${n}</span><span>Score ${S.score}</span></div>
    <div class="bar"><div style="width:${(S.i / n) * 100}%"></div></div>
    <h2 class="q">${esc(q)}</h2>
    <div class="opts">${opts.map((t, k) => `<button class="opt" data-k="${k}"><b>${L[k]}</b><span>${esc(t)}</span></button>`).join("")}</div>
    <div class="nav"><button class="ghost" id="quit">Quit</button><button id="next" hidden>${S.i + 1 < n ? "Next question" : "See results"}</button></div>`;
  const btns = app.querySelectorAll(".opt");
  btns.forEach(b => b.onclick = () => {
    const k = +b.dataset.k;
    btns.forEach(x => x.disabled = true);
    btns[ans].classList.add("ok");
    if (k === ans) S.score++;
    else { b.classList.add("no"); S.wrong.push({ q, you: opts[k], right: opts[ans], wk }); }
    document.getElementById("next").hidden = false;
    document.getElementById("next").focus();
  });
  document.getElementById("next").onclick = () => { S.i++; S.i < n ? show() : results(); };
  document.getElementById("quit").onclick = home;
}

function results() {
  const n = S.qs.length, pct = Math.round((S.score / n) * 100);
  app.innerHTML = `
    <h2>${S.w === "all" ? "All weeks" : "Week " + S.w} complete</h2>
    <div class="score">${S.score} / ${n}</div>
    <p>${pct}% correct${S.wrong.length ? "" : " — no mistakes."}</p>
    <div class="actions"><button class="btn" id="again">Try again</button><button class="btn ghost" id="home">Choose another quiz</button></div>
    ${S.wrong.length ? "<h2>Review your mistakes</h2>" : ""}
    ${S.wrong.map(r => `<div class="rev"><p>${esc(r.q)}</p><span class="you">Your answer: ${esc(r.you)}</span><span class="right">Correct: ${esc(r.right)}</span></div>`).join("")}`;
  document.getElementById("again").onclick = () => start(S.w, false);
  document.getElementById("home").onclick = home;
}

home();
