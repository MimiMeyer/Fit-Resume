import { getProfileWithRelations } from "@/server/profile/profile.repo";
import { CreateResumeView } from "./view";
import { generateResume } from "@/server/resume/resume.service";

export default async function CreateResumePage() {
  const profile = await getProfileWithRelations();

  async function handleGenerate(jobDescription: string) {
    "use server";
    return generateResume(jobDescription);
  }

  return <CreateResumeView profile={profile} onGenerate={handleGenerate} />;
}
