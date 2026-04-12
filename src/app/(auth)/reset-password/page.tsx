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
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="new-password">
            New password
          </label>
          <Input id="new-password" placeholder="Enter a new password" type="password" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirm-new-password">
            Confirm password
          </label>
          <Input id="confirm-new-password" placeholder="Confirm the new password" type="password" />
        </div>
        <Button className="w-full">Update password</Button>
      </CardContent>
    </Card>
  );
}
