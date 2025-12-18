import { getProfile } from "@/app/actions/profile";
import { AboutLayout } from "./view";

export default async function AboutPage() {
  const profile = await getProfile();
  return <AboutLayout profile={profile} />;
}
