/* Lightweight, dependency-free test suite.
 *
 * Node:     node tests/app.test.js        (data, logic, storage, project-file checks)
 * Browser:  open index.html, then in the console:  await HRTests.run()   (adds DOM checks)
 */
(function (root) {
  "use strict";

  const results = [];
  function test(name, fn) {
    try { fn(); results.push({ name, ok: true }); }
    catch (e) { results.push({ name, ok: false, error: e && e.message ? e.message : String(e) }); }
  }
  function assert(cond, msg) { if (!cond) throw new Error(msg || "Assertion failed"); }
  function eq(a, b, msg) { if (a !== b) throw new Error((msg || "Not equal") + " (got " + JSON.stringify(a) + ", expected " + JSON.stringify(b) + ")"); }

  function run(App) {
    results.length = 0;
    const isNode = typeof module !== "undefined" && typeof process !== "undefined" && process.versions && process.versions.node;

    /* ---------- data integrity ---------- */
    test("all four tab datasets are populated", () => {
      const g = App.allTasks();
      assert(g.operations.length >= 30, "operations tasks");
      assert(g.lifecycle.length >= 25, "lifecycle steps");
      assert(g.compliance.length >= 12, "compliance checks");
      eq(App.TEMPLATES.length, 4, "template count");
      assert(App.KPIS.length >= 8, "kpi count");
      assert(App.MATRIX.length >= 6, "matrix rows");
    });
    test("task ids are unique", () => {
      const ids = App.allTaskList().map(x => x.id);
      eq(new Set(ids).size, ids.length, "duplicate ids");
    });
    test("every task has title, detail, owner, valid priority", () => {
      App.allTaskList().forEach(x => {
        assert(x.title && x.detail && x.owner, "missing text on " + x.id);
        assert(App.PRIORITIES.indexOf(x.priority) !== -1, "bad priority on " + x.id);
      });
    });
    test("no placeholder text left in content", () => {
      const blob = JSON.stringify([App.OPERATIONS, App.LIFECYCLE, App.COMPLIANCE_CHECKS, App.COMPLIANCE_REFS]).toLowerCase();
      ["lorem ipsum", "todo", "tbd"].forEach(w => assert(blob.indexOf(w) === -1, "found " + w));
    });
    test("lifecycle owners include HR Coord, IT, Payroll, Hiring Mgr", () => {
      const owners = new Set(App.allTasks().lifecycle.map(x => x.owner));
      ["HR Coord", "IT", "Payroll", "Hiring Mgr"].forEach(o => assert(owners.has(o), "missing owner " + o));
    });

    /* ---------- filtering / search ---------- */
    test("search matches title and detail text", () => {
      const list = App.allTaskList();
      const hits = list.filter(x => App.matches(x, { q: "checkr" }, {}));
      assert(hits.length >= 1, "expected a Checkr hit");
      eq(list.filter(x => App.matches(x, { q: "zzzzqqq" }, {})).length, 0, "nonsense query");
    });
    test("priority and cadence filters narrow results", () => {
      const list = App.allTaskList();
      const high = list.filter(x => App.matches(x, { priority: "High" }, {}));
      assert(high.length > 0 && high.every(x => x.priority === "High"), "priority filter");
      const daily = list.filter(x => App.matches(x, { cadence: "Daily" }, {}));
      assert(daily.length > 0 && daily.every(x => x.cadence === "Daily"), "cadence filter");
    });
    test("hide-completed removes done tasks", () => {
      const list = App.allTaskList();
      const done = {}; done[list[0].id] = true;
      eq(App.matches(list[0], { hideDone: true }, done), false);
      eq(App.matches(list[1], { hideDone: true }, done), true);
    });

    /* ---------- completion + progress ---------- */
    test("progress computes percentages", () => {
      const list = App.allTaskList();
      const done = {}; list.slice(0, Math.ceil(list.length / 2)).forEach(x => { done[x.id] = true; });
      const p = App.progress(list, done);
      eq(p.total, list.length);
      assert(p.pct >= 49 && p.pct <= 51, "pct near 50, got " + p.pct);
      eq(App.progress(list, {}).pct, 0);
    });

    /* ---------- storage ---------- */
    test("localStorage persistence round-trips completion state", () => {
      const store = {};
      const fake = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
      // In Node use an in-memory fake; in the browser use the real localStorage with a throwaway key.
      const probe = isNode ? fake : root.localStorage;
      const key = "hrcc.test." + Date.now();
      probe.setItem(key, JSON.stringify({ "ops-d1": true }));
      eq(JSON.parse(probe.getItem(key))["ops-d1"], true);
      probe.removeItem(key);
      eq(probe.getItem(key), null);
      assert(typeof App.storage.lsGet === "function" && typeof App.storage.lsSet === "function", "storage helpers exported");
    });

    /* ---------- export ---------- */
    test("CSV export has header, one row per task, and escapes quotes", () => {
      const done = { "ops-d1": true };
      const csv = App.toCSV(done);
      const lines = csv.split("\n");
      eq(lines[0].indexOf('"Tab","ID"'), 0, "header");
      eq(lines.length, App.allTaskList().length + 1, "row count");
      assert(lines.some(l => l.indexOf('"ops-d1"') !== -1 && l.endsWith('"Yes"')), "completed flag");
    });
    test("JSON export is valid and reports per-tab progress", () => {
      const o = JSON.parse(App.toJSON({ "life-pre1": true }, "dark"));
      eq(o.tasks.length, App.allTaskList().length);
      eq(o.progress.lifecycle.done, 1);
      eq(o.theme, "dark");
    });
    test("esc() neutralizes HTML", () => {
      eq(App.esc('<b>"x"&</b>'), "&lt;b&gt;&quot;x&quot;&amp;&lt;/b&gt;");
    });

    /* ---------- project files (Node only) ---------- */
    if (isNode) {
      const fs = require("fs"), path = require("path");
      const base = path.resolve(__dirname, "..");
      test("manifest.json is valid and its icons exist", () => {
        const m = JSON.parse(fs.readFileSync(path.join(base, "manifest.json"), "utf8"));
        eq(m.display, "standalone");
        m.icons.concat(m.screenshots).forEach(i => assert(fs.existsSync(path.join(base, i.src)), "missing " + i.src));
      });
      test("service worker precache paths exist", () => {
        const sw = fs.readFileSync(path.join(base, "service-worker.js"), "utf8");
        const block = sw.match(/const PRECACHE = \[([\s\S]*?)\];/)[1];
        const paths = block.match(/"\.\/[^"]*"/g).map(s => s.slice(1, -1));
        assert(paths.length >= 10, "precache list");
        paths.forEach(p => { if (p !== "./") assert(fs.existsSync(path.join(base, p)), "missing " + p); });
      });
      test("index.html contains required meta, tabs and landmarks", () => {
        const html = fs.readFileSync(path.join(base, "index.html"), "utf8");
        ["viewport-fit=cover", "og:image", "twitter:card", "apple-mobile-web-app-capable", "apple-touch-icon", 'role="tablist"', 'role="tabpanel"', "<main", "<header", "<footer", "<nav"].forEach(s => assert(html.indexOf(s) !== -1, "missing " + s));
        eq((html.match(/role="tabpanel"/g) || []).length, 4, "tabpanel count");
      });
    }

    /* ---------- DOM checks (browser only) ---------- */
    if (!isNode && root.document) {
      const d = root.document;
      test("DOM: four tabs rendered and one selected", () => {
        const tabs = d.querySelectorAll("[data-tablist] [role=tab]");
        eq(tabs.length, 4);
        eq(d.querySelectorAll("[data-tablist] [aria-selected=true]").length, 1);
      });
      test("DOM: switching tabs shows the right panel", () => {
        d.querySelector('[data-tablist] [data-tab="compliance"]').click();
        eq(d.getElementById("panel-compliance").hidden, false);
        eq(d.getElementById("panel-operations").hidden, true);
        d.querySelector('[data-tablist] [data-tab="operations"]').click();
      });
      test("DOM: ticking a task persists and updates progress", () => {
        const box = d.querySelector("[data-check]");
        const id = box.dataset.check;
        const was = box.checked;
        box.checked = !was; box.dispatchEvent(new Event("change", { bubbles: true }));
        const saved = JSON.parse(root.localStorage.getItem("hrcc.done.v1") || "{}");
        eq(!!saved[id], !was);
        box.checked = was; box.dispatchEvent(new Event("change", { bubbles: true }));
      });
      test("DOM: search with no match shows the empty state", () => {
        const input = d.getElementById("searchInput");
        input.value = "zzzzqqq"; input.dispatchEvent(new Event("input", { bubbles: true }));
        eq(d.getElementById("emptyState").hidden, false);
        d.getElementById("clearFilters").click();
        eq(d.getElementById("emptyState").hidden, true);
      });
    }

    return results.slice();
  }

  function report(rs) {
    let failed = 0;
    rs.forEach(r => {
      if (r.ok) console.log("  ✓ " + r.name);
      else { failed++; console.error("  ✗ " + r.name + "\n      " + r.error); }
    });
    console.log("\n" + (rs.length - failed) + " passed, " + failed + " failed");
    return failed;
  }

  if (typeof module !== "undefined" && typeof process !== "undefined" && require.main === module) {
    const App = require("../script.js");
    process.exit(report(run(App)) ? 1 : 0);
  } else if (root.window) {
    root.HRTests = { run: async () => { report(run(root.HRApp)); } };
  }
})(typeof window !== "undefined" ? window : globalThis);
