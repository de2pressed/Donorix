import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function DataSharingPolicyPage() {
  return <PolicyDocument policy={policies["data-sharing"]} />;
}
