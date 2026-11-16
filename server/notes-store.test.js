const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { createStore } = require("./notes-store");

test("saves a visitor note and lists it back", async () => {
  const file = path.join(os.tmpdir(), `notes-${Date.now()}.json`);
  const store = await createStore({ file });
  const saved = await store.add({ author: "Avery", body: "Loved the OpenTable window." });
  assert.equal(saved.author, "Avery");
  const notes = await store.list();
  assert.equal(notes[0].body, "Loved the OpenTable window.");
  fs.unlinkSync(file);
});

test("rejects an empty note", async () => {
  const file = path.join(os.tmpdir(), `notes-empty-${Date.now()}.json`);
  const store = await createStore({ file });
  assert.equal(await store.add({ author: "Avery", body: "   " }), null);
});
