/**
 * useInterval Hook
 *
 * The following code is the work of Dan Abramov, copied and distributed with
 * permission.
 *
 * Originally published at:
 * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 *
 **/

import { useEffect, useRef } from 'react';

export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
