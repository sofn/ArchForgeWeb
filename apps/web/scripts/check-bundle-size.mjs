#!/usr/bin/env node
// Zero-dependency bundle budget check (replaces size-limit, whose glob+gzip
// analysis of .next/ crashed the CI sandbox repeatedly).
//
// Runs AFTER `next build`:
//   node scripts/check-bundle-size.mjs
// Fails (exit 1) when the gzipped client JS or CSS exceeds the budget,
// printing per-file top offenders for quick triage. CI runs it in the build
// job, so a regression blocks the merge.

/* eslint-disable no-console -- CLI reporting tool, console is the interface */
import { readdir, readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const ROOT = path.join(process.cwd(), ".next", "static");

// Budgets (gzip), set at baseline+margin (JS 435.5kB / CSS 107.5kB measured with
// next/font + highlight.js theming): the first goal is regression-blocking,
// not immediate dieting — tighten after shipping targeted optimizations.
const JS_BUDGET_KB = 450;
const CSS_BUDGET_KB = 120;

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.name.endsWith(".js") || e.name.endsWith(".css")) out.push(p);
  }
  return out;
}

function gzipSize(buf) {
  return gzipSync(buf, { level: 9 }).length;
}

const files = await walk(ROOT);
const rows = [];
for (const f of files) {
  const buf = await readFile(f);
  rows.push({
    file: path.relative(process.cwd(), f),
    type: f.endsWith(".js") ? "js" : "css",
    gz: gzipSize(buf),
    raw: buf.length,
  });
}

const jsTotal = rows.filter((r) => r.type === "js").reduce((a, r) => a + r.gz, 0);
const cssTotal = rows.filter((r) => r.type === "css").reduce((a, r) => a + r.gz, 0);
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;

console.log(`client JS  (gzip): ${kb(jsTotal)} / budget ${JS_BUDGET_KB} kB`);
console.log(`client CSS (gzip): ${kb(cssTotal)} / budget ${CSS_BUDGET_KB} kB`);

for (const type of ["js", "css"]) {
  const top = rows
    .filter((r) => r.type === type)
    .sort((a, b) => b.gz - a.gz)
    .slice(0, 5);
  if (top.length) {
    console.log(`\ntop ${type} files:`);
    for (const r of top) console.log(`  ${kb(r.gz).padStart(9)}  ${r.file}`);
  }
}

const over = [];
if (jsTotal / 1024 > JS_BUDGET_KB) over.push(`JS ${kb(jsTotal)} > ${JS_BUDGET_KB} kB`);
if (cssTotal / 1024 > CSS_BUDGET_KB) over.push(`CSS ${kb(cssTotal)} > ${CSS_BUDGET_KB} kB`);

if (over.length) {
  console.error(`\n✖ bundle budget exceeded: ${over.join("; ")}`);
  process.exit(1);
}
console.log("\n✓ within budget");
