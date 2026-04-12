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
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="otp-code">
            One-time password
          </label>
          <Input
            id="otp-code"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
          />
        </div>
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
