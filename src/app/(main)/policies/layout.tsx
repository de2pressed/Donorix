import { PoliciesLayoutContent } from "@/components/layout/policies-layout-content";

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return <PoliciesLayoutContent>{children}</PoliciesLayoutContent>;
}
