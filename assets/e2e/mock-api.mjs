import { createServer } from 'node:http';

const host = '127.0.0.1';
const port = 3101;

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'POST' && request.url === '/v1/sessions') {
    let body;

    try {
      body = await readJson(request);
    } catch {
      sendJson(response, 400, { error: { code: 400, type: 'BAD_REQUEST' } });
      return;
    }

    const email = body?.session?.email;
    const password = body?.session?.password;

    if (email === 'unavailable@example.test') {
      sendJson(response, 503, {
        error: { code: 503, type: 'SERVICE_UNAVAILABLE' },
      });
      return;
    }

    if (email === 'no-team@example.test' && password === 'correct-password') {
      sendJson(response, 200, {
        data: { id: 101, token: 'e2e-token-no-team' },
      });
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    sendJson(response, 401, {
      error: { code: 401, type: 'INVALID_CREDENTIALS' },
    });
    return;
  }

  if (request.method === 'GET' && request.url === '/v1/users/101') {
    if (request.headers.authorization !== 'Bearer e2e-token-no-team') {
      sendJson(response, 401, { error: { code: 401, type: 'UNAUTHORIZED' } });
      return;
    }

    sendJson(response, 200, {
      data: {
        current_membership: null,
        current_team: null,
        memberships: [],
        user: {
          confirmed_at: null,
          email: 'no-team@example.test',
          form_count: 0,
          id: 101,
          is_admin: false,
          name: 'E2E No Team',
        },
      },
    });
    return;
  }

  sendJson(response, 404, { error: { code: 404, type: 'NOT_FOUND' } });
});

function closeServer() {
  server.close(() => process.exit(0));
}

process.once('SIGINT', closeServer);
process.once('SIGTERM', closeServer);

server.listen(port, host);
