import { PolicyDocument } from "@/components/shared/policy-document";
import { policies } from "@/lib/content/policies";

export default function LocationDataPolicyPage() {
  return <PolicyDocument policy={policies["location-data"]} />;
}
