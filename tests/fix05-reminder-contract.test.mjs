import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const pagePath = new URL("../src/app/(withAdmin)/admin/[id]/page.tsx", import.meta.url);
const page = await readFile(pagePath, "utf8");

test("reminder request sends only the schedule identifier", () => {
  assert.match(page, /http\.post\(`\$\{API\}\/api\/v1\/send-reminder`,\s*\{\s*scheduleId\s*\}\)/);
  assert.doesNotMatch(page, /emails:\s*emailData|subject:\s*["'`]|message:\s*`/);
});

test("reminder UI does not use local storage as delivery truth", () => {
  assert.doesNotMatch(page, /emailsSent_|localStorage/);
});

test("reminder action awaits the API and handles complete, partial and failure outcomes", () => {
  assert.match(page, /await http\.post\(/);
  assert.match(page, /response\.status === 200/);
  assert.match(page, /response\.status === 207/);
  assert.match(page, /response\?\.status === 502/);
  assert.match(page, /response\?\.status === 403/);
  assert.match(page, /response\?\.status === 400 \|\| response\?\.status === 404/);
});

test("rapid duplicate submissions are guarded synchronously and visibly in flight", () => {
  assert.match(page, /const reminderInFlight = useRef\(false\)/);
  assert.match(page, /if \(reminderInFlight\.current\) return/);
  assert.match(page, /disabled=\{isSendingReminder\}/);
  assert.match(page, /finally\s*\{\s*reminderInFlight\.current = false/);
});

