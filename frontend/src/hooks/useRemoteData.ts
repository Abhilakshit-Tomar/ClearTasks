import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "@/lib/studio";

type RequestScope = { active: boolean; version: number };

/** Keep the last successful response visible when a background refresh fails. */
export function useRemoteData<T>(load: () => Promise<T>, pollMs = 0) {
  const [state, setState] = useState<{
    source: typeof load;
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({ source: load, data: null, loading: true, error: null });
  const scopeRef = useRef<RequestScope>({ active: false, version: 0 });
  const refresh = useCallback(async () => {
    const scope = scopeRef.current;
    const version = ++scope.version;
    try {
      const data = await load();
      if (scope.active && scope.version === version)
        setState({ source: load, data, loading: false, error: null });
      return data;
    } catch (error) {
      if (scope.active && scope.version === version)
        setState((previous) => ({
          source: load,
          data: previous.source === load ? previous.data : null,
          loading: false,
          error: errorMessage(
            error,
            "We couldn’t load this information. Please try again.",
          ),
        }));
      return null;
    }
  }, [load]);
  useEffect(() => {
    const scope: RequestScope = { active: true, version: 0 };
    scopeRef.current = scope;
    // oxlint-disable-next-line react/set-state-in-effect -- Network results settle asynchronously; the effect owns their lifecycle.
    void refresh();
    const interval = pollMs
      ? window.setInterval(() => {
          if (!document.hidden) void refresh();
        }, pollMs)
      : undefined;
    return () => {
      scope.active = false;
      if (interval) clearInterval(interval);
    };
  }, [refresh, pollMs]);
  const updateData = useCallback(
    (update: (data: T) => T) => {
      ++scopeRef.current.version;
      setState((previous) =>
        previous.source !== load || previous.data === null
          ? previous
          : { ...previous, data: update(previous.data) },
      );
    },
    [load],
  );
  const current =
    state.source === load ? state : { data: null, loading: true, error: null };
  return {
    data: current.data,
    loading: current.loading,
    error: current.error,
    refresh,
    updateData,
  };
}
