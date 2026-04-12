import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function GrievancePolicyPage() {
  return <PolicyDocument policy={policies.grievance} />;
}
