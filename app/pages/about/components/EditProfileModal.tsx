"use client";

import { updateProfileDetails } from "@/app/actions/profile";
import { Modal } from "../modals/Modal";
import type { Profile } from "../types";
import { styles } from "../style-constants";

type Props = {
  profile: Profile;
  isPending: boolean;
  open: boolean;
  onClose: () => void;
  onAfterSave: () => void;
  startTransition: (cb: () => void) => void;
};

export function EditProfileModal({
  profile,
  isPending,
  open,
  onClose,
  onAfterSave,
  startTransition,
}: Props) {
  return (
    <Modal triggerLabel="" title="Edit Profile" open={open} onClose={onClose}>
      <form
        action={updateProfileDetails}
        className={styles.formContainer}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(() => {
            void (async () => {
              await updateProfileDetails(formData);
              onAfterSave();
            })();
          });
        }}
      >
        <label className={styles.formField}>
          <span className={styles.labelText}>Full name</span>
          <input
            name="fullName"
            defaultValue={profile.fullName}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.formField}>
          <span className={styles.labelText}>Title</span>
          <input name="title" defaultValue={profile.title ?? ""} className={styles.input} />
        </label>
        <label className={styles.formField}>
          <span className={styles.labelText}>Email</span>
          <input name="email" defaultValue={profile.email ?? ""} className={styles.input} />
        </label>
        <label className={styles.formField}>
          <span className={styles.labelText}>Phone</span>
          <input name="phone" defaultValue={profile.phone ?? ""} className={styles.input} />
        </label>
        <label className={styles.formField}>
          <span className={styles.labelText}>Summary</span>
          <textarea
            name="summary"
            rows={4}
            defaultValue={profile.summary ?? ""}
            className={styles.input}
          />
        </label>
        <label className={styles.formField}>
          <span className={styles.labelText}>Location</span>
          <input
            name="location"
            defaultValue={profile.location ?? ""}
            className={styles.input}
          />
        </label>
        <label className={styles.formField}>
          <span className={styles.labelText}>Headline</span>
          <input
            name="headline"
            defaultValue={profile.headline ?? ""}
            className={styles.input}
          />
        </label>
        <label className={styles.formField}>
          <span className={styles.labelText}>LinkedIn</span>
          <input
            name="linkedinUrl"
            defaultValue={profile.linkedinUrl ?? ""}
            className={styles.input}
          />
        </label>
        <label className={styles.formField}>
          <span className={styles.labelText}>GitHub</span>
          <input
            name="githubUrl"
            defaultValue={profile.githubUrl ?? ""}
            className={styles.input}
          />
        </label>
        <label className={styles.formField}>
          <span className={styles.labelText}>Website</span>
          <input
            name="websiteUrl"
            defaultValue={profile.websiteUrl ?? ""}
            className={styles.input}
          />
        </label>
        <div className={styles.actionsRowPadded}>
          <button type="submit" disabled={isPending} className={styles.primaryButton}>
            {isPending ? "Saving..." : "Save"}
          </button>
          <button type="button" data-close-modal="true" className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
