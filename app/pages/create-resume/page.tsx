import { getProfile } from "@/app/actions/profile";
import { CreateResumeView } from "./view";

export default async function CreateResumePage() {
  const profile = await getProfile();

  return <CreateResumeView profile={profile} />;
}
