import { getProfileWithRelations } from "@/server/profile/profile.repo";
import { CreateResumeView } from "./view";
import { generateResume } from "@/server/resume/resume.service";

export default async function CreateResumePage() {
  const profile = await getProfileWithRelations();

  async function handleGenerate(jd: string) {
    "use server";
    return generateResume(jd);
  }

  return <CreateResumeView profile={profile} onGenerate={handleGenerate} />;
}
