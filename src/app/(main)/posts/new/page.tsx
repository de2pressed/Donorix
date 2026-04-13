import { redirect } from "next/navigation";

import { PostForm } from "@/components/posts/post-form";
import { getCurrentProfile, getHospitalAccountByProfileId } from "@/lib/data";

export default async function NewPostPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirect=/posts/new");
  }

  if (profile.account_type !== "hospital") {
    redirect("/");
  }

  const hospital = await getHospitalAccountByProfileId(profile.id);

  if (!hospital) {
    redirect("/settings");
  }

  return <PostForm hospital={hospital} />;
}
