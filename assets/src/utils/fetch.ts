const fetcher = (url: string) => {
  return fetch(url).then((response) => response.json());
};

export default fetcher;
