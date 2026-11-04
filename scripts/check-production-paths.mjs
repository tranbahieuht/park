// Check local imports and public assets using case-sensitive directory entries,
// even on Windows. --git additionally requires dependencies to be in Git's index.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const relative = file => path.relative(root, file).split(path.sep).join("/");
const required = new Set();
const visitedCss = new Set();
const problems = new Set();
const directories = new Map();
const configPath = ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.json");
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);

function check(file, owner) {
  file = path.resolve(file);
  const name = relative(file);
  if (name.startsWith("../") || path.isAbsolute(name)) {
    problems.add(`${owner}: path outside project: ${name}`);
    return false;
  }
  let current = root;
  for (const segment of name.split("/")) {
    let entries = directories.get(current);
    if (!entries) {
      entries = fs.existsSync(current) && fs.statSync(current).isDirectory() ? fs.readdirSync(current) : [];
      directories.set(current, entries);
    }
    if (!entries.includes(segment)) {
      const actual = entries.find(entry => entry.toLowerCase() === segment.toLowerCase());
      problems.add(`${owner}: ${name}: ${actual ? `case mismatch (${segment} -> ${actual})` : `missing ${segment}`}`);
      return false;
    }
    current = path.join(current, segment);
  }
  if (!fs.statSync(current).isFile()) {
    problems.add(`${owner}: expected file: ${name}`);
    return false;
  }
  required.add(name);
  return true;
}

function asset(value, owner) {
  const clean = value.split(/[?#]/)[0];
  if (!clean.startsWith("/sites/") || !/\.[a-z0-9]+$/i.test(clean)) return;
  const file = path.join(root, "public", clean.slice(1));
  if (check(file, owner) && clean.endsWith(".css")) css(file);
}

function css(file) {
  if (visitedCss.has(file)) return;
  visitedCss.add(file);
  const source = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const owner = relative(file);
  for (const match of source.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)) {
    const specifier = match[1];
    if (specifier.startsWith("/")) asset(specifier, owner);
    else if (specifier.startsWith(".")) {
      const target = path.resolve(path.dirname(file), specifier);
      if (check(target, owner)) css(target);
    }
  }
  for (const match of source.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
    const value = match[1];
    if (value.startsWith("/")) asset(value, owner);
    else if (!/^(?:[a-z]+:|#)/i.test(value)) check(path.resolve(path.dirname(file), value.split(/[?#]/)[0]), owner);
  }
}

function moduleImport(specifier, file) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return;
  const owner = relative(file);
  if (specifier.endsWith(".css")) {
    const target = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2)) : path.resolve(path.dirname(file), specifier);
    if (check(target, owner)) css(target);
    return;
  }
  const resolved = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule;
  if (!resolved) problems.add(`${owner}: unresolved import ${specifier}`);
  else check(resolved.resolvedFileName, `${owner} (${specifier})`);
}

function sourceFile(file) {
  check(file, "source");
  const ast = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) moduleImport(node.moduleSpecifier.text, file);
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(ast) === "require") && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) moduleImport(node.arguments[0].text, file);
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) asset(node.text, relative(file));
    ts.forEachChild(node, visit);
  }
  visit(ast);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(?:[cm]?[jt]sx?)$/.test(entry.name)) sourceFile(file);
  }
}
walk(path.join(root, "src"));
for (const name of fs.readdirSync(root)) {
  if (/\.config\.(?:[cm]?[jt]s)$/.test(name)) sourceFile(path.join(root, name));
}
check(path.join(root, "scripts/check-production-paths.mjs"), "build script");
const map = path.join(root, "public/sites/nortonpark/assets/map/location-map.html");
if (check(map, "map iframe")) css(map);

if (process.argv.includes("--git")) {
  const tracked = new Set(execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" }).split("\0"));
  for (const file of required) if (!tracked.has(file)) problems.add(`Not in Git index: ${file}`);
}
if (problems.size) {
  console.error([...problems].join("\n"));
  process.exitCode = 1;
} else console.log(`Production paths PASS: ${required.size} source/import/asset files, exact casing${process.argv.includes("--git") ? ", all indexed by Git" : ""}.`);
