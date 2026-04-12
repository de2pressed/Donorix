export type PolicySection = {
  heading: string;
  paragraphs: string[];
};

export type PolicyEntry = {
  title: string;
  summary: string;
  sections: PolicySection[];
};

export const policies: Record<string, PolicyEntry> = {
  terms: {
    title: "Terms of Use",
    summary: "The rules governing access to Donorix under Indian law and Delhi jurisdiction.",
    sections: [
      {
        heading: "Eligibility and account responsibility",
        paragraphs: [
          "You must be at least 18 years old and legally able to enter into a binding agreement to use Donorix. You are responsible for keeping your account credentials secure and for ensuring that profile, contact, and medical preference details submitted by you are accurate.",
          "If you create an account for an organisation, hospital desk, or family member, you confirm that you have authority to act for that person or entity. Misrepresentation of authority is a violation of these Terms.",
        ],
      },
      {
        heading: "Platform role and acceptable use",
        paragraphs: [
          "Donorix acts only as a technology facilitator that helps donors and recipients discover each other. Donorix does not collect, test, store, transport, or certify blood, and it does not replace hospital triage, ambulance services, or licensed medical advice.",
          "You may not use Donorix to post false emergencies, sell blood, harass users, scrape data, or bypass privacy controls. Content that violates Indian law, medical ethics, or community safety rules may be removed immediately.",
        ],
      },
      {
        heading: "Liability, suspension, and governing law",
        paragraphs: [
          "Donorix does not guarantee donor availability, match quality, or clinical suitability. All medical compatibility and screening decisions must be verified independently by qualified professionals and relevant hospitals.",
          "We may suspend or terminate access for misuse, fraud, harassment, illegal activity, or repeated no-show behaviour. These Terms are governed by Indian law, and courts in Delhi shall have exclusive jurisdiction over disputes arising from the platform.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    summary: "How Donorix handles personal data in line with the Digital Personal Data Protection Act, 2023.",
    sections: [
      {
        heading: "Data we collect and why",
        paragraphs: [
          "Donorix collects account details, blood group, city, state, phone, email, donation history, and limited health eligibility signals so that the platform can support donor-recipient matching, fraud prevention, notification delivery, and moderation.",
          "Location is optional and is used only when you grant access. Precise coordinates are used to calculate a request radius and are not sold or disclosed publicly.",
        ],
      },
      {
        heading: "Retention and user rights",
        paragraphs: [
          "Recipient-side request records are retained for one year unless a longer period is required for fraud review or legal compliance. Donor profile and donation history records are retained for up to three years to preserve safety checks, cooldown enforcement, and community trust signals.",
          "You may request access, correction, withdrawal of consent, or deletion through account settings or by emailing grievance@donorix.in. Deleted accounts enter a 30-day grace period before irreversible anonymisation and downstream deletion workflows begin.",
        ],
      },
      {
        heading: "Grievance officer",
        paragraphs: [
          "The Grievance Officer for Donorix is Jayant Kumar. Complaints can be submitted to grievance@donorix.in and will be acknowledged and handled within 30 days.",
          "Where required by law, we may retain limited records to establish, exercise, or defend legal claims and to comply with lawful requests from competent authorities.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    summary: "How Donorix uses required and optional cookies on the platform.",
    sections: [
      {
        heading: "Required cookies",
        paragraphs: [
          "Required cookies keep you signed in, secure authenticated requests, enforce rate limits, and preserve essential safety preferences such as consent state and security-related session information.",
          "These cookies cannot be disabled because the platform cannot safely operate without them.",
        ],
      },
      {
        heading: "Optional cookies",
        paragraphs: [
          "Optional cookies store non-essential preferences such as theme, language, and product experience settings. Analytics preferences are used only for first-party performance measurement and do not rely on unrelated advertising trackers.",
          "You can accept all, accept only required cookies, or manage categories from the consent banner.",
        ],
      },
      {
        heading: "Changing your preference",
        paragraphs: [
          "You may revise cookie preferences at any time from the settings surface when it is available. Updated choices apply prospectively and do not affect lawful prior processing performed under earlier valid consent.",
        ],
      },
    ],
  },
  disclaimer: {
    title: "Medical Disclaimer",
    summary: "Donorix is not a healthcare provider and does not guarantee clinical suitability or blood safety.",
    sections: [
      {
        heading: "Platform limits",
        paragraphs: [
          "Donorix is not a hospital, blood bank, ambulance service, diagnostic lab, or licensed medical provider. The platform does not examine donors, test blood, or make treatment recommendations.",
          "Any recommendation shown by the platform is logistical in nature and must be verified by the recipient's medical team.",
        ],
      },
      {
        heading: "Independent verification required",
        paragraphs: [
          "Recipients, donors, and hospitals must independently verify blood compatibility, donor eligibility, and screening status before any transfusion-related action is taken.",
          "In a life-threatening emergency, call 112 or contact the nearest hospital immediately instead of relying solely on Donorix.",
        ],
      },
    ],
  },
  "donor-eligibility": {
    title: "Donor Eligibility Policy",
    summary: "Minimum donor requirements applied across the Donorix platform.",
    sections: [
      {
        heading: "Core eligibility criteria",
        paragraphs: [
          "Donors must generally be 18 years or older, weigh at least 50 kg, and have observed a 90-day interval since the last whole blood donation unless a licensed clinician directs otherwise.",
          "People with ongoing chronic disease, recent infections, disqualifying medication, or any condition that could affect safe donation should not mark themselves as available until cleared by a qualified professional.",
        ],
      },
      {
        heading: "Medical supervision and local rules",
        paragraphs: [
          "The final decision on whether a donor may donate rests with the licensed medical team supervising the donation. Donorix is designed to align with Indian and WHO-informed donation guidance, but hospital-specific rules may be stricter.",
        ],
      },
    ],
  },
  "blood-request": {
    title: "Blood Request Policy",
    summary: "Rules for posting legitimate requests and how Donorix prioritises them.",
    sections: [
      {
        heading: "Request quality and verification",
        paragraphs: [
          "Each request must be linked to a genuine need and should include accurate hospital, blood type, contact, and deadline details. Donorix may suppress, edit, or remove requests that appear fraudulent, incomplete, or unsafe.",
          "Emergency flags are reserved for clinically urgent situations and may be reviewed by moderators.",
        ],
      },
      {
        heading: "Priority and service expectations",
        paragraphs: [
          "Feed ranking considers emergency status, time remaining, donor response, and account trust signals. Priority ranking improves visibility but does not create a service-level guarantee or assure donor fulfilment.",
        ],
      },
    ],
  },
  "emergency-use": {
    title: "Emergency Use Policy",
    summary: "Donorix is not an emergency service and should not replace emergency responders.",
    sections: [
      {
        heading: "Use during emergencies",
        paragraphs: [
          "Emergency posts are surfaced quickly to matching donors, but Donorix should be treated as a supplementary communication tool rather than a primary emergency response channel.",
          "If the situation is life-threatening, call 112, contact the nearest hospital, and follow the instructions of emergency medical professionals.",
        ],
      },
    ],
  },
  "misuse-prevention": {
    title: "Misuse & Fraud Policy",
    summary: "Zero-tolerance rules for fake requests, harassment, and illegal blood sale activity.",
    sections: [
      {
        heading: "Prohibited activity",
        paragraphs: [
          "Fake requests, impersonation, harassment, extortion, resale of blood, or attempts to move conversations off-platform for unsafe conduct are prohibited.",
          "Selling blood or facilitating payment for blood is illegal and inconsistent with India's Drugs and Cosmetics Act, 1940. Any evidence of such behaviour may be reported to authorities.",
        ],
      },
      {
        heading: "Enforcement",
        paragraphs: [
          "Donorix may shadow-ban content, restrict posting, suspend accounts, and retain moderation evidence to support platform safety, civil claims, or law-enforcement cooperation where legally required.",
        ],
      },
    ],
  },
  "data-retention": {
    title: "Data Retention Policy",
    summary: "How long Donorix stores different categories of data.",
    sections: [
      {
        heading: "Operational retention periods",
        paragraphs: [
          "Active accounts are retained while needed to deliver matching, eligibility, notification, and moderation services. Blood request records are generally retained for one year, while donor profiles and donation history may be retained for up to three years.",
        ],
      },
      {
        heading: "Deleted accounts",
        paragraphs: [
          "A deleted account enters a 30-day grace period during which restoration may still be possible. After that, data is progressively hard-deleted or anonymised within 90 days unless preservation is required by law or for a live dispute.",
        ],
      },
    ],
  },
  "data-security": {
    title: "Data Security Policy",
    summary: "Technical and organisational controls used to secure Donorix data.",
    sections: [
      {
        heading: "Security controls",
        paragraphs: [
          "Donorix stores data using managed infrastructure with encryption at rest equivalent to AES-256, and data in transit is protected with TLS 1.3 or comparable secure transport. Access to production data is limited by role, logging, and administrative approval.",
          "Sensitive operational secrets are stored outside the codebase and are never committed to version control.",
        ],
      },
      {
        heading: "Incident handling",
        paragraphs: [
          "Where a notifiable security incident affects personal data, Donorix aims to investigate promptly, contain the issue, and make legally required notifications within 72 hours where applicable.",
        ],
      },
    ],
  },
  "data-sharing": {
    title: "Data Sharing Policy",
    summary: "Which processors support Donorix and the limits on information sharing.",
    sections: [
      {
        heading: "No sale of personal data",
        paragraphs: [
          "Donorix does not sell personal data. Data is shared only when needed to deliver platform functionality, comply with law, or protect safety.",
        ],
      },
      {
        heading: "Processors and infrastructure",
        paragraphs: [
          "Current processors may include Twilio for SMS delivery, OpenAI for chatbot responses, Supabase for authentication and data infrastructure, Vercel for hosting, and Sentry for monitoring. These providers process data only for defined service purposes under contractual controls where applicable.",
        ],
      },
    ],
  },
  "user-conduct": {
    title: "User Conduct Policy",
    summary: "Community standards for all donors, recipients, hospitals, and moderators.",
    sections: [
      {
        heading: "Expected behaviour",
        paragraphs: [
          "Users must communicate respectfully, avoid spam, and provide accurate information. Harassment, hate speech, coercion, and commercial solicitation are not permitted on the platform.",
          "Repeated low-quality conduct such as frivolous applications or avoidable no-shows may reduce trust ranking and trigger moderation action.",
        ],
      },
    ],
  },
  "account-deletion": {
    title: "Account Deletion Policy",
    summary: "How users can request deletion and what happens during the grace period.",
    sections: [
      {
        heading: "Deletion flow",
        paragraphs: [
          "You can request deletion from Settings once account deletion is fully connected to the backend. Deletion starts a 30-day reversible period intended to protect users against accidental or malicious removal.",
          "After 30 days, personal data is deleted or anonymised, subject to legal retention and fraud-prevention obligations.",
        ],
      },
    ],
  },
  grievance: {
    title: "Grievance Redressal",
    summary: "How complaints are filed, acknowledged, and escalated.",
    sections: [
      {
        heading: "Grievance process",
        paragraphs: [
          "Complaints relating to privacy, moderation, impersonation, fraud, or platform misuse may be filed with the Grievance Officer at grievance@donorix.in. Donorix aims to resolve grievances within 30 days.",
          "Where required, unresolved concerns may be escalated to competent authorities under applicable Indian law, including the IT Act and related rules.",
        ],
      },
    ],
  },
  ip: {
    title: "IP Policy",
    summary: "Ownership of platform IP and licence terms for user-submitted content.",
    sections: [
      {
        heading: "Platform ownership",
        paragraphs: [
          "Donorix owns the platform software, visual identity, documentation, and service marks except where third-party components are used under their own licences.",
        ],
      },
      {
        heading: "User content licence",
        paragraphs: [
          "You retain ownership of the content you submit, but you grant Donorix a limited, non-exclusive licence to host, process, display, and moderate that content as necessary to operate, secure, and improve the service.",
        ],
      },
    ],
  },
  compliance: {
    title: "Indian Law Compliance",
    summary: "Legal standards that inform Donorix product and policy decisions.",
    sections: [
      {
        heading: "Applicable legal framework",
        paragraphs: [
          "Donorix is designed with the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, and the Drugs and Cosmetics Act, 1940 in mind, alongside hospital-facing blood safety practices in India.",
          "Where legal obligations change, Donorix may update product controls, workflows, and policies to remain aligned with current requirements.",
        ],
      },
    ],
  },
  consent: {
    title: "Consent Policy",
    summary: "How Donorix obtains and records consent for data use, alerts, and matching.",
    sections: [
      {
        heading: "Consent collection",
        paragraphs: [
          "Donorix collects explicit consent at signup for Terms of Use and Privacy Policy acceptance. Notification consent is collected separately so that users can choose whether to receive match alerts and reminders.",
        ],
      },
      {
        heading: "Withdrawal",
        paragraphs: [
          "Where processing relies on consent, users may withdraw it through settings or by contacting support. Withdrawal does not affect processing already carried out lawfully before the request was received.",
        ],
      },
    ],
  },
  "location-data": {
    title: "Location Data Policy",
    summary: "How precise location supports radius-based donor matching and how it can be revoked.",
    sections: [
      {
        heading: "Purpose limitation",
        paragraphs: [
          "Precise location, when enabled, is used only to estimate distance between donors and requests, support radius expansion workflows, and improve matching efficiency. It is never sold and is not exposed publicly to unrelated users.",
        ],
      },
      {
        heading: "Control and revocation",
        paragraphs: [
          "You may deny or revoke location access at any time through your browser or device settings. The platform will continue to function using city and state information, though match accuracy may decrease.",
        ],
      },
    ],
  },
};
