import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LandingHero } from "@/components/marketing/landing-hero";
import authOptions from "@/lib/auth-options";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return <LandingHero />;
  }

  if (!session.user.activeOrgId) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
