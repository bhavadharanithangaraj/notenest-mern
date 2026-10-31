// Returns `value` only after it has stopped changing for `delay` ms.
// Used by search so we call the API once you pause typing, not on every key.
import { useEffect, useState } from 'react';

export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
