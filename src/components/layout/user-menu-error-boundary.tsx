"use client";

import Link from "next/link";
import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type UserMenuErrorBoundaryProps = {
  children: ReactNode;
  isAuthenticated: boolean;
};

type UserMenuErrorBoundaryState = {
  hasError: boolean;
};

export class UserMenuErrorBoundary extends Component<
  UserMenuErrorBoundaryProps,
  UserMenuErrorBoundaryState
> {
  state: UserMenuErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("User menu rendering failed", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.isAuthenticated ? (
        <Button asChild size="sm" variant="outline">
          <Link href="/settings">Profile unavailable</Link>
        </Button>
      ) : (
        <Button asChild size="sm" variant="ghost">
          <Link href="/login">Login</Link>
        </Button>
      );
    }

    return this.props.children;
  }
}
