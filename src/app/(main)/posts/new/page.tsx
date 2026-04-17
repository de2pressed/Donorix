import { redirect } from "next/navigation";

import { DemoRequestCard } from "@/components/posts/demo-request-card";
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

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="xl:col-start-2 xl:row-start-1">
        <DemoRequestCard hospital={hospital} />
      </div>
      <div className="xl:col-start-1 xl:row-start-1">
        <PostForm hospital={hospital} />
      </div>
    </div>
  );
}
