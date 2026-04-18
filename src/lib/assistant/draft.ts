import { addDays, isValid, parse, parseISO } from "date-fns";

import { BLOOD_TYPES } from "@/lib/constants";
import { isBloodType, type BloodType } from "@/lib/utils/blood-type";
import { sanitizeText } from "@/lib/utils/sanitize";
import { createPostSchema, type CreatePostInput } from "@/lib/validations/post";

import type { AssistantLanguage } from "@/lib/assistant/language";
import type {
  ChatbotConversationMessage,
  HospitalDraftChecklistItem,
  HospitalDraftState,
} from "@/lib/assistant/types";

export type HospitalDraftExtraction = HospitalDraftState & {
  reply: string;
};

type HospitalDefaults = Partial<CreatePostInput>;

type FieldQuestionKey =
  | "patient_name"
  | "patient_id"
  | "blood_type_needed"
  | "units_needed"
  | "hospital_name"
  | "hospital_address"
  | "city"
  | "state"
  | "contact_name"
  | "contact_phone"
  | "contact_email"
  | "medical_condition"
  | "additional_notes"
  | "required_by"
  | "is_emergency"
  | "initial_radius_km";

const FIELD_QUESTION_MAP: Record<FieldQuestionKey, { en: string; hi: string }> = {
  patient_name: {
    en: "What is the patient name?",
    hi: "मरीज़ का नाम क्या है?",
  },
  patient_id: {
    en: "What patient ID or case reference should I use?",
    hi: "कौन सा patient ID या case reference उपयोग करूं?",
  },
  blood_type_needed: {
    en: "Which blood group is needed?",
    hi: "कौन सा blood group चाहिए?",
  },
  units_needed: {
    en: "How many units are needed?",
    hi: "कितनी units चाहिए?",
  },
  hospital_name: {
    en: "Which hospital name should I use?",
    hi: "किस hospital का नाम दर्ज करूं?",
  },
  hospital_address: {
    en: "What hospital address should I use?",
    hi: "Hospital address क्या है?",
  },
  city: {
    en: "Which city should I use?",
    hi: "कौन सा शहर दर्ज करूं?",
  },
  state: {
    en: "Which state should I use?",
    hi: "कौन सा state दर्ज करूं?",
  },
  contact_name: {
    en: "Who should I list as the contact person?",
    hi: "Contact person के रूप में किसका नाम डालूं?",
  },
  contact_phone: {
    en: "What contact phone number should I use?",
    hi: "कौन सा contact phone number डालूं?",
  },
  contact_email: {
    en: "What contact email should I use?",
    hi: "कौन सा contact email डालूं?",
  },
  medical_condition: {
    en: "What is the medical reason for the blood request?",
    hi: "Blood request का medical reason क्या है?",
  },
  additional_notes: {
    en: "Any additional notes or instructions?",
    hi: "कोई additional notes या instructions?",
  },
  required_by: {
    en: "When is the blood required? Please share a date and time.",
    hi: "Blood कब तक चाहिए? कृपया date और time बताएं.",
  },
  is_emergency: {
    en: "Should I mark this as an emergency case?",
    hi: "क्या इसे emergency case mark करूं?",
  },
  initial_radius_km: {
    en: "What donor search radius should I use in km?",
    hi: "Donor search radius कितने km का रखें?",
  },
};

const FIELD_LABEL_MAP: Record<FieldQuestionKey, { en: string; hi: string }> = {
  patient_name: { en: "Patient name", hi: "मरीज का नाम" },
  patient_id: { en: "Patient ID", hi: "मरीज आईडी" },
  blood_type_needed: { en: "Blood group needed", hi: "आवश्यक रक्त समूह" },
  units_needed: { en: "Units needed", hi: "आवश्यक यूनिट" },
  hospital_name: { en: "Hospital name", hi: "अस्पताल का नाम" },
  hospital_address: { en: "Hospital address", hi: "अस्पताल का पता" },
  city: { en: "City", hi: "शहर" },
  state: { en: "State", hi: "राज्य" },
  contact_name: { en: "Contact person", hi: "संपर्क व्यक्ति" },
  contact_phone: { en: "Contact phone", hi: "संपर्क फोन" },
  contact_email: { en: "Contact email", hi: "संपर्क ईमेल" },
  medical_condition: { en: "Medical reason", hi: "चिकित्सीय कारण" },
  additional_notes: { en: "Additional notes", hi: "अतिरिक्त नोट्स" },
  required_by: { en: "Required by", hi: "आवश्यक समय" },
  is_emergency: { en: "Emergency case", hi: "आपात मामला" },
  initial_radius_km: { en: "Search radius", hi: "खोज दूरी" },
};

const DRAFT_FIELD_ORDER: FieldQuestionKey[] = [
  "patient_name",
  "patient_id",
  "blood_type_needed",
  "units_needed",
  "medical_condition",
  "required_by",
  "contact_name",
  "contact_phone",
  "contact_email",
  "hospital_name",
  "hospital_address",
  "city",
  "state",
  "additional_notes",
  "is_emergency",
  "initial_radius_km",
];

const BLOOD_TYPE_WORD_MAP: Record<string, BloodType> = {
  "a+": "A+",
  "a plus": "A+",
  "a positive": "A+",
  "a-": "A-",
  "a minus": "A-",
  "a negative": "A-",
  "b+": "B+",
  "b plus": "B+",
  "b positive": "B+",
  "b-": "B-",
  "b minus": "B-",
  "b negative": "B-",
  "ab+": "AB+",
  "ab plus": "AB+",
  "ab positive": "AB+",
  "ab-": "AB-",
  "ab minus": "AB-",
  "ab negative": "AB-",
  "o+": "O+",
  "o plus": "O+",
  "o positive": "O+",
  "o-": "O-",
  "o minus": "O-",
  "o negative": "O-",
};

const NUMBER_WORD_MAP: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const CONFIRM_KEYWORDS = [
  "confirm post",
  "confirm request",
  "confirm this post",
  "publish post",
  "publish request",
  "submit post",
  "submit request",
  "post it",
  "go ahead",
  "finalize",
  "finalise",
  "approve and post",
  "yes confirm",
  "please confirm",
  "confirm",
  "पुष्टि",
  "पक्का",
  "पुष्टि कर",
  "पोस्ट कन्फर्म",
  "सबमिट",
  "प्रकाशित",
  "confirm karo",
  "post karo",
];

const DRAFT_KEYWORDS = [
  "create post",
  "new request",
  "patient post",
  "blood request",
  "request blood",
  "post for patient",
  "draft",
  "case draft",
  "request for patient",
  "patient details",
  "fill details",
  "review draft",
  "audit",
  "confirm post",
  "hospital request",
  "medical reason",
  "emergency case",
  "patient name",
  "blood group",
  "blood type",
  "units needed",
  "contact person",
  "required by",
  "hospital name",
  "hospital address",
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanValue(value: string) {
  return sanitizeText(value).replace(/^[\s\-:=>]+/, "").replace(/[\s,;]+$/, "").trim();
}

function formatDraftValue(value: unknown, language: AssistantLanguage) {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    }
  }

  return String(value);
}

function sortDraftFields(fields: string[]) {
  const order = new Map(DRAFT_FIELD_ORDER.map((field, index) => [field, index]));
  return [...new Set(fields)].sort(
    (left, right) =>
      (order.get(left as FieldQuestionKey) ?? 999) - (order.get(right as FieldQuestionKey) ?? 999),
  );
}

function normalizeText(value: string) {
  return sanitizeText(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function splitWords(value: string) {
  return normalizeText(value)
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean);
}

function extractLabelValue(text: string, labels: string[], allowTrailingWords = false) {
  const sanitized = sanitizeText(text);
  const escapedLabels = labels.map((label) => escapeRegExp(label)).join("|");
  const patterns = [
    new RegExp(`(?:^|[\\n\\r,;])\\s*(?:${escapedLabels})\\s*(?:is\\s*)?(?:[:=\\-]|->)?\\s*([^\\n,;]+)`, "i"),
    new RegExp(`(?:^|[\\n\\r,;])\\s*(?:${escapedLabels})\\s+([^\\n,;]+)`, "i"),
  ];

  for (const pattern of patterns) {
    const match = sanitized.match(pattern);
    if (match?.[1]) {
      return cleanValue(match[1]);
    }
  }

  if (allowTrailingWords) {
    for (const line of sanitized.split(/\r?\n/)) {
      const trimmed = line.trim();
      const normalized = trimmed.toLowerCase();
      for (const label of labels) {
        const needle = label.toLowerCase();
        const index = normalized.indexOf(needle);
        if (index < 0) continue;
        const remainder = trimmed.slice(index + label.length).replace(/^(?:\s*(?:is|=|:|->|-)\s*)?/i, "").trim();
        if (remainder) {
          return cleanValue(remainder);
        }
      }
    }
  }

  return null;
}

function extractBloodType(text: string) {
  const normalized = normalizeText(text);

  const direct = normalized.match(/\b(ab|a|b|o)\s*([+-])\b/);
  if (direct?.[1] && direct?.[2]) {
    const key = `${direct[1]}${direct[2]}`;
    return BLOOD_TYPE_WORD_MAP[key] ?? null;
  }

  for (const [phrase, bloodType] of Object.entries(BLOOD_TYPE_WORD_MAP)) {
    if (normalized.includes(phrase)) {
      return bloodType;
    }
  }

  for (const bloodType of BLOOD_TYPES) {
    if (normalized.includes(bloodType.toLowerCase())) {
      return bloodType;
    }
  }

  return null;
}

function extractNumber(text: string) {
  const normalized = normalizeText(text);
  const digitMatch = normalized.match(/\b(\d{1,2})\b/);
  if (digitMatch?.[1]) {
    return Number(digitMatch[1]);
  }

  for (const [word, value] of Object.entries(NUMBER_WORD_MAP)) {
    if (normalized.includes(word)) {
      return value;
    }
  }

  return null;
}

function extractUnits(text: string) {
  const explicit = extractLabelValue(text, ["units needed", "units", "unit", "bags"]);
  const explicitNumber = explicit ? extractNumber(explicit) : null;
  if (explicitNumber !== null) {
    return explicitNumber;
  }

  const direct = extractNumber(text);
  return direct;
}

function extractPhone(text: string) {
  const match = sanitizeText(text).match(/(?:\+?\d[\d\s().-]{7,}\d)/);
  return match ? cleanValue(match[0]).replace(/[\s().-]/g, "") : null;
}

function extractEmail(text: string) {
  const match = sanitizeText(text).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? cleanValue(match[0]) : null;
}

function parseTimeComponent(value: string) {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match?.[1]) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const meridiem = match[3]?.toLowerCase();

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  if (meridiem === "pm" && hours < 12) {
    hours += 12;
  } else if (meridiem === "am" && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

function setTimeOnDate(baseDate: Date, hours: number, minutes: number) {
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getNextWeekday(baseDate: Date, weekday: number) {
  const date = new Date(baseDate);
  const currentDay = date.getDay();
  const daysUntil = (weekday - currentDay + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntil);
  return date;
}

function parseDatePart(text: string, now = new Date()) {
  const normalized = normalizeText(text);

  if (normalized.includes("day after tomorrow")) {
    return addDays(now, 2);
  }

  if (normalized.includes("tomorrow")) {
    return addDays(now, 1);
  }

  if (normalized.includes("today")) {
    return new Date(now);
  }

  const weekdayMatch = normalized.match(/\b(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (weekdayMatch?.[2]) {
    const weekday = WEEKDAY_INDEX[weekdayMatch[2]];
    if (typeof weekday === "number") {
      const nextWeekday = getNextWeekday(now, weekday);
      if (!weekdayMatch[1] && nextWeekday.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
        return nextWeekday;
      }
      return nextWeekday;
    }
  }

  const isoMatch = normalized.match(/\b(\d{4}-\d{2}-\d{2})(?:[ t](\d{1,2}:\d{2}(?:\s?[ap]m)?|\d{1,2}\s?[ap]m))?\b/);
  if (isoMatch?.[1]) {
    const explicitTime = isoMatch[2] ? parseTimeComponent(isoMatch[2]) : null;
    const parsed = isoMatch[2] ? parseISO(`${isoMatch[1]}T00:00:00`) : parseISO(`${isoMatch[1]}T00:00:00`);
    if (isValid(parsed)) {
      if (explicitTime) {
        return setTimeOnDate(parsed, explicitTime.hours, explicitTime.minutes);
      }
      return parsed;
    }
  }

  const parsedFormats = [
    "d/M/yyyy",
    "dd/MM/yyyy",
    "d-M-yyyy",
    "dd-MM-yyyy",
    "d.MM.yyyy",
    "dd.MM.yyyy",
    "d MMM yyyy",
    "d MMMM yyyy",
    "dd MMM yyyy",
    "dd MMMM yyyy",
    "d/M/yy",
    "dd/MM/yy",
  ];

  for (const formatString of parsedFormats) {
    const parsed = parse(normalized, formatString, now);
    if (isValid(parsed)) {
      return parsed;
    }
  }

  return null;
}

function parseRequiredBy(text: string) {
  const now = new Date();
  const normalized = normalizeText(text);

  const timeOnlyMatch = normalized.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/);
  const timeOnly = timeOnlyMatch?.[1] ? parseTimeComponent(timeOnlyMatch[1]) : null;
  const dayPart = parseDatePart(text, now);

  if (dayPart && timeOnly) {
    return setTimeOnDate(dayPart, timeOnly.hours, timeOnly.minutes);
  }

  if (dayPart) {
    const isRelativeDay = /today|tomorrow|day after tomorrow|next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/.test(normalized);
    if (isRelativeDay) {
      const morning = normalized.includes("morning") ? { hours: 9, minutes: 0 } : null;
      const afternoon = normalized.includes("afternoon") ? { hours: 14, minutes: 0 } : null;
      const evening = normalized.includes("evening") ? { hours: 18, minutes: 0 } : null;
      const night = normalized.includes("night") ? { hours: 20, minutes: 0 } : null;
      const part = morning ?? afternoon ?? evening ?? night;
      if (part) {
        return setTimeOnDate(dayPart, part.hours, part.minutes);
      }
    }
  }

  if (!dayPart && timeOnly) {
    const candidate = setTimeOnDate(now, timeOnly.hours, timeOnly.minutes);
    if (candidate.getTime() <= now.getTime()) {
      candidate.setDate(candidate.getDate() + 1);
    }
    return candidate;
  }

  return null;
}

function extractEmergencyFlag(text: string) {
  const normalized = normalizeText(text);
  if (/(not\s+emergency|non\s*emergency|routine|scheduled)/.test(normalized)) {
    return false;
  }

  return [
    "emergency",
    "urgent",
    "critical",
    "stat",
    "life threatening",
    "icu",
    "immediate",
    "asap",
    "तत्काल",
    "आपात",
  ].some((term) => normalized.includes(term));
}

function extractInitialRadius(text: string) {
  const label = extractLabelValue(text, ["radius", "notification radius", "search radius", "distance"], true);
  const radius = label ? extractNumber(label) : null;
  return radius && radius >= 1 && radius <= 35 ? radius : null;
}

function mayBePersonName(value: string) {
  const words = splitWords(value);
  if (!words.length || words.length > 5) {
    return false;
  }

  if (words.some((word) => /\d/.test(word))) {
    return false;
  }

  return words.every((word) => /^[\p{L}'-]+$/u.test(word));
}

function extractFallbackName(text: string) {
  const cleaned = cleanValue(text);
  if (!mayBePersonName(cleaned)) {
    return null;
  }

  return cleaned;
}

function extractFreeTextMedicalReason(text: string) {
  const normalized = normalizeText(text);
  const keywords = [
    "surgery",
    "accident",
    "trauma",
    "anemia",
    "anaemia",
    "thalassemia",
    "dengue",
    "bleeding",
    "operation",
    "delivery",
    "c-section",
    "icu",
    "emergency",
  ];

  if (keywords.some((keyword) => normalized.includes(keyword))) {
    return cleanValue(text);
  }

  return null;
}

function extractFieldValues(text: string, currentDraft?: HospitalDraftState | null) {
  const values: Partial<CreatePostInput> = {};
  const normalized = normalizeText(text);

  const patientName = extractLabelValue(text, ["patient name", "name of patient", "patient full name"], true)
    ?? extractFallbackName(currentDraft?.values.patient_name ? "" : text);
  if (patientName) values.patient_name = patientName;

  const patientId = extractLabelValue(text, ["patient id", "case reference", "case ref", "reference", "mrn", "file no", "ipd no"], true);
  if (patientId) values.patient_id = patientId;

  const hospitalName = extractLabelValue(text, ["hospital name", "hospital", "blood bank", "facility"], true);
  if (hospitalName) values.hospital_name = hospitalName;

  const hospitalAddress = extractLabelValue(text, ["hospital address", "address", "full address"], true);
  if (hospitalAddress) values.hospital_address = hospitalAddress;

  const city = extractLabelValue(text, ["city", "town", "location"], true);
  if (city) values.city = city;

  const state = extractLabelValue(text, ["state", "province"], true);
  if (state) values.state = state;

  const bloodTypeNeeded = extractBloodType(text);
  if (bloodTypeNeeded) values.blood_type_needed = bloodTypeNeeded;

  const unitsNeeded = extractUnits(text);
  if (typeof unitsNeeded === "number" && Number.isFinite(unitsNeeded)) {
    values.units_needed = unitsNeeded;
  }

  const contactName = extractLabelValue(text, ["contact person", "contact name", "coordinator", "liaison"], true);
  if (contactName) values.contact_name = contactName;

  const contactPhone = extractPhone(text);
  if (contactPhone) values.contact_phone = contactPhone;

  const contactEmail = extractEmail(text);
  if (contactEmail) values.contact_email = contactEmail;

  const medicalCondition = extractLabelValue(text, ["medical condition", "medical reason", "reason", "diagnosis", "disease", "condition"], true)
    ?? extractFreeTextMedicalReason(text);
  if (medicalCondition) values.medical_condition = medicalCondition;

  const additionalNotes = extractLabelValue(text, ["additional notes", "notes", "instructions", "remarks", "special instructions"], true);
  if (additionalNotes) values.additional_notes = additionalNotes;

  const requiredBy = extractLabelValue(text, ["required by", "needed by", "by", "deadline", "needed before"], true);
  const requiredByDate = requiredBy ? parseRequiredBy(requiredBy) : parseRequiredBy(text);
  if (requiredByDate && isValid(requiredByDate)) {
    values.required_by = requiredByDate.toISOString();
  }

  const initialRadius = extractInitialRadius(text);
  if (typeof initialRadius === "number") {
    values.initial_radius_km = initialRadius;
  }

  const isEmergency = extractEmergencyFlag(text);
  if (normalized.includes("non emergency") || normalized.includes("not emergency")) {
    values.is_emergency = false;
  } else if (isEmergency) {
    values.is_emergency = true;
  }

  return values;
}

function buildMergedDraft({
  currentDraft,
  hospitalDefaults,
  extractedValues,
}: {
  currentDraft?: HospitalDraftState | null;
  hospitalDefaults: HospitalDefaults;
  extractedValues: Partial<CreatePostInput>;
}) {
  const mergedValues: Partial<CreatePostInput> = {
    ...(currentDraft?.values ?? {}),
    ...hospitalDefaults,
    ...extractedValues,
  };

  const normalized: Partial<CreatePostInput> & Record<string, unknown> = {
    ...mergedValues,
    patient_name: typeof mergedValues.patient_name === "string" ? mergedValues.patient_name.trim() : "",
    patient_id: typeof mergedValues.patient_id === "string" ? mergedValues.patient_id.trim() : "",
    blood_type_needed:
      typeof mergedValues.blood_type_needed === "string" && isBloodType(mergedValues.blood_type_needed)
        ? mergedValues.blood_type_needed
        : undefined,
    units_needed:
      typeof mergedValues.units_needed === "number" && Number.isFinite(mergedValues.units_needed)
        ? mergedValues.units_needed
        : undefined,
    hospital_name: typeof mergedValues.hospital_name === "string" ? mergedValues.hospital_name.trim() : undefined,
    hospital_address:
      typeof mergedValues.hospital_address === "string" ? mergedValues.hospital_address.trim() : undefined,
    city: typeof mergedValues.city === "string" ? mergedValues.city.trim() : undefined,
    state: typeof mergedValues.state === "string" ? mergedValues.state.trim() : undefined,
    contact_name: typeof mergedValues.contact_name === "string" ? mergedValues.contact_name.trim() : "",
    contact_phone: typeof mergedValues.contact_phone === "string" ? mergedValues.contact_phone.trim() : "",
    contact_email: typeof mergedValues.contact_email === "string" ? mergedValues.contact_email.trim() : "",
    medical_condition:
      typeof mergedValues.medical_condition === "string" ? mergedValues.medical_condition.trim() : "",
    additional_notes:
      typeof mergedValues.additional_notes === "string" ? mergedValues.additional_notes.trim() : undefined,
    is_emergency: typeof mergedValues.is_emergency === "boolean" ? mergedValues.is_emergency : false,
    required_by: typeof mergedValues.required_by === "string" ? mergedValues.required_by : "",
    initial_radius_km:
      typeof mergedValues.initial_radius_km === "number" && Number.isFinite(mergedValues.initial_radius_km)
        ? mergedValues.initial_radius_km
        : 25,
  };

  return normalized;
}

function buildDraftQuestions(missingFields: string[], language: AssistantLanguage) {
  const mapQuestion = (field: string) => {
    const key = field as FieldQuestionKey;
    return FIELD_QUESTION_MAP[key]?.[language === "hi" ? "hi" : "en"] ?? field.replace(/_/g, " ");
  };

  return sortDraftFields(missingFields).map(mapQuestion);
}

export function buildHospitalDraftFieldChecklist({
  values,
  missingFields,
  language,
}: {
  values: Partial<CreatePostInput>;
  missingFields: string[];
  language: AssistantLanguage;
}): HospitalDraftChecklistItem[] {
  const missingSet = new Set(missingFields);
  const lang = language === "hi" ? "hi" : "en";
  const optionalFields = new Set<FieldQuestionKey>([
    "hospital_name",
    "hospital_address",
    "city",
    "state",
    "contact_email",
    "additional_notes",
    "is_emergency",
    "initial_radius_km",
  ]);

  return DRAFT_FIELD_ORDER.map((field) => {
    const value = formatDraftValue(values[field as keyof CreatePostInput], language);
    const missing = missingSet.has(field);

    return {
      field,
      label: FIELD_LABEL_MAP[field][lang],
      value,
      required: !optionalFields.has(field),
      missing,
      prompt: missing ? FIELD_QUESTION_MAP[field][lang] : null,
    };
  }).filter((item) => item.required || item.missing || item.value !== "Not provided");
}

function summarizeDraft(values: Partial<CreatePostInput>, missingFields: string[]) {
  const capturedParts = [
    values.patient_name ? `patient ${values.patient_name}` : null,
    values.patient_id ? `case ${values.patient_id}` : null,
    values.blood_type_needed ? `${values.blood_type_needed} blood` : null,
    typeof values.units_needed === "number" ? `${values.units_needed} unit${values.units_needed === 1 ? "" : "s"}` : null,
    values.city ? values.city : null,
    values.state ? values.state : null,
    values.required_by ? `required by ${values.required_by}` : null,
  ].filter(Boolean);

  const captured = capturedParts.length ? capturedParts.join(", ") : "no fields captured yet";
  const missing = missingFields.length ? `Missing: ${missingFields.join(", ")}.` : "No missing fields.";
  return `${captured}. ${missing}`;
}

export function isConfirmDraftMessage(message: string) {
  const normalized = normalizeText(message);
  return CONFIRM_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function isHospitalDraftRequest(message: string, draftState: HospitalDraftState | null | undefined) {
  if (draftState?.readyForReview) {
    return true;
  }

  if (draftState?.values && Object.keys(draftState.values).length > 0) {
    return true;
  }

  const normalized = normalizeText(message);
  return DRAFT_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function buildHospitalDraftReply({
  language,
  readyForReview,
  missingFields,
  questions,
}: {
  language: AssistantLanguage;
  readyForReview: boolean;
  missingFields: string[];
  questions: string[];
}) {
  if (readyForReview) {
    if (language === "hi") {
      return "Draft तैयार है. Audit summary जांचें, फिर Confirm post दबाएँ या confirm post लिखकर publish करें.";
    }

    return "The draft is ready for review. Check the audit summary, then click Confirm post or type confirm post to publish.";
  }

  const intro =
    language === "hi"
      ? "मुझे इस request को तैयार करने के लिए अभी कुछ जानकारी चाहिए:"
      : "I still need a few details before I can prepare this request:";

  const prompts = questions.slice(0, 4).map((question) => `- ${question}`);
  if (!prompts.length && missingFields.length) {
    prompts.push(...missingFields.slice(0, 4).map((field) => `- ${field.replace(/_/g, " ")}`));
  }

  return [intro, ...prompts].join("\n");
}

function buildHospitalDraftReplyNext({
  language,
  readyForReview,
  missingFields,
  questions,
}: {
  language: AssistantLanguage;
  readyForReview: boolean;
  missingFields: string[];
  questions: string[];
}) {
  if (readyForReview) {
    if (language === "hi") {
      return "Draft तैयार है. Audit summary जाँचें, फिर Confirm post दबाएँ या confirm post लिखकर publish करें.";
    }

    return "The draft is ready for review. Check the audit summary, then click Confirm post or type confirm post to publish.";
  }

  const intro =
    language === "hi"
      ? "मुझे इस request को तैयार करने के लिए अभी कुछ जानकारी चाहिए:"
      : "I still need a few details before I can prepare this request:";

  const prompts = questions.slice(0, 1).map((question, index) => `${index + 1}. ${question}`);
  if (!prompts.length && missingFields.length) {
    prompts.push(
      ...sortDraftFields(missingFields)
        .slice(0, 1)
        .map((field, index) => `${index + 1}. ${field.replace(/_/g, " ")}`),
    );
  }

  const nextLine =
    language === "hi"
      ? "ऊपर दिए गए blanks भरें, फिर मैं draft को review mode तक ले जाऊँगा."
      : "Fill the blanks above, and I’ll take the draft to review mode.";

  return [intro, ...prompts, nextLine].join("\n");
}

void buildHospitalDraftReply;

export function extractHospitalDraft({
  message,
  language,
  messages,
  currentDraft,
  hospitalDefaults,
}: {
  message: string;
  language: AssistantLanguage;
  messages?: ChatbotConversationMessage[];
  currentDraft?: HospitalDraftState | null;
  hospitalDefaults: HospitalDefaults;
}) {
  const transcript = [currentDraft?.summary, ...(messages ?? []).map((entry) => entry.content), message]
    .filter(Boolean)
    .join("\n");
  const extractedValues = extractFieldValues(transcript, currentDraft);
  const normalizedDraft = buildMergedDraft({ currentDraft, hospitalDefaults, extractedValues });
  const validation = createPostSchema.safeParse(normalizedDraft);
  const missingFields = validation.success
    ? []
    : validation.error.issues
        .map((issue) => issue.path[0])
        .filter((field): field is string => typeof field === "string");

  const readyForReview = validation.success;
  const questions = buildDraftQuestions(missingFields, language);
  const fieldChecklist = buildHospitalDraftFieldChecklist({
    values: normalizedDraft,
    missingFields,
    language,
  });
  const summary = summarizeDraft(normalizedDraft, missingFields);
  const auditSummary = summary;
  const capturedFields = Object.entries(normalizedDraft)
    .filter(([, value]) => {
      if (typeof value === "string") return Boolean(value.trim());
      if (typeof value === "number") return Number.isFinite(value);
      if (typeof value === "boolean") return true;
      return Boolean(value);
    })
    .map(([field]) => field);

  const reply = buildHospitalDraftReplyNext({
    language,
    readyForReview,
    missingFields,
    questions,
  });

  return {
    reply,
    values: normalizedDraft,
    missingFields,
    questions,
    fieldChecklist,
    readyForReview,
    summary,
    auditSummary,
    capturedFields,
    nextMissingField: sortDraftFields(missingFields)[0] ?? null,
    reviewMode: readyForReview ? "review" : "collecting",
    nextAction: readyForReview ? "confirm" : "fill_details",
    lastUpdatedAt: new Date().toISOString(),
  } satisfies HospitalDraftExtraction;
}

export function buildDraftHoldMessage(language: AssistantLanguage) {
  if (language === "hi") {
    return "कृपया ऊपर दिए गए missing details भरें, फिर Confirm post दबाएँ या लिखें.";
  }

  return "Please fill the missing details above, then click Confirm post or type confirm post.";
}

export function buildDraftReviewPrompt(language: AssistantLanguage) {
  if (language === "hi") {
    return "Draft review mode ready. Audit summary check karke confirm post करें.";
  }

  return "Draft review mode is ready. Review the audit summary and confirm post when you're ready.";
}
