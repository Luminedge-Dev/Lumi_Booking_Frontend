import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const pages = [
  "src/app/(withDashboard)/dashboard/contact1/page.tsx",
  "src/app/(withDashboard)/dashboard/[...contact]/page.tsx",
  "src/app/(withDashboard)/dashboard/terms/page.tsx",
  "src/app/terms-and-conditions/page.tsx",
];

test("active contact and terms pages display the approved office address and phone", () => {
  for (const file of pages) {
    const page = source(file);
    assert.match(page, /42 Satmasjid Road, Dhanmondi/, file);
    assert.match(page, /01400-403485/, file);
    assert.doesNotMatch(page, /743 Satmasjid|Dhanmondi 9\/A/, file);
  }
});

test("booking confirmation pages direct students to their booking-specific venue", () => {
  for (const file of pages.slice(0, 2)) {
    const page = source(file);
    assert.match(page, /venue listed in your booking details/, file);
    assert.doesNotMatch(page, /Venue Information:<\/strong> Level 12|Arrive at the Luminedge office/, file);
  }
});

test("the unrelated student phone placeholder and additional support numbers remain unchanged", () => {
  const registration = source("src/app/register/page.tsx");
  assert.match(registration, /placeholder="01400403474"/);
  for (const file of pages) {
    assert.match(source(file), /01400-403474/);
  }
});

test("corrected contact sections preserve existing phone and email copy", () => {
  for (const file of pages) {
    const page = source(file);
    assert.match(page, /01400-403475/);
    assert.match(page, /ielts\.luminedge@gmail\.com/);
  }
});
