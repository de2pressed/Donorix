"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function OtpForm() {
  const [otp, setOtp] = useState("");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Phone verification</CardTitle>
        <CardDescription>Enter the one-time password sent to your verified number.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value)} />
        <Button
          className="w-full"
          onClick={() => toast.info("OTP verification should be completed through Supabase phone auth.")}
        >
          Verify OTP
        </Button>
      </CardContent>
    </Card>
  );
}
