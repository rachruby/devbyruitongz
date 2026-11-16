const http = require("http");
const { createStore } = require("./notes-store");

const port = Number(process.env.NOTES_PORT || 4742);
const host = process.env.NOTES_HOST || "127.0.0.1";
const windowMs = 10 * 60 * 1000;
const maxNotes = 8;
const hits = new Map();

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 2048) {
        reject(new Error("too-large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function allowed(ip) {
  const now = Date.now();
  const slot = hits.get(ip);
  if (!slot || now - slot.start > windowMs) {
    return true;
  }
  return slot.count < maxNotes;
}

function count(ip) {
  const now = Date.now();
  const slot = hits.get(ip);
  if (!slot || now - slot.start > windowMs) {
    hits.set(ip, { count: 1, start: now });
    return;
  }
  slot.count += 1;
}

async function main() {
  const store = await createStore();
  const server = http.createServer(async (req, res) => {
    const url = (req.url || "").split("?")[0];
    if (url !== "/api/notes") {
      send(res, 404, { error: "Not found." });
      return;
    }
    try {
      if (req.method === "GET") {
        send(res, 200, { notes: await store.list() });
        return;
      }
      if (req.method !== "POST") {
        res.writeHead(405, { Allow: "GET, POST" });
        res.end();
        return;
      }
      if (!String(req.headers["content-type"] || "").includes("application/json")) {
        send(res, 415, { error: "Send the note as JSON." });
        return;
      }
      const ip = req.socket.remoteAddress || "local";
      if (!allowed(ip)) {
        send(res, 429, { error: "Too many notes. Try again in a little while." });
        return;
      }
      const raw = await readBody(req);
      let payload;
      try {
        payload = JSON.parse(raw || "{}");
      } catch {
        send(res, 400, { error: "That note could not be read." });
        return;
      }
      const note = await store.add(payload);
      if (!note) {
        send(res, 400, { error: "Write a note before saving." });
        return;
      }
      count(ip);
      send(res, 201, { note });
    } catch (error) {
      if (error && error.message === "too-large") {
        send(res, 413, { error: "That note is too long." });
        return;
      }
      send(res, 500, { error: "The note could not be saved." });
    }
  });

  server.listen(port, host, () => {
    process.stdout.write(`Notes server listening on ${host}:${port}\n`);
  });
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
