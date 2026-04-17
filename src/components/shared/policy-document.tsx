import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PolicyEntry } from "@/lib/content/policies";

export function PolicyDocument({ policy }: { policy: PolicyEntry }) {
  return (
    <Card className="p-0">
      <CardHeader className="border-b border-border p-8">
        <CardTitle className="text-3xl">{policy.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{policy.summary}</p>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        {policy.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="font-display text-xl font-semibold">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
