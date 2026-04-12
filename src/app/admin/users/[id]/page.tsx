import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User detail</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Detailed moderation tooling for user <span className="font-mono text-foreground">{id}</span> can be connected to Supabase admin queries here.
      </CardContent>
    </Card>
  );
}
