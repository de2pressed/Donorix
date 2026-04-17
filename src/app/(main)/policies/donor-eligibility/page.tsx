import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function DonorEligibilityPolicyPage() {
  return <PolicyDocument policy={policies["donor-eligibility"]} />;
}
