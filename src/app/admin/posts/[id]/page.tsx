import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post detail</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Moderation actions and audit visibility for post <span className="font-mono text-foreground">{id}</span> can be connected to Supabase here.
      </CardContent>
    </Card>
  );
}
