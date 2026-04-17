import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function CompliancePolicyPage() {
  return <PolicyDocument policy={policies.compliance} />;
}
