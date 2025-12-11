import { getProfile } from "@/app/actions/profile";
import { ResumeComposer } from "@/components/ResumeComposer";

export default async function CreateResumePage() {
  const profile = await getProfile();

  return <ResumeComposer profile={profile} />;
}
