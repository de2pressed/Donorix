import {
  Bell,
  Building2,
  FileText,
  HeartHandshake,
  Home,
  Info,
  LayoutDashboard,
  PlusSquare,
  Settings,
  Trophy,
  User2,
  Users,
  ClipboardList,
  MoreHorizontal,
  LogIn,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AccountType } from "@/types/user";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function getSidebarNav(accountType?: AccountType | null) {
  if (accountType === "hospital") {
    return [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/posts/new", label: "New Request", icon: PlusSquare },
      { href: "/hospital/posts", label: "Patient Posts", icon: ClipboardList },
      { href: "/hospital/donors", label: "Donors", icon: Users },
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/policies/terms", label: "Policies", icon: FileText },
      { href: "/about", label: "About Us", icon: Info },
    ] satisfies NavItem[];
  }

  return [
    { href: "/", label: "Home", icon: Home },
    { href: "/find", label: "Find to Donate", icon: HeartHandshake },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/policies/terms", label: "Policies", icon: FileText },
    { href: "/about", label: "About Us", icon: Info },
  ] satisfies NavItem[];
}

export function getBottomNav(accountType?: AccountType | null, isAuthenticated = false) {
  if (accountType === "hospital") {
    return [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/posts/new", label: "New Request", icon: PlusSquare },
      { href: "/notifications", label: "Alerts", icon: Bell },
      { href: "#more", label: "More", icon: MoreHorizontal },
    ] satisfies NavItem[];
  }

  if (isAuthenticated) {
    return [
      { href: "/", label: "Home", icon: Home },
      { href: "/find", label: "Donate", icon: HeartHandshake },
      { href: "/leaderboard", label: "Top", icon: Trophy },
      { href: "/notifications", label: "Alerts", icon: Bell },
      { href: "#more", label: "More", icon: MoreHorizontal },
    ] satisfies NavItem[];
  }

  return [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/login", label: "Login", icon: LogIn },
    { href: "#more", label: "More", icon: MoreHorizontal },
  ] satisfies NavItem[];
}

export function getMoreNav(accountType?: AccountType | null, isAuthenticated = false) {
  if (accountType === "hospital") {
    return [
      { href: "/hospital/posts", label: "Patient Posts", icon: ClipboardList },
      { href: "/hospital/donors", label: "Donors", icon: Users },
      { href: "/policies/terms", label: "Policies", icon: FileText },
      { href: "/about", label: "About Us", icon: Info },
      { href: "/settings", label: "Settings", icon: Settings },
    ] satisfies NavItem[];
  }

  if (isAuthenticated) {
    return [
      { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
      { href: "/policies/terms", label: "Policies", icon: FileText },
      { href: "/about", label: "About Us", icon: Info },
      { href: "/profile", label: "Profile", icon: User2 },
      { href: "/settings", label: "Settings", icon: Settings },
    ] satisfies NavItem[];
  }

  return [
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/policies/terms", label: "Policies", icon: FileText },
    { href: "/about", label: "About Us", icon: Info },
    { href: "/signup", label: "Sign Up", icon: User2 },
    { href: "/signup?account=hospital", label: "Register as Hospital", icon: Building2 },
  ] satisfies NavItem[];
}

export function showRegisterHospitalButton(accountType?: AccountType | null) {
  return accountType == null;
}
