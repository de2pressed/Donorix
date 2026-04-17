import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function BloodRequestPolicyPage() {
  return <PolicyDocument policy={policies["blood-request"]} />;
}
