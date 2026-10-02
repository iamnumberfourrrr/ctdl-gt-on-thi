/*
 * tree.js — BST & B-Tree simulator + SVG renderer, following the course's exam conventions.
 *
 * Node shape (shared by both kinds):  { k: [keys...], c: [children...] }
 *   BST node: k = [key], c = [left|null, right|null]
 *   B-Tree node: k = sorted keys, c = [] for a leaf, else k.length + 1 children
 *
 * Conventions (match đề mẫu 2025-2026):
 *   BST delete (2 con): thay bằng phần tử NHỎ NHẤT của cây con PHẢI (opts.replace = "succ", default)
 *                        hoặc LỚN NHẤT của cây con TRÁI (opts.replace = "pred").
 *   B-Tree bậc m: tối đa m-1 khóa / node; node khác gốc tối thiểu ceil(m/2)-1 khóa.
 *   B-Tree insert: node tràn (m khóa) → tách, khóa giữa đẩy lên cha.
 *   B-Tree delete: khóa ở node trong → thay bằng khóa LỚN NHẤT NHỎ HƠN x (opts.replace = "pred", default).
 *     Underflow → mượn qua cha từ anh em kề (ưu tiên node liền trước) nếu anh em dư khóa (redistribution);
 *     nếu không → Catenation với node liền trước (nếu có), gộp cả khóa phân cách của cha.
 *
 * Declarative use in a lesson (renders on load):
 *   <figure class="tree" data-kind="bst" data-insert="40,50,4" data-delete="60" data-replace="succ"></figure>
 *   <figure class="tree" data-kind="btree" data-order="3" data-insert="10,15,20"></figure>
 *   <figure class="tree" data-kind="btree" data-tree='{"k":[25],"c":[{"k":[12,18],"c":[]}, …]}'></figure>
 *   Any <figcaption> inside the figure is kept.
 *
 * Interactive lab:
 *   <div class="tree-lab" data-kind="btree" data-order="5" data-tree='…'></div>
 *   <div class="tree-lab" data-kind="bst" data-insert="40,50,4"></div>
 *
 * JS API: window.DSA = { bstInsert, bstDelete, traverse, btInsert, btDelete, build, svg }
 */
(function () {
  "use strict";

  const clone = (n) => (n ? { k: [...n.k], c: n.c.map(clone) } : null);

  // ---------------- BST ----------------
  function bstInsert(n, key) {
    if (!n) return { k: [key], c: [null, null] };
    if (key < n.k[0]) n.c[0] = bstInsert(n.c[0], key);
    else if (key > n.k[0]) n.c[1] = bstInsert(n.c[1], key);
    return n;
  }
  function bstDelete(n, key, opts = {}, log = []) {
    const replace = opts.replace || "succ";
    if (!n) {
      log.push(`Không tìm thấy ${key}.`);
      return n;
    }
    if (key < n.k[0]) n.c[0] = bstDelete(n.c[0], key, opts, log);
    else if (key > n.k[0]) n.c[1] = bstDelete(n.c[1], key, opts, log);
    else {
      if (!n.c[0] || !n.c[1]) {
        const child = n.c[0] || n.c[1];
        log.push(child ? `Xóa ${key}: có 1 con → nối con ${child.k[0]} lên thay.` : `Xóa ${key}: là lá → bỏ đi.`);
        return child;
      }
      let s;
      if (replace === "pred") {
        s = n.c[0];
        while (s.c[1]) s = s.c[1];
        log.push(`Xóa ${key}: có 2 con → thay bằng ${s.k[0]} (lớn nhất cây con trái).`);
        n.k[0] = s.k[0];
        n.c[0] = bstDelete(n.c[0], s.k[0], opts, []);
      } else {
        s = n.c[1];
        while (s.c[0]) s = s.c[0];
        log.push(`Xóa ${key}: có 2 con → thay bằng ${s.k[0]} (nhỏ nhất cây con phải).`);
        n.k[0] = s.k[0];
        n.c[1] = bstDelete(n.c[1], s.k[0], opts, []);
      }
    }
    return n;
  }
  /** order: any permutation of "N","L","R" e.g. "LNR", "RLN". */
  function traverse(n, order, out = []) {
    if (!n) return out;
    for (const ch of order.toUpperCase()) {
      if (ch === "N") out.push(n.k[0]);
      else if (ch === "L") traverse(n.c[0], order, out);
      else if (ch === "R") traverse(n.c[1], order, out);
    }
    return out;
  }

  // ---------------- B-Tree ----------------
  const upper = (arr, x) => {
    let i = 0;
    while (i < arr.length && arr[i] <= x) i++;
    return i;
  };
  function btInsert(root, key, m, log = []) {
    if (!root) {
      log.push(`Chèn ${key}: cây rỗng → tạo gốc.`);
      return { k: [key], c: [] };
    }
    function rec(n) {
      if (n.k.includes(key)) {
        log.push(`${key} đã có, bỏ qua.`);
        return null;
      }
      if (!n.c.length) {
        n.k.splice(upper(n.k, key), 0, key);
      } else {
        const i = upper(n.k, key);
        const sp = rec(n.c[i]);
        if (sp) {
          n.k.splice(i, 0, sp.mid);
          n.c.splice(i + 1, 0, sp.right);
        }
      }
      if (n.k.length > m - 1) {
        const h = Math.floor(n.k.length / 2);
        const mid = n.k[h];
        log.push(`Node [${n.k.join(" ")}] tràn (${n.k.length} khóa) → tách, đẩy ${mid} lên.`);
        const right = { k: n.k.slice(h + 1), c: n.c.length ? n.c.slice(h + 1) : [] };
        n.k = n.k.slice(0, h);
        if (n.c.length) n.c = n.c.slice(0, h + 1);
        return { mid, right };
      }
      return null;
    }
    const sp = rec(root);
    if (sp) {
      log.push(`Gốc tách → tạo gốc mới [${sp.mid}], cây cao thêm 1 mức.`);
      return { k: [sp.mid], c: [root, sp.right] };
    }
    return root;
  }

  function btDelete(root, key, m, opts = {}, log = []) {
    const MIN = Math.ceil(m / 2) - 1;
    const replace = opts.replace || "pred";
    const fmt = (n) => `[${n.k.join(" ")}]`;

    function fix(p, i) {
      const c = p.c[i];
      const L = i > 0 ? p.c[i - 1] : null;
      const R = i + 1 < p.c.length ? p.c[i + 1] : null;
      log.push(`Node ${fmt(c)} thiếu khóa (Underflow: ${c.k.length} < ${MIN}).`);
      if (L && L.k.length > MIN) {
        c.k.unshift(p.k[i - 1]);
        p.k[i - 1] = L.k.pop();
        if (L.c.length) c.c.unshift(L.c.pop());
        log.push(`Mượn qua cha từ node liền trước: ${p.k[i - 1]} lên cha, khóa cha cũ xuống → ${fmt(c)}.`);
        return;
      }
      if (R && R.k.length > MIN) {
        c.k.push(p.k[i]);
        p.k[i] = R.k.shift();
        if (R.c.length) c.c.push(R.c.shift());
        log.push(`Mượn qua cha từ node liền sau: ${p.k[i]} lên cha, khóa cha cũ xuống → ${fmt(c)}.`);
        return;
      }
      const j = L ? i - 1 : i;
      const a = p.c[j];
      const b = p.c[j + 1];
      const sep = p.k.splice(j, 1)[0];
      log.push(`Catenation: ${fmt(a)} + ${sep} (từ cha) + ${fmt(b)}.`);
      a.k = [...a.k, sep, ...b.k];
      a.c = [...a.c, ...b.c];
      p.c.splice(j + 1, 1);
    }

    function rec(n, x) {
      const i = n.k.indexOf(x);
      let idx;
      if (i >= 0) {
        if (!n.c.length) {
          n.k.splice(i, 1);
          log.push(`Xóa ${x} khỏi lá → ${fmt(n)}.`);
          return;
        }
        let s;
        if (replace === "pred") {
          s = n.c[i];
          while (s.c.length) s = s.c[s.c.length - 1];
          const r = s.k[s.k.length - 1];
          log.push(`${x} ở node trong → thay bằng ${r} (lớn nhất nhỏ hơn ${x}), xóa ${r} ở lá.`);
          n.k[i] = r;
          idx = i;
          rec(n.c[idx], r);
        } else {
          s = n.c[i + 1];
          while (s.c.length) s = s.c[0];
          const r = s.k[0];
          log.push(`${x} ở node trong → thay bằng ${r} (nhỏ nhất lớn hơn ${x}), xóa ${r} ở lá.`);
          n.k[i] = r;
          idx = i + 1;
          rec(n.c[idx], r);
        }
      } else {
        if (!n.c.length) {
          log.push(`Không tìm thấy ${x}.`);
          return;
        }
        idx = upper(n.k, x);
        rec(n.c[idx], x);
      }
      if (n.c[idx].k.length < MIN) fix(n, idx);
    }

    if (!root) return root;
    rec(root, key);
    if (!root.k.length) {
      if (root.c.length) {
        log.push("Gốc rỗng → con duy nhất thành gốc mới, cây thấp đi 1 mức.");
        return root.c[0];
      }
      return null;
    }
    return root;
  }

  // ---------------- Build from attributes ----------------
  const nums = (s) =>
    (s || "")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

  function build(el, log = []) {
    const kind = el.dataset.kind || "bst";
    const m = Number(el.dataset.order) || 3;
    const opts = { replace: el.dataset.replace };
    let root = el.dataset.tree ? JSON.parse(el.dataset.tree) : null;
    if (root && kind === "bst") root = normalizeBst(root);
    for (const x of nums(el.dataset.insert)) root = kind === "bst" ? bstInsert(root, x) : btInsert(root, x, m, log);
    for (const x of nums(el.dataset.delete))
      root = kind === "bst" ? bstDelete(root, x, opts, log) : btDelete(root, x, m, opts, log);
    return root;
  }
  function normalizeBst(n) {
    if (!n) return null;
    const c = n.c || [];
    return { k: n.k, c: [normalizeBst(c[0] || null), normalizeBst(c[1] || null)] };
  }

  // ---------------- SVG layout ----------------
  const NS = "http://www.w3.org/2000/svg";
  const KW = 30; // width per key (B-Tree)
  const PAD = 12;
  const BH = 30; // box height
  const VG = 46; // vertical gap
  const HG = 14; // horizontal gap
  const BST_W = 40;

  function svg(root, kind = "bst") {
    const isLeaf = (n) => !n.c.length || n.c.every((x) => !x);
    const boxW = (n) => (kind === "bst" ? BST_W : n.k.length * KW + PAD);

    function measure(n) {
      if (!n) return { w: BST_W * 0.9, nil: true };
      const kids = isLeaf(n) ? [] : n.c.map(measure);
      const kidsW = kids.reduce((s, k) => s + k.w, 0) + HG * Math.max(0, kids.length - 1);
      return { n, kids, kidsW, w: Math.max(boxW(n), kidsW) };
    }
    const shapes = [];
    let maxDepth = 0;
    function place(t, left, depth) {
      if (t.nil) return null;
      maxDepth = Math.max(maxDepth, depth);
      const cx = left + t.w / 2;
      const y = depth * (BH + VG);
      const w = boxW(t.n);
      const node = { n: t.n, cx, y, w };
      shapes.push(node);
      let x = left + (t.w - t.kidsW) / 2;
      t.kids.forEach((kt, i) => {
        const child = place(kt, x, depth + 1);
        if (child) {
          const px =
            kind === "bst"
              ? cx + (i === 0 ? -8 : 8)
              : cx - w / 2 + PAD / 2 + i * KW;
          shapes.push({ edge: true, x1: px, y1: y + BH, x2: child.cx, y2: child.y });
        }
        x += kt.w + HG;
      });
      return node;
    }
    const s = document.createElementNS(NS, "svg");
    if (!root) {
      s.setAttribute("viewBox", "0 0 120 30");
      s.setAttribute("width", "120");
      const t = document.createElementNS(NS, "text");
      t.setAttribute("x", 4);
      t.setAttribute("y", 20);
      t.textContent = "(cây rỗng)";
      s.appendChild(t);
      return s;
    }
    const T = measure(root);
    place(T, 0, 0);
    const W = T.w + 8;
    const H = (maxDepth + 1) * (BH + VG) - VG + 8;
    s.setAttribute("viewBox", `-4 -4 ${W} ${H}`);
    s.setAttribute("width", W);
    s.setAttribute("role", "img");
    const el = (tag, attrs, text) => {
      const e = document.createElementNS(NS, tag);
      for (const [a, v] of Object.entries(attrs)) e.setAttribute(a, v);
      if (text != null) e.textContent = text;
      s.appendChild(e);
      return e;
    };
    shapes
      .filter((x) => x.edge)
      .forEach((e) => el("line", { x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2, stroke: "#6b655c", "stroke-width": 1.2 }));
    shapes
      .filter((x) => !x.edge)
      .forEach((nd) => {
        const x = nd.cx - nd.w / 2;
        el("rect", {
          x,
          y: nd.y,
          width: nd.w,
          height: BH,
          rx: kind === "bst" ? BH / 2 : 5,
          fill: "#fffdf8",
          stroke: "#1d1b18",
          "stroke-width": 1.3,
        });
        nd.n.k.forEach((key, i) => {
          const tx = kind === "bst" ? nd.cx : x + PAD / 2 + KW * i + KW / 2;
          el(
            "text",
            {
              x: tx,
              y: nd.y + BH / 2 + 5,
              "text-anchor": "middle",
              "font-family": "JetBrains Mono, Menlo, monospace",
              "font-size": 13,
              fill: "#1d1b18",
            },
            key
          );
        });
      });
    return s;
  }

  function renderFigure(fig) {
    const root = build(fig);
    const cap = fig.querySelector("figcaption");
    fig.querySelectorAll("svg").forEach((x) => x.remove());
    fig.insertBefore(svg(root, fig.dataset.kind || "bst"), cap);
  }

  // ---------------- Interactive lab ----------------
  function renderLab(lab) {
    const kind = lab.dataset.kind || "bst";
    const m = Number(lab.dataset.order) || 3;
    const opts = { replace: lab.dataset.replace };
    let root = build(lab, []);
    const initial = clone(root);
    lab.innerHTML = "";
    const controls = document.createElement("div");
    controls.className = "lab-controls";
    controls.innerHTML =
      `<strong>${kind === "bst" ? "Cây BST" : `B-Tree bậc ${m}`}</strong>` +
      `<input type="text" placeholder="khóa" aria-label="khóa">` +
      `<button class="btn" data-act="ins">Thêm</button>` +
      `<button class="btn" data-act="del">Xóa</button>` +
      `<button class="btn secondary" data-act="reset">Về ban đầu</button>` +
      `<button class="btn secondary" data-act="clear">Cây rỗng</button>`;
    const stage = document.createElement("div");
    const trav = document.createElement("div");
    trav.className = "lab-trav";
    const logEl = document.createElement("ol");
    logEl.className = "lab-log";
    lab.append(controls, stage, trav, logEl);
    const input = controls.querySelector("input");

    function draw(lines = []) {
      stage.innerHTML = "";
      stage.appendChild(svg(root, kind));
      if (kind === "bst")
        trav.textContent = ["NLR", "LNR", "LRN", "RLN"].map((o) => `${o}: ${traverse(root, o).join(" ")}`).join("   |   ");
      lines.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        logEl.appendChild(li);
      });
      logEl.scrollTop = logEl.scrollHeight;
    }
    function act(a) {
      const log = [];
      const keys = nums(input.value);
      if (a === "ins") keys.forEach((x) => (root = kind === "bst" ? bstInsert(root, x) : btInsert(root, x, m, log)));
      if (a === "ins" && kind === "bst") keys.forEach((x) => log.push(`Thêm ${x}.`));
      if (a === "del")
        keys.forEach((x) => {
          root = kind === "bst" ? bstDelete(root, x, opts, log) : btDelete(root, x, m, opts, log);
        });
      if (a === "reset") {
        root = clone(initial);
        logEl.innerHTML = "";
      }
      if (a === "clear") {
        root = null;
        logEl.innerHTML = "";
      }
      input.value = "";
      draw(log);
    }
    controls.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => act(b.dataset.act)));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") act("ins");
    });
    draw();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("figure.tree").forEach(renderFigure);
    document.querySelectorAll(".tree-lab").forEach(renderLab);
  });

  window.DSA = { bstInsert, bstDelete, traverse, btInsert, btDelete, build, svg, clone };
})();
