import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function DataSecurityPolicyPage() {
  return <PolicyDocument policy={policies["data-security"]} />;
}
