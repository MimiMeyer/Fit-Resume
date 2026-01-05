"use client";

import { AboutLayout } from "./view";
import { useProfile } from "@/app/local/useProfile";

export default function ProfilePage() {
  const { profile, loadError, isPending, startTransition, updateProfile } = useProfile();

  if (loadError) {
    return <div className="text-sm text-rose-700">{loadError}</div>;
  }

  if (!profile) {
    return <div className="text-sm text-zinc-600">Loading…</div>;
  }

  return (
    <AboutLayout
      profile={profile}
      isPending={isPending}
      startTransition={startTransition}
      updateProfile={updateProfile}
    />
  );
}

