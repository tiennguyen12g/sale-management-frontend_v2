// hydrationHook.ts
import { useEffect, useState } from "react";
import { useAuthStore } from "./authStore";

export const useHydrateAuth = () => {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand persist to finish rehydration
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
      useAuthStore.setState({ hydrated: true });
    });

    // Check if already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
      useAuthStore.setState({ hydrated: true });
    }

    return () => {
      unsubscribe();
    };
  }, []);

  return hasHydrated;
};
