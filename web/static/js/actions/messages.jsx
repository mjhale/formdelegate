import fetch from 'isomorphic-fetch';

export const REQUEST_MESSAGES = 'REQUEST_MESSAGES';
export const RECEIVE_MESSAGES = 'RECEIVE_MESSAGES';
export const SEARCH_MESSAGES = 'SEARCH_MESSAGES';

function requestMessages(requestedPage) {
  return {
    type: REQUEST_MESSAGES,
    requestedPage: requestedPage,
  };
}

function receiveMessages(json, currentPage, itemsPerPage, totalItems, totalPages) {
  return {
    type: RECEIVE_MESSAGES,
    response: json.data,
    receivedAt: Date.now(),
    itemsPerPage,
    currentPage,
    totalPages,
    totalItems,
  };
}

export function searchMessages(searchText) {
  return {
    type: SEARCH_MESSAGES,
    text: searchText || '',
  };
}

export function fetchMessages(requestedPage) {
  if (!requestedPage) requestedPage = 1;

  return (dispatch) => {
    dispatch(requestMessages(requestedPage));

    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch(`/api/messages?page=${requestedPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) =>
        response.json().then((json) => {
          if (!response.ok) return Promise.reject(json);

          const totalItems = Number(response.headers.get('total'));
          if (!totalItems) return null;

          const currentPage = Number(response.headers.get('page-number'));
          const itemsPerPage = Number(response.headers.get('per-page'));
          const totalPages = Number(response.headers.get('total-pages'));

          return dispatch(receiveMessages(json, currentPage, itemsPerPage, totalItems, totalPages));
        })
      );
    } else {
      throw 'No token found.';
    }
  };
}
