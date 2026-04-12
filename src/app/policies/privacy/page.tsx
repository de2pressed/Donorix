import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function PrivacyPolicyPage() {
  return <PolicyDocument policy={policies.privacy} />;
}
