import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function TermsPolicyPage() {
  return <PolicyDocument policy={policies.terms} />;
}
