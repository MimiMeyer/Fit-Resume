"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { styles } from "../style-constants";
import type { Profile } from "@/types/profile";
import type { ProfileBackup } from "@/types/profile-backup";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { parseProfileBackupV1, profileFromBackup, toProfileBackup } from "@/lib/profile-backup";

function downloadJson(filename: string, data: unknown) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export function ProfileBackupSection({
  profile,
  onReplaceProfile,
}: {
  profile: Profile;
  onReplaceProfile: (profile: Profile) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ message: string; tone: "success" | "error" | "" }>({
    message: "",
    tone: "",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    backup: ProfileBackup;
    displayName: string;
  } | null>(null);

  const filename = useMemo(() => {
    const day = new Date().toISOString().slice(0, 10);
    return `fitresume-profile-backup-${day}.json`;
  }, []);

  async function onDownload() {
    setStatus({ message: "", tone: "" });
    startTransition(() => {
      try {
        const backup = toProfileBackup(profile);
        downloadJson(filename, backup);
        setStatus({ message: "Backup downloaded.", tone: "success" });
      } catch (e) {
        setStatus({
          message: e instanceof Error ? e.message : "Couldn’t download the backup.",
          tone: "error",
        });
      }
    });
  }

  async function onPickFile(file: File) {
    setStatus({ message: "", tone: "" });
    try {
      if (file.size > 2_000_000) {
        throw new Error("That file is too large (max 2MB).");
      }
      const text = await file.text();
      const parsed = JSON.parse(text) as ProfileBackup;

      const displayName =
        typeof parsed?.profile?.fullName === "string" ? parsed.profile.fullName : "Unknown";
      setPendingImport({ backup: parsed, displayName });
      setConfirmOpen(true);
    } catch (e) {
      setStatus({
        message: e instanceof Error ? e.message : "Couldn’t read that file.",
        tone: "error",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <section className={styles.aboutCard}>
      <div className={styles.sectionHeaderSpaced}>
        <div className={styles.stackSm}>
          <div className={styles.sectionTitle}>Save Your Progress</div>
          <div className={styles.mutedText}>
            Download a JSON backup to save your Profile. Upload it later to restore.
          </div>
        </div>
        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.cancelButton}
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload JSON Backup
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={isPending}
            onClick={onDownload}
          >
            Download JSON Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onPickFile(file);
            }}
          />
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        message={`Import backup for "${pendingImport?.displayName ?? "Unknown"}"?\nThis replaces your current Profile.`}
        confirmLabel="Import"
        cancelLabel="Cancel"
        isPending={isPending}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingImport(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onConfirm={() => {
          const backup = pendingImport?.backup;
          if (!backup) return;
          setStatus({ message: "", tone: "" });
          startTransition(() => {
            try {
              const parsed = parseProfileBackupV1(backup);
              const next = profileFromBackup(parsed, profile);
              onReplaceProfile(next);
              setStatus({ message: "Backup imported.", tone: "success" });
            } catch (e) {
              setStatus({
                message: e instanceof Error ? e.message : "Couldn't import that backup.",
                tone: "error",
              });
            } finally {
              setConfirmOpen(false);
              setPendingImport(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }
          });
        }}
      />
      {status.message ? (
        <div
          className={
            status.tone === "error"
              ? "mt-2 text-xs font-semibold text-rose-700"
              : "mt-2 text-xs font-semibold text-emerald-700"
          }
        >
          {status.message}
        </div>
      ) : null}
    </section>
  );
}
