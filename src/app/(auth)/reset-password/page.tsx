import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>Passwords require uppercase, number, and special character.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="New password" type="password" />
        <Input placeholder="Confirm password" type="password" />
        <Button className="w-full">Update password</Button>
      </CardContent>
    </Card>
  );
}
