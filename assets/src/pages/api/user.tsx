import type { NextApiRequest, NextApiResponse } from 'next';

import { getCurrentUserId, isTokenCurrent } from 'utils';

const getUserFromSessionCookie = async (req: NextApiRequest) => {
  const token = req.cookies?.access_token;
  if (!token) return;

  // Check if the token is valid
  const userId: number = getCurrentUserId(token);
  const isUserTokenValid: boolean = isTokenCurrent(token);
  if (userId == null || !isUserTokenValid) return;

  const apiResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer: ${token}`,
      },
    }
  );
  const user = await apiResponse.json();

  return user;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getUserFromSessionCookie(req);

  if (!user) {
    // Return the same error the API would return for an invalid token
    res.status(401).json({ error: { code: 401, type: 'INVALID_TOKEN' } });
    return;
  }

  res.status(200).json(user);
};

export default handler;
