import type { AssistantLanguage } from "@/lib/assistant/language";
import type { CreatePostInput } from "@/lib/validations/post";

export type Persona = "guest" | "donor" | "hospital";

export type ChatRole = "assistant" | "user" | "system";

export type AssistantMode = "general" | "eligible_posts" | "hospital_draft";

export type ChatbotConversationMessage = {
  role: ChatRole;
  content: string;
};

export type EligiblePost = {
  id: string;
  patient_name: string;
  blood_type_needed: string;
  hospital_name: string;
  city: string;
  state: string;
  units_needed: number;
  required_by: string | null;
  link: string;
};

export type HospitalDraftState = {
  values: Partial<CreatePostInput>;
  missingFields: string[];
  questions: string[];
  fieldChecklist?: HospitalDraftChecklistItem[];
  readyForReview: boolean;
  summary: string;
  blockedReason?: string | null;
  reviewMode?: "collecting" | "review" | "blocked";
  auditSummary?: string;
  capturedFields?: string[];
  nextMissingField?: string | null;
  nextAction?: string | null;
  lastUpdatedAt?: string;
};

export type HospitalDraftChecklistItem = {
  field: string;
  label: string;
  value: string;
  required: boolean;
  missing: boolean;
  prompt?: string | null;
};

export type ChatbotRequestPayload = {
  message?: string;
  language?: string;
  persona?: Persona;
  pathname?: string;
  messages?: ChatbotConversationMessage[];
  draftState?: HospitalDraftState | null;
  userMessageCount?: number;
  assistantSessionId?: string;
  conversationSummary?: string;
};

export type ChatbotResponsePayload = {
  language: AssistantLanguage;
  languageName: string;
  reply: string;
  persona: Persona;
  mode: AssistantMode;
  aiActive: boolean;
  intent?: string | null;
  eligiblePosts?: EligiblePost[];
  draftState?: HospitalDraftState | null;
  reminder?: string | null;
  chatDisabled?: boolean;
  chatDisabledReason?: string | null;
  conversationSummary?: string;
};
