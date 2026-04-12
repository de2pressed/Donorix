import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function IpPolicyPage() {
  return <PolicyDocument policy={policies.ip} />;
}
