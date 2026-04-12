import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function MisusePreventionPolicyPage() {
  return <PolicyDocument policy={policies["misuse-prevention"]} />;
}
