import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function createMockResponse(res) {
  let statusCode = 200;
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    },
  };
}

async function runHandler(handlerPath, req, res) {
  const { default: handler } = await import(pathToFileURL(handlerPath).href);
  const mockReq = {
    method: req.method,
    body: await readJsonBody(req),
  };
  await handler(mockReq, createMockResponse(res));
}

/** Proxy /api/* către funcțiile Vercel în timpul `astro dev`. */
export default function devApiPlugin() {
  return {
    name: 'mindleap-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/api/resource-lead' && req.method === 'POST') {
          try {
            await runHandler(join(rootDir, 'api/resource-lead.js'), req, res);
          } catch (error) {
            console.error('dev-api resource-lead:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Eroare server' }));
          }
          return;
        }

        if (url === '/api/contact' && req.method === 'POST') {
          const contactPath = join(rootDir, 'api/contact.js');
          if (!existsSync(contactPath)) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Endpoint indisponibil în dev' }));
              return;
          }
          try {
            await runHandler(contactPath, req, res);
          } catch (error) {
            console.error('dev-api contact:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Eroare server' }));
          }
          return;
        }

        next();
      });
    },
  };
}
