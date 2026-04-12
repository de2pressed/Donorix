export const APP_NAME = "Donorix";
export const APP_TAGLINE = "Purpose-built blood donation matching for India";
export const BRAND_RED = "hsl(347 89% 43%)";
export const SUPPORT_EMAIL = "support@donorix.in";
export const GRIEVANCE_EMAIL = "grievance@donorix.in";

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const INDIAN_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "ta", label: "Tamil" },
  { code: "ur", label: "Urdu" },
];

export const MAIN_NAV = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/posts/new", label: "Request Blood" },
  { href: "/notifications", label: "Notifications" },
  { href: "/policies/terms", label: "Policies" },
];

export const SETTINGS_SECTIONS = [
  "Profile",
  "Availability",
  "Notifications",
  "Privacy",
  "Account deletion",
] as const;

export const POLICY_NAV = [
  { href: "/policies/terms", label: "Terms of Use" },
  { href: "/policies/privacy", label: "Privacy Policy" },
  { href: "/policies/cookies", label: "Cookie Policy" },
  { href: "/policies/disclaimer", label: "Medical Disclaimer" },
  { href: "/policies/donor-eligibility", label: "Donor Eligibility" },
  { href: "/policies/blood-request", label: "Blood Request" },
  { href: "/policies/emergency-use", label: "Emergency Use" },
  { href: "/policies/misuse-prevention", label: "Misuse & Fraud" },
  { href: "/policies/data-retention", label: "Data Retention" },
  { href: "/policies/data-security", label: "Data Security" },
  { href: "/policies/data-sharing", label: "Data Sharing" },
  { href: "/policies/user-conduct", label: "User Conduct" },
  { href: "/policies/account-deletion", label: "Account Deletion" },
  { href: "/policies/grievance", label: "Grievance Redressal" },
  { href: "/policies/ip", label: "IP Policy" },
  { href: "/policies/compliance", label: "Indian Law Compliance" },
  { href: "/policies/consent", label: "Consent Policy" },
  { href: "/policies/location-data", label: "Location Data" },
] as const;

export const COOKIE_OPTIONS = [
  { id: "required", label: "Required", description: "Session, security, and fraud prevention." },
  {
    id: "analytics",
    label: "Analytics",
    description: "Performance metrics without third-party tracking scripts.",
  },
  {
    id: "experience",
    label: "Experience",
    description: "Theme, language, and UI preferences stored locally.",
  },
] as const;
