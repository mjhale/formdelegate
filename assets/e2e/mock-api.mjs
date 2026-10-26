import { createServer } from 'node:http';

const host = '127.0.0.1';
const port = 3101;
const frontendOrigin = 'http://127.0.0.1:3100';
const preservedMessage = '  Symbols &=+ stay\non two lines  ';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Accept, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Origin': frontendOrigin,
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    ...corsHeaders,
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

async function readJson(request) {
  return JSON.parse(await readBody(request));
}

async function readForm(request) {
  return new URLSearchParams(await readBody(request));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'GET' && url.pathname === '/submission-fixture') {
    const formId =
      url.searchParams.get('success') === 'true'
        ? 'intake-success'
        : 'intake-transport';
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(`<!doctype html><html lang="en"><title>Submission fixture</title>
      <form action="${frontendOrigin}/f/${formId}" method="post" enctype="multipart/form-data">
        <label>Name<input name="name" value="Synthetic sender"></label>
        <label>Message<textarea name="message">Symbols &amp;=+ stay</textarea></label>
        <label>Attachment<input type="file" name="attachment"></label>
        <button type="submit">Submit form</button>
        <button type="button" id="ajax">Submit as AJAX</button>
      </form><pre id="result" role="status"></pre>
      <script>
        document.querySelector('#ajax').addEventListener('click', async () => {
          const form = document.querySelector('form');
          const result = document.querySelector('#result');
          try {
            const response = await fetch(form.action, {
              method: 'POST', body: new FormData(form),
              headers: { Accept: 'application/json' }, credentials: 'omit'
            });
            result.textContent = JSON.stringify({
              status: response.status, data: await response.json()
            });
          } catch (error) { result.textContent = error.message; }
        });
      </script></html>`);
    return;
  }

  if (url.pathname.startsWith('/v1/submissions/intake-')) {
    // This stub checks transport only. Phoenix tests cover the source policy.
    const sourceHeaders = {
      ...corsHeaders,
      'Access-Control-Allow-Origin': 'http://localhost:3101',
    };
    if (request.method === 'OPTIONS') {
      response.writeHead(204, sourceHeaders);
      response.end();
      return;
    }

    const body = await readBody(request);
    const observed = {
      origin: request.headers.origin,
      referer: request.headers.referer,
      userAgent: request.headers['user-agent'],
      contentType: request.headers['content-type'],
      body,
    };
    const allowed = request.headers.origin === 'http://localhost:3101';

    if (allowed && url.pathname === '/v1/submissions/intake-success') {
      response.writeHead(302, {
        ...sourceHeaders,
        Location: `${frontendOrigin}/submissions/success`,
      });
      response.end();
      return;
    }

    response.writeHead(allowed ? 202 : 403, {
      ...sourceHeaders,
      'Content-Type': 'application/json',
    });
    response.end(JSON.stringify(observed));
    return;
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (
    request.method === 'POST' &&
    ['/forms/contact', '/forms/support'].includes(request.url)
  ) {
    response.writeHead(307, {
      ...corsHeaders,
      Location: `/v1/submissions/${request.url.split('/').at(-1)}`,
    });
    response.end();
    return;
  }

  if (
    request.method === 'POST' &&
    ['/v1/submissions/contact', '/v1/submissions/support'].includes(request.url)
  ) {
    const body = await readForm(request);
    const email = body.get('email');

    if (email === 'message-unavailable@example.test') {
      sendJson(response, 503, {
        error: { code: 503, type: 'SERVICE_UNAVAILABLE' },
      });
      return;
    }

    if (email === 'message-preserve@example.test') {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (
        body.get('name') !== 'Ada Lovelace' ||
        body.get('message') !== preservedMessage
      ) {
        sendJson(response, 422, {
          error: { code: 422, type: 'INVALID_TEST_PAYLOAD' },
        });
        return;
      }
    }

    sendJson(response, 202, { submission: 'Accepted' });
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

  if (request.method === 'GET' && request.url === '/v1/users/202') {
    if (request.headers.authorization !== 'Bearer e2e-token-member') {
      sendJson(response, 401, { error: { code: 401, type: 'UNAUTHORIZED' } });
      return;
    }

    const team = {
      id: 'team-e2e',
      name: 'E2E Team',
      stripe_customer_id: null,
      subscriptions: [],
    };
    const membership = {
      id: 'membership-e2e',
      is_billing_account: true,
      team,
    };

    sendJson(response, 200, {
      data: {
        current_membership: membership,
        current_team: team,
        memberships: [membership],
        user: {
          confirmed_at: null,
          email: 'member@example.test',
          form_count: 0,
          id: 202,
          is_admin: false,
          name: 'E2E Member',
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
