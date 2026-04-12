import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function AccountDeletionPolicyPage() {
  return <PolicyDocument policy={policies["account-deletion"]} />;
}
