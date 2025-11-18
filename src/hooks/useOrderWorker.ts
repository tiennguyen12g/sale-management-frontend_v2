// hooks/useOrderWorker.ts
import { useEffect, useRef } from "react";
import { socketAPI } from "@/config/api";

export const useOrderWorker = (staffID: string) => {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/orderWorker.js", import.meta.url),
      { type: "classic" }
    );

    workerRef.current = worker;

    worker.postMessage({
      type: "connect",
      staffID,
      serverUrl: socketAPI,
    });

    return () => {
      worker.postMessage({ type: "disconnect" });
      worker.terminate();
    };
  }, [staffID]);

  return workerRef;
};
