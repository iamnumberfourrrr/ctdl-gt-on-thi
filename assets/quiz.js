/*
 * quiz.js — tight-feedback practice widgets for every lesson.
 *
 * Markup (no JS needed in lessons):
 *
 * 1) Multiple choice — mark the right option with data-correct.
 *    <div class="q">
 *      <p class="q-prompt">Câu hỏi…</p>
 *      <ol class="q-options">
 *        <li><button>Phương án A</button></li>
 *        <li><button data-correct>Phương án B</button></li>
 *      </ol>
 *      <div class="q-explain">Giải thích (hiện sau khi trả lời).</div>
 *    </div>
 *
 * 2) Fill-in blanks — any number of .blank inside one .q, checked together.
 *    <span class="blank" data-accept='["i + 1","i+1"]'></span>
 *    data-accept: JSON array of accepted answers, or one plain string.
 *    Matching ignores case, extra spaces, commas vs spaces, and a trailing ';'.
 *    Optional data-width="12" (characters) sizes the input.
 *
 * 3) Self-check — for answers drawn on paper (cây, bảng băm…).
 *    <div class="q" data-kind="self"> <p class="q-prompt">Vẽ…</p>
 *      <div class="q-explain">Lời giải…</div> </div>
 *    Renders "Hiện lời giải" then "Mình làm đúng / Mình làm sai" buttons.
 *
 * Questions are auto-numbered (data-n) and a sticky scoreboard counts results.
 * Order of options is shuffled on load so position never hints the answer.
 */
(function () {
  "use strict";

  const norm = (s) =>
    String(s)
      .toLowerCase()
      .normalize("NFC")
      .replace(/;+\s*$/, "")
      .replace(/[\s,]+/g, " ")
      .trim();
  const squash = (s) => norm(s).replace(/\s+/g, "");

  function accepted(el) {
    const raw = el.dataset.accept || "";
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v.map(String) : [String(v)];
    } catch {
      return [raw];
    }
  }
  const matches = (input, answers) =>
    answers.some((a) => norm(a) === norm(input) || squash(a) === squash(input));

  let total = 0;
  let right = 0;
  let board;
  function score(ok) {
    if (ok) right++;
    board.textContent = `Đúng ${right} / ${total} câu`;
  }

  function shuffle(list) {
    const items = Array.from(list.children);
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    items.forEach((li) => list.appendChild(li));
  }

  function actions(q) {
    let bar = q.querySelector(".q-actions");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "q-actions";
      const explain = q.querySelector(".q-explain");
      q.insertBefore(bar, explain);
    }
    return bar;
  }
  function feedback(q, ok, text) {
    let fb = q.querySelector(".q-feedback");
    if (!fb) {
      fb = document.createElement("div");
      q.insertBefore(fb, q.querySelector(".q-explain"));
    }
    fb.className = "q-feedback " + (ok ? "ok" : "bad");
    fb.textContent = text;
  }
  function button(label, cls) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    if (cls) b.className = cls;
    return b;
  }

  function setupChoice(q) {
    const list = q.querySelector(".q-options");
    shuffle(list);
    const buttons = list.querySelectorAll("button");
    let scored = false;
    buttons.forEach((b) =>
      b.addEventListener("click", () => {
        const ok = b.hasAttribute("data-correct");
        b.classList.add(ok ? "is-right" : "is-wrong");
        if (!scored) {
          scored = true;
          score(ok);
        }
        if (ok) {
          buttons.forEach((x) => (x.disabled = true));
          feedback(q, true, "✓ Chính xác.");
        } else {
          b.disabled = true;
          feedback(q, false, "✗ Chưa đúng — thử lại (lần đầu đã tính điểm).");
        }
        q.classList.add("answered");
      })
    );
  }

  function setupBlanks(q, blanks) {
    blanks.forEach((bl) => {
      const input = document.createElement("input");
      input.type = "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      // Width must not leak the answer length: explicit data-width, else a coarse bucket.
      const longest = Math.max(...accepted(bl).map((a) => a.length));
      const w = Number(bl.dataset.width) || (longest <= 10 ? 10 : longest <= 22 ? 24 : 40);
      input.style.width = `${w}ch`;
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check.click();
      });
      bl.appendChild(input);
    });
    const bar = actions(q);
    const check = button("Kiểm tra");
    const show = button("Hiện đáp án", "secondary");
    bar.append(check, show);
    let scored = false;

    check.addEventListener("click", () => {
      let all = true;
      blanks.forEach((bl) => {
        const ok = matches(bl.querySelector("input").value, accepted(bl));
        bl.classList.toggle("is-right", ok);
        bl.classList.toggle("is-wrong", !ok);
        all = all && ok;
      });
      if (!scored) {
        scored = true;
        score(all);
      }
      feedback(q, all, all ? "✓ Chính xác." : "✗ Ô đỏ chưa đúng — sửa rồi kiểm tra lại.");
      if (all) q.classList.add("answered");
    });
    show.addEventListener("click", () => {
      if (!scored) {
        scored = true;
        score(false);
      }
      blanks.forEach((bl) => {
        if (bl.querySelector(".reveal")) return;
        const r = document.createElement("span");
        r.className = "reveal";
        r.textContent = "→ " + accepted(bl)[0];
        bl.appendChild(r);
      });
      q.classList.add("answered");
    });
  }

  function setupSelf(q) {
    const bar = actions(q);
    const show = button("Hiện lời giải");
    bar.append(show);
    show.addEventListener("click", () => {
      q.classList.add("answered");
      show.remove();
      const yes = button("Mình làm đúng");
      const no = button("Mình làm sai", "secondary");
      const done = (ok) => {
        score(ok);
        yes.remove();
        no.remove();
        feedback(q, ok, ok ? "✓ Ghi nhận: đúng." : "✗ Ghi nhận: sai — xem kỹ lời giải, làm lại vào ngày mai.");
      };
      yes.addEventListener("click", () => done(true));
      no.addEventListener("click", () => done(false));
      bar.append(yes, no);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const qs = document.querySelectorAll(".q");
    if (!qs.length) return;
    board = document.createElement("div");
    board.className = "scoreboard";
    document.body.appendChild(board);
    qs.forEach((q, i) => {
      total++;
      const prompt = q.querySelector(".q-prompt");
      if (prompt) prompt.dataset.n = `${i + 1}.`;
      const blanks = q.querySelectorAll(".blank");
      if (q.dataset.kind === "self") setupSelf(q);
      else if (q.querySelector(".q-options")) setupChoice(q);
      else if (blanks.length) setupBlanks(q, blanks);
    });
    board.textContent = `Đúng 0 / ${total} câu`;
  });

  window.Quiz = { norm, matches };
})();
