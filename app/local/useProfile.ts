"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { Profile } from "@/types/profile";
import { loadProfile, saveProfile } from "@/app/local/profile-store";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await loadProfile();
        if (!cancelled) setProfile(loaded);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load profile.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const flushSave = useCallback(
    async (next: Profile) => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      await saveProfile(next);
    },
    [],
  );

  const queueSave = useCallback(
    (next: Profile) => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = window.setTimeout(() => {
        void saveProfile(next);
        saveTimerRef.current = null;
      }, 250);
    },
    [],
  );

  const updateProfile = useCallback(
    (updater: (current: Profile) => Profile, opts?: { flush?: boolean }) => {
      if (!profile) return;
      const next = updater(profile);
      setProfile(next);
      if (opts?.flush) {
        startTransition(() => {
          void flushSave(next);
        });
      } else {
        queueSave(next);
      }
    },
    [flushSave, profile, queueSave, startTransition],
  );

  return {
    profile,
    setProfile,
    loadError,
    isPending,
    startTransition,
    updateProfile,
    flushSave,
  };
}

