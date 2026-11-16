const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DEFAULT_FILE = path.join(__dirname, "..", "data", "visitor-notes.json");

function clean(value, max) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function asNote(row) {
  return {
    id: row.id,
    author: row.author,
    body: row.body,
    createdAt: new Date(row.createdAt || row.created_at).toISOString(),
  };
}

function readFile(file) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createFileStore(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let chain = Promise.resolve();
  const enqueue = (job) => {
    const run = chain.then(job, job);
    chain = run.then(() => undefined, () => undefined);
    return run;
  };

  return {
    list() {
      return enqueue(async () => readFile(file).map(asNote));
    },
    add(input) {
      return enqueue(async () => {
        const body = clean(input && input.body, 800);
        if (!body) {
          return null;
        }
        const note = {
          id: crypto.randomUUID(),
          author: clean(input && input.author, 40) || "Visitor",
          body,
          createdAt: new Date().toISOString(),
        };
        const notes = [note, ...readFile(file)].slice(0, 300);
        fs.writeFileSync(file, JSON.stringify(notes, null, 2));
        return note;
      });
    },
  };
}

async function createPgStore(connectionString) {
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString, max: 3 });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitor_notes (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  return {
    async list() {
      const result = await pool.query(
        "SELECT id, author, body, created_at FROM visitor_notes ORDER BY created_at DESC LIMIT 300"
      );
      return result.rows.map(asNote);
    },
    async add(input) {
      const body = clean(input && input.body, 800);
      if (!body) {
        return null;
      }
      const note = {
        id: crypto.randomUUID(),
        author: clean(input && input.author, 40) || "Visitor",
        body,
        createdAt: new Date().toISOString(),
      };
      await pool.query(
        "INSERT INTO visitor_notes (id, author, body, created_at) VALUES ($1, $2, $3, $4)",
        [note.id, note.author, note.body, note.createdAt]
      );
      await pool.query(`
        DELETE FROM visitor_notes
        WHERE id NOT IN (
          SELECT id FROM visitor_notes ORDER BY created_at DESC LIMIT 300
        )
      `);
      return note;
    },
  };
}

async function createStore(options = {}) {
  if (process.env.DATABASE_URL && !options.file) {
    return createPgStore(process.env.DATABASE_URL);
  }
  return createFileStore(options.file || DEFAULT_FILE);
}

module.exports = { createStore, clean };
