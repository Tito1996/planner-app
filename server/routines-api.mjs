import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routinesPath = path.join(__dirname, '..', 'public', 'routines.json');
const PORT = process.env.ROUTINES_API_PORT || 3001;

function withCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function isValidRoutineArray(value) {
  return Array.isArray(value) && value.every((item) => item && typeof item.id === 'number' && typeof item.name === 'string' && item.days && typeof item.days === 'object');
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

const server = createServer(async (req, res) => {
  withCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/routines' && req.method === 'GET') {
    try {
      const content = await fs.readFile(routinesPath, 'utf-8');
      const parsed = JSON.parse(content);

      if (!isValidRoutineArray(parsed)) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid routines format in JSON file' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(parsed));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }));
    }
    return;
  }

  if (req.url === '/api/routines' && req.method === 'PUT') {
    try {
      const body = await readBody(req);
      const parsed = JSON.parse(body);

      if (!isValidRoutineArray(parsed)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request body must be a valid routine array' }));
        return;
      }

      await fs.writeFile(routinesPath, JSON.stringify(parsed, null, 2) + '\n', 'utf-8');
      res.writeHead(204);
      res.end();
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }));
    }
    return;
  }

  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Routines API listening on http://localhost:${PORT}`);
});
