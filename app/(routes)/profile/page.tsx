import { getProfileWithRelations } from "@/server/profile/profile.repo";
import { AboutLayout } from "./view";

export default async function AboutPage() {
  const profile = await getProfileWithRelations();
  return <AboutLayout profile={profile} />;
}
