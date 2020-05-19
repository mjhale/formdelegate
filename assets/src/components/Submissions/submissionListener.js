import { normalize } from 'normalizr';
import { Socket } from 'phoenix';

import { getCurrentUserId } from 'utils';
import { submissionSchema } from 'schema';

// @TODO: Add handler for submission updates (e.g., flagged by spam by Akismet response)
export const submissionListener = addSubmissionDispatcher => {
  const currentUserToken = localStorage.getItem('fd_token');
  const currentUserId = getCurrentUserId(currentUserToken);

  // @TODO: Improve API host resolution
  const API_HOST = process.env.REACT_APP_API_HOST;
  const socketUrl = API_HOST
    ? 'wss://api.formdelegate.com/socket'
    : 'ws://localhost:4000/socket';

  const socket = new Socket(socketUrl, {
    params: { jwt: currentUserToken },
  });

  socket.connect();

  let channel = socket.channel(`form_submission:${currentUserId}`, {});

  channel.join();

  channel.on('new_msg', payload => {
    addSubmissionDispatcher(normalize(payload.data, submissionSchema));
  });
};
