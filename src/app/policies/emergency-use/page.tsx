import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function EmergencyUsePolicyPage() {
  return <PolicyDocument policy={policies["emergency-use"]} />;
}
