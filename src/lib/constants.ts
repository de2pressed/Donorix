export const APP_NAME = "Donorix";
export const APP_TAGLINE = "Purpose-built blood donation matching for India";
export const BRAND_RED = "hsl(347 89% 43%)";
export const SUPPORT_EMAIL = "support@donorix.in";
export const GRIEVANCE_EMAIL = "grievance@donorix.in";

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const INDIAN_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "ur", label: "اردو" },
];

export const SUPPORTED_LANGUAGE_CODES = ["en", "hi"] as const;
export const SUPPORTED_LANGUAGES = INDIAN_LANGUAGES.filter((language) =>
  SUPPORTED_LANGUAGE_CODES.includes(language.code as (typeof SUPPORTED_LANGUAGE_CODES)[number]),
);

export const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳", placeholder: "9876543210" },
  { code: "+61", country: "Australia", flag: "🇦🇺", placeholder: "412345678" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩", placeholder: "1712345678" },
  { code: "+55", country: "Brazil", flag: "🇧🇷", placeholder: "11987654321" },
  { code: "+1", country: "Canada", flag: "🇨🇦", placeholder: "4165551234" },
  { code: "+86", country: "China", flag: "🇨🇳", placeholder: "13123456789" },
  { code: "+33", country: "France", flag: "🇫🇷", placeholder: "612345678" },
  { code: "+49", country: "Germany", flag: "🇩🇪", placeholder: "15123456789" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰", placeholder: "51234567" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩", placeholder: "81234567890" },
  { code: "+353", country: "Ireland", flag: "🇮🇪", placeholder: "851234567" },
  { code: "+81", country: "Japan", flag: "🇯🇵", placeholder: "9012345678" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾", placeholder: "123456789" },
  { code: "+52", country: "Mexico", flag: "🇲🇽", placeholder: "5512345678" },
  { code: "+977", country: "Nepal", flag: "🇳🇵", placeholder: "9812345678" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿", placeholder: "211234567" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰", placeholder: "3012345678" },
  { code: "+63", country: "Philippines", flag: "🇵🇭", placeholder: "9171234567" },
  { code: "+65", country: "Singapore", flag: "🇸🇬", placeholder: "81234567" },
  { code: "+27", country: "South Africa", flag: "🇿🇦", placeholder: "821234567" },
  { code: "+82", country: "South Korea", flag: "🇰🇷", placeholder: "1012345678" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰", placeholder: "712345678" },
  { code: "+971", country: "United Arab Emirates", flag: "🇦🇪", placeholder: "501234567" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧", placeholder: "7123456789" },
  { code: "+1", country: "United States", flag: "🇺🇸", placeholder: "4155551234" },
] as const;

export const MAIN_NAV = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/posts/new", label: "Request Blood" },
  { href: "/notifications", label: "Notifications" },
  { href: "/contact", label: "Contact Us" },
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
