import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function DisclaimerPolicyPage() {
  return <PolicyDocument policy={policies.disclaimer} />;
}
