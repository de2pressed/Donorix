import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function DataRetentionPolicyPage() {
  return <PolicyDocument policy={policies["data-retention"]} />;
}
