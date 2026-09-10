import { useCallback, useEffect, useRef, useState } from "react";
import { loadMarketSnapshot, type MarketSnapshot } from "./xrplHeatmapData";

export function useXrplMarketSnapshot() {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const pending = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setSnapshot(null);
    setState("loading");
    try {
      const result = await loadMarketSnapshot(controller.signal);
      if (!controller.signal.aborted) { setSnapshot(result); setState("success"); }
    } catch {
      if (!controller.signal.aborted) setState("error");
    }
  }, []);
  useEffect(() => { void refresh(); return () => pending.current?.abort(); }, [refresh]);
  return { snapshot, state, refresh };
}
