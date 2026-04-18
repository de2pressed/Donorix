import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { HospitalPostHistory } from "@/components/posts/hospital-post-history";
import { getCurrentProfile, getHospitalPosts } from "@/lib/data";
import { getRequestMessages, translate } from "@/lib/i18n";

export default async function HospitalPostsPage() {
  const [{ locale, messages }, profile] = await Promise.all([getRequestMessages(), getCurrentProfile()]);
  const t = (key: string) => translate(messages, key);

  if (!profile) {
    redirect("/login?redirect=/hospital/posts");
  }

  if (profile.account_type !== "hospital") {
    redirect("/");
  }

  const posts = await getHospitalPosts(profile.id);
  const postHistoryCopy =
    locale === "hi"
      ? {
          requestLog: "अनुरोध लॉग",
          bulkDeleteHint: "बल्क डिलीट के लिए पोस्ट चुनने हेतु चेकबॉक्स का उपयोग करें।",
          selectAll: "सभी चुनें",
          selectedCount: "{count} चुने गए",
          deleteSelected: "चुने हुए हटाएँ",
          deleteAll: "सभी पोस्ट हटाएँ",
          deleteSelectedTitle: "चुनी हुई पोस्ट हटाएँ?",
          deleteAllTitle: "सभी पोस्ट हटाएँ?",
          deleteSelectedDescription:
            "यह आपके अस्पताल इतिहास से {count} चुनी हुई पोस्ट हटाएगा और उन्हें सक्रिय वर्कफ़्लो से हटा देगा।",
          deleteAllDescription:
            "यह आपके अस्पताल इतिहास की सभी {count} ऐसी पोस्ट हटाएगा जो पहले से हटाई नहीं गई हैं और उन्हें सक्रिय वर्कफ़्लो से हटा देगा।",
          deleteAction: "हटाएँ",
          deleting: "हटाया जा रहा है...",
          cancel: "रद्द करें",
          deleteSuccess: "{count} पोस्ट हटाई गईं।",
          noPatientId: "कोई मरीज आईडी नहीं",
          units: "यूनिट्स",
          donorApplicants: "डोनर आवेदक",
          emptyActive: "अभी कोई सक्रिय रोगी पोस्ट उपलब्ध नहीं है।",
          activeSectionTitle: "सक्रिय अनुरोध",
          deletedSectionTitle: "हटाए गए अनुरोध",
          deletedSectionHint: "हटाई गई पोस्ट यहीं समीक्षा के लिए दिखेंगी।",
          emptyDeleted: "अभी कोई हटाई गई पोस्ट नहीं है।",
        }
      : {
          requestLog: "Hospital request log",
          bulkDeleteHint: "Use the checkboxes to select posts for bulk deletion.",
          selectAll: "Select all",
          selectedCount: "{count} selected",
          deleteSelected: "Delete selected",
          deleteAll: "Delete all posts",
          deleteSelectedTitle: "Delete selected posts?",
          deleteAllTitle: "Delete all posts?",
          deleteSelectedDescription:
            "This will delete {count} selected post(s) from your hospital history and remove them from active workflows.",
          deleteAllDescription:
            "This will delete all {count} post(s) that are not already deleted from your hospital history and remove them from active workflows.",
          deleteAction: "Delete",
          deleting: "Deleting...",
          cancel: "Cancel",
          deleteSuccess: "{count} post(s) deleted.",
          noPatientId: "No patient ID",
          units: "units",
          donorApplicants: "donor applicants",
          emptyActive: "No active posts created yet.",
          activeSectionTitle: "Active requests",
          deletedSectionTitle: "Deleted posts",
          deletedSectionHint: "Deleted posts remain available here for review.",
          emptyDeleted: "No deleted posts yet.",
        };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{t("hospitalPosts.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("hospitalPosts.subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/posts/new">{t("hospitalPosts.newRequest")}</Link>
        </Button>
      </div>

      <HospitalPostHistory copy={postHistoryCopy} posts={posts} />
    </div>
  );
}

