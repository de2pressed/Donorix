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
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="forgot-password-email">
            Email
          </label>
          <Input id="forgot-password-email" placeholder="Enter your email address" type="email" />
        </div>
        <Button className="w-full">Send reset link</Button>
      </CardContent>
    </Card>
  );
}
