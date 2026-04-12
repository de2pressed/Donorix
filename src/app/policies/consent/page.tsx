import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function ConsentPolicyPage() {
  return <PolicyDocument policy={policies.consent} />;
}
