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

import * as React from 'react';

export const useInterval = (callback, delay) => {
  const savedCallback = React.useRef();

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
