import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const page = read("src/app/page.tsx");
const copy = read("src/content/homepage-v42-copy.ts");
const closing = read("src/components/public/HomeClosing.tsx");
const services = read("src/components/public/HomeServicesSection.tsx");
const css = read("src/components/public/Homepage.module.css");

test("V4.2 explicitly distinguishes independent guidance and paid accompaniment", () => {
  assert.match(copy, /plateforme indépendante/);
  assert.match(copy, /Aucun accompagnement payant n’est automatiquement inclus/);
  assert.match(copy, /ne garantit ni admission ni visa/);
  assert.match(copy, /Pour accéder aux services payants, il faut accepter une offre, payer et recevoir une confirmation/);
  assert.match(page, /brandFooter=\{v42\.footer\}/);
  assert.match(closing, /footer\.disclaimer/);
  assert.match(services, /orientationHref/);
});

test("V4.2 service cards remain accessible and responsive", () => {
  assert.match(services, /<article key=\{title\}/);
  assert.match(services, /<Link className=\{s\.v42ServiceAction\}/);
  assert.match(css, /\.v42ServiceAction:focus-visible/);
  assert.match(css, /@media \(max-width: 899px\)[\s\S]*\.v42ServiceGrid \{ grid-template-columns: 1fr/);
});
