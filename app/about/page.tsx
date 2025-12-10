import { getProfile } from '@/app/actions/profile';
import { AboutContent } from '@/components/AboutContent';

export default async function AboutPage() {
  const profile = await getProfile();

  return <AboutContent profile={profile} />;
}
