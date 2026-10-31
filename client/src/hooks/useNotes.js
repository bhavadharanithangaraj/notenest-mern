// Loads the notes (and the tag list) for the current search/tag filter and
// tracks the request state: 'loading' | 'ready' | 'error'. A newer request
// cancels an older one, so fast typing never shows stale results.
import { useCallback, useEffect, useRef, useState } from 'react';
import { notesApi } from '../api/client';

export default function useNotes({ search, tag }) {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const controllerRef = useRef(null);
  const loadedOnce = useRef(false);

  // `silent` keeps the current list on screen while refreshing (after a save).
  const load = useCallback(
    async ({ silent = false } = {}) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      if (!silent) setStatus('loading');
      try {
        const [list, tagList] = await Promise.all([
          notesApi.list({ search, tag, signal: controller.signal }),
          notesApi.tags(),
        ]);
        if (controller.signal.aborted) return;
        setNotes(list.data);
        setTags(tagList.data);
        setStatus('ready');
        loadedOnce.current = true;
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setStatus('error');
      }
    },
    [search, tag],
  );

  // Only the very first load shows the big spinner; new searches keep the
  // current notes on screen until the results arrive.
  useEffect(() => {
    load({ silent: loadedOnce.current });
    return () => controllerRef.current?.abort();
  }, [load]);

  return { notes, tags, status, error, reload: load };
}
