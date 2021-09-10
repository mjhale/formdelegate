import type { ClientRequest } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';

import { createProxyMiddleware } from 'http-proxy-middleware';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const proxy = createProxyMiddleware({
  target: process.env.NEXT_PUBLIC_API_HOST,
  changeOrigin: true,
  autoRewrite: true,
  secure: true,
  pathRewrite: { ['^/api']: '' },
  logLevel: 'error',
  onProxyReq: async (proxyReq: ClientRequest, req: NextApiRequest) => {
    const accessToken = req.cookies?.access_token;

    if (accessToken) {
      proxyReq.setHeader('Authorization', `Bearer ${accessToken}`);
    }
  },
  onError: (err: Error) => console.error(err),
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await runMiddleware(req, res, proxy);
}

export default handler;
