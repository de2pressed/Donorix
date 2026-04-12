import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>We will send a password reset link to your verified email address.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Email address" type="email" />
        <Button className="w-full">Send reset link</Button>
      </CardContent>
    </Card>
  );
}
