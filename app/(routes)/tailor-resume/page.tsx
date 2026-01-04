"use client";

import { CreateResumeView } from "./view";
import { useProfile } from "@/app/local/useProfile";
import { generateResume } from "@/server/resume/resume.service";

export default function TailorResumePage() {
  const { profile, loadError, updateProfile } = useProfile();

  if (loadError) {
    return <div className="text-sm text-rose-700">{loadError}</div>;
  }

  if (!profile) {
    return <div className="text-sm text-zinc-600">Loading…</div>;
  }

  return (
    <CreateResumeView
      profile={profile}
      updateProfile={updateProfile}
      onGenerate={(jobDescription) => generateResume(profile, jobDescription)}
    />
  );
}
