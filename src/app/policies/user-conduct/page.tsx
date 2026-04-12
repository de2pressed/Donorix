import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function UserConductPolicyPage() {
  return <PolicyDocument policy={policies["user-conduct"]} />;
}
