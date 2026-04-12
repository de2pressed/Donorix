import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        New to Donorix?{" "}
        <Link className="font-medium text-brand" href="/signup">
          Create an account
        </Link>
      </p>
    </div>
  );
}
