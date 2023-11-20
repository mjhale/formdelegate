import type { NextApiRequest, NextApiResponse } from 'next';

import {
  createProxyMiddleware,
  responseInterceptor,
} from 'http-proxy-middleware';
import { serialize } from 'cookie';

export const config = {
  api: {
    bodyParser: false,
  },
};

const proxy = createProxyMiddleware({
  target: process.env.NEXT_PUBLIC_API_HOST,
  changeOrigin: true,
  selfHandleResponse: true,
  secure: true,
  logLevel: 'debug',
  pathRewrite: { ['^/api']: '' },
  onProxyRes: responseInterceptor(
    async (buffer, proxyRes, req: NextApiRequest, res: NextApiResponse) => {
      if (req.method === 'DELETE') {
        res.setHeader('Set-Cookie', [
          serialize('access_token', undefined, {
            httpOnly: true,
            maxAge: -1,
            sameSite: 'lax',
            secure: process.env.NODE_ENV !== 'development',
            path: '/',
          }),
          serialize('user_id', undefined, {
            httpOnly: false,
            maxAge: -1,
            sameSite: 'lax',
            secure: process.env.NODE_ENV !== 'development',
            path: '/',
          }),
        ]);

        res.statusCode = 204;
        return '';
      }

      const apiResponse = buffer.toString('utf8');
      res.statusCode = proxyRes.statusCode;

      try {
        const json = JSON.parse(apiResponse);

        if (req.method === 'POST' && json.data?.token && json.data?.id) {
          res.setHeader('Set-Cookie', [
            serialize('access_token', json.data.token, {
              httpOnly: true,
              maxAge: 60 * 60 * 24 * 7, // 7 days
              sameSite: 'lax',
              secure: process.env.NODE_ENV !== 'development',
              path: '/',
            }),
            serialize('user_id', json.data.id, {
              httpOnly: false,
              maxAge: 60 * 60 * 24 * 7, // 7 days
              sameSite: 'lax',
              secure: process.env.NODE_ENV !== 'development',
              path: '/',
            }),
          ]);

          // Return only the user ID
          return JSON.stringify({ data: { id: json.data.id } });
        }
      } catch (error) {
        console.log(error);
      }

      return apiResponse;
    }
  ),
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
