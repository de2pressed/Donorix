import { NextRequest, NextResponse } from "next/server";

import { getFeedPosts } from "@/lib/data";
import { env } from "@/lib/env";
import { jsonError, requireServerUser } from "@/lib/http";
import { canDonateToRecipient, isBloodType } from "@/lib/utils/blood-type";
import type { BloodType } from "@/lib/utils/blood-type";
import { sanitizeText } from "@/lib/utils/sanitize";
import { createPostSchema, type CreatePostInput } from "@/lib/validations/post";

const SYSTEM_PROMPT = `You are Donorix Assistant, a guide for the Donorix blood donation platform in India.
Help donors find requests, understand eligibility, and navigate the platform.
Help hospitals create requests and manage donor applicants.
Never imply that donor or guest accounts can create, draft, or publish blood requests. Only verified hospital accounts can do that.
Be concise, practical, and medically careful.
Do not provide specific medical advice or replace emergency services.
Reply in the same language as the user when possible.`;

const OPENAI_MODEL = "gpt-5-nano";

const LANGUAGE_NAMES = {
  en: "English",
  hi: "हिंदी",
  bn: "বাংলা",
  te: "తెలుగు",
  mr: "मराठी",
  ta: "தமிழ்",
  gu: "ગુજરાતી",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  pa: "ਪੰਜਾਬੀ",
  or: "ଓଡ଼ିଆ",
  ur: "اردو",
} as const;

type SupportedLanguage = keyof typeof LANGUAGE_NAMES;
type Intent = "fallback" | "eligibility" | "emergency" | "request";
type Persona = "guest" | "donor" | "hospital";
type ChatRole = "assistant" | "user" | "system";

type ChatMessageInput = {
  role: ChatRole;
  content: string;
};

type HospitalDraftState = {
  values: Partial<CreatePostInput>;
  missingFields: string[];
  questions: string[];
  readyForReview: boolean;
  summary: string;
  blockedReason?: string | null;
};

type EligiblePost = {
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

type ChatbotRequest = {
  message?: string;
  language?: string;
  persona?: Persona;
  pathname?: string;
  messages?: ChatMessageInput[];
  draftState?: HospitalDraftState | null;
  userMessageCount?: number;
};

type ChatbotResponse = {
  language: SupportedLanguage;
  languageName: string;
  reply: string;
  persona: Persona;
  mode: "general" | "eligible_posts" | "hospital_draft";
  eligiblePosts?: EligiblePost[];
  draftState?: HospitalDraftState | null;
  reminder?: string | null;
};

const RESPONSES: Record<SupportedLanguage, Record<Intent, string>> = {
  en: {
    fallback:
      "I can help you understand Donorix, check donor eligibility, or find requests you may be able to respond to.",
    eligibility:
      "Most donors need to be 18 or older, weigh at least 50 kg, and keep a 90-day gap after a whole blood donation. Final eligibility must still be confirmed by the treating hospital or blood bank.",
    emergency:
      "Emergency posts receive priority ranking, but Donorix is not an emergency service. In a life-threatening situation, contact 112 or your nearest hospital immediately while you continue donor outreach here.",
    request:
      "To post a request, share the patient name, blood group, hospital, city, contact details, required-by time, and whether the case is an emergency. The multi-step request flow will validate each section before posting.",
  },
  hi: {
    fallback:
      "मैं रक्त अनुरोध बनाने, डोनर पात्रता समझाने और लाइव फ़ीड तक पहुंचने में मदद कर सकता हूं। बताइए कि आपको आपात स्थिति, डोनेशन नियम या अनुरोध पोस्ट करने में किस चीज़ की मदद चाहिए।",
    eligibility:
      "अधिकांश डोनर के लिए आयु 18+ होनी चाहिए, वजन कम से कम 50 किलोग्राम होना चाहिए और पूरे रक्तदान के बाद 90 दिन का अंतर रखना चाहिए। अंतिम पात्रता की पुष्टि अस्पताल या ब्लड बैंक करेगा।",
    emergency:
      "आपात पोस्ट को प्राथमिक रैंकिंग मिलती है, लेकिन Donorix स्वयं आपातकालीन सेवा नहीं है। जानलेवा स्थिति में तुरंत 112 या नज़दीकी अस्पताल से संपर्क करें और यहां डोनर खोज जारी रखें।",
    request:
      "रक्त अनुरोध पोस्ट करने के लिए मरीज का नाम, रक्त समूह, अस्पताल, शहर, संपर्क विवरण, आवश्यक समय और आपात स्थिति का संकेत दें। बहु-चरणीय फ़ॉर्म पोस्ट करने से पहले हर भाग की जांच करता है।",
  },
  bn: {
    fallback:
      "আমি রক্তের অনুরোধ তৈরি করা, দাতার যোগ্যতা বোঝানো এবং লাইভ ফিডে যেতে সাহায্য করতে পারি। জরুরি কেস, ডোনেশন নিয়ম বা অনুরোধ পোস্ট করা নিয়ে কী দরকার বলুন।",
    eligibility:
      "বেশিরভাগ দাতার বয়স কমপক্ষে ১৮ বছর, ওজন অন্তত ৫০ কেজি এবং পূর্ণ রক্তদানের পরে ৯০ দিনের ব্যবধান থাকা দরকার। চূড়ান্ত যোগ্যতা হাসপাতাল বা ব্লাড ব্যাংক নিশ্চিত করবে।",
    emergency:
      "জরুরি পোস্ট আগে দেখানো হয়, কিন্তু Donorix নিজে জরুরি চিকিৎসা সেবা নয়। জীবন-ঝুঁকিপূর্ণ অবস্থায় সঙ্গে সঙ্গে ১১২ বা নিকটস্থ হাসপাতালে যোগাযোগ করুন।",
    request:
      "অনুরোধ পোস্ট করতে রোগীর নাম, রক্তের গ্রুপ, হাসপাতাল, শহর, যোগাযোগের তথ্য, প্রয়োজনের সময় এবং এটি জরুরি কি না দিন। মাল্টি-স্টেপ ফর্ম প্রতিটি অংশ যাচাই করে।",
  },
  te: {
    fallback:
      "నేను రక్త అభ్యర్థన సృష్టించడం, దాత అర్హత వివరించడం మరియు లైవ్ ఫీడ్‌కి వెళ్లడంలో సహాయం చేయగలను. అత్యవసరం, దానం నియమాలు లేదా అభ్యర్థన పోస్టింగ్‌లో ఏ సహాయం కావాలో చెప్పండి.",
    eligibility:
      "చాలా మంది దాతలకు కనీసం 18 సంవత్సరాల వయస్సు, 50 కిలోల బరువు మరియు పూర్తి రక్తదానం తర్వాత 90 రోజుల విరామం అవసరం. తుది అర్హతను ఆసుపత్రి లేదా బ్లడ్ బ్యాంక్ నిర్ధారిస్తుంది.",
    emergency:
      "అత్యవసర పోస్టులకు ప్రాధాన్యత లభిస్తుంది, కానీ Donorix అత్యవసర సేవ కాదు. ప్రాణాపాయం ఉన్నప్పుడు వెంటనే 112 లేదా సమీప ఆసుపత్రిని సంప్రదించండి.",
    request:
      "అభ్యర్థన పోస్టు చేయడానికి రోగి పేరు, రక్త గ్రూప్, ఆసుపత్రి, నగరం, సంప్రదింపు వివరాలు, అవసరమైన సమయం మరియు ఇది అత్యవసరమా అనే విషయం ఇవ్వండి. బహుళ-దశల ఫారమ్ ప్రతి భాగాన్ని తనిఖీ చేస్తుంది.",
  },
  mr: {
    fallback:
      "मी रक्त विनंती तयार करणे, दाता पात्रता समजावणे आणि लाइव्ह फीडकडे मार्गदर्शन करू शकतो. आपत्कालीन केस, दान नियम किंवा विनंती पोस्ट करण्याबाबत काय मदत हवी ते सांगा.",
    eligibility:
      "बहुतेक दात्यांसाठी वय 18+, वजन किमान 50 किलो आणि संपूर्ण रक्तदानानंतर 90 दिवसांचे अंतर आवश्यक असते. अंतिम पात्रता रुग्णालय किंवा रक्तपेढी निश्चित करते.",
    emergency:
      "आपत्कालीन पोस्टना प्राधान्य मिळते, पण Donorix ही आपत्कालीन सेवा नाही. जीवघेण्या परिस्थितीत ताबडतोब 112 किंवा जवळच्या रुग्णालयाशी संपर्क करा.",
    request:
      "विनंती पोस्ट करण्यासाठी रुग्णाचे नाव, रक्तगट, रुग्णालय, शहर, संपर्क तपशील, आवश्यक वेळ आणि केस आपत्कालीन आहे का हे द्या. मल्टी-स्टेप फॉर्म प्रत्येक भाग पडताळतो.",
  },
  ta: {
    fallback:
      "நான் ரத்த கோரிக்கை உருவாக்க, தானதாரர் தகுதியை விளக்க, மற்றும் live feed-க்கு வழிகாட்ட உதவுவேன். அவசர நிலை, தான விதிகள் அல்லது கோரிக்கை பதிவிடுவது பற்றி என்ன உதவி வேண்டும் என்று சொல்லுங்கள்.",
    eligibility:
      "பெரும்பாலான தானதாரர்களுக்கு 18 வயது மேல், குறைந்தது 50 கிலோ எடை மற்றும் முழு ரத்த தானத்திற்குப் பிறகு 90 நாள் இடைவெளி தேவை. இறுதி தகுதியை மருத்துவமனை அல்லது ரத்த வங்கி உறுதி செய்யும்.",
    emergency:
      "அவசர பதிவுகள் முன்னுரிமை பெறும், ஆனால் Donorix அவசர மருத்துவ சேவை அல்ல. உயிருக்கு ஆபத்தான நிலை என்றால் உடனே 112 அல்லது அருகிலுள்ள மருத்துவமனையை தொடர்பு கொள்ளுங்கள்.",
    request:
      "கோரிக்கை பதிவிட நோயாளி பெயர், ரத்த வகை, மருத்துவமனை, நகரம், தொடர்பு விவரங்கள், தேவைப்படும் நேரம் மற்றும் இது அவசரமா என்பதை கொடுக்க வேண்டும். பல படிவங்கள் ஒவ்வொரு பகுதியையும் சரிபார்க்கும்.",
  },
  gu: {
    fallback:
      "હું બ્લડ રિક્વેસ્ટ બનાવવામાં, દાતા પાત્રતા સમજાવવામાં અને લાઇવ ફીડ તરફ માર્ગદર્શન આપવામાં મદદ કરી શકું છું. ઇમરજન્સી, દાન નિયમો અથવા રિક્વેસ્ટ પોસ્ટ કરવા અંગે શું મદદ જોઈએ તે કહો.",
    eligibility:
      "મોટાભાગના દાતાઓ માટે ઉંમર ઓછામાં ઓછી 18 વર્ષ, વજન 50 કિગ્રા અને સંપૂર્ણ રક્તદાન પછી 90 દિવસનું અંતર જરૂરી છે. અંતિમ પાત્રતા હોસ્પિટલ અથવા બ્લડ બેંક નક્કી કરશે.",
    emergency:
      "ઇમરજન્સી પોસ્ટને પ્રાથમિકતા મળે છે, પરંતુ Donorix પોતે ઇમરજન્સી સેવા નથી. જીવલેણ સ્થિતિમાં તરત 112 અથવા નજીકની હોસ્પિટલનો સંપર્ક કરો.",
    request:
      "રિક્વેસ્ટ પોસ્ટ કરવા માટે દર્દીનું નામ, બ્લડ ગ્રુપ, હોસ્પિટલ, શહેર, સંપર્ક વિગતો, જરૂરી સમય અને કેસ ઇમરજન્સી છે કે નહીં તે આપો. મલ્ટી-સ્ટેપ ફોર્મ દરેક ભાગ ચકાસે છે.",
  },
  kn: {
    fallback:
      "ನಾನು ರಕ್ತ ವಿನಂತಿ ಸೃಷ್ಟಿಸಲು, ದಾನಿದಾರರ ಅರ್ಹತೆಯನ್ನು ವಿವರಿಸಲು ಮತ್ತು live feed ಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ತುರ್ತು ಪ್ರಕರಣ, ದಾನ ನಿಯಮಗಳು ಅಥವಾ ವಿನಂತಿ ಪೋಸ್ಟ್ ಮಾಡುವ ಬಗ್ಗೆ ಏನು ಸಹಾಯ ಬೇಕು ಹೇಳಿ.",
    eligibility:
      "ಹೆಚ್ಚಿನ ದಾನಿದಾರರಿಗೆ ಕನಿಷ್ಠ 18 ವರ್ಷ ವಯಸ್ಸು, 50 ಕೆಜಿ ತೂಕ ಮತ್ತು ಸಂಪೂರ್ಣ ರಕ್ತದಾನದ ನಂತರ 90 ದಿನಗಳ ಅಂತರ ಬೇಕಾಗುತ್ತದೆ. ಅಂತಿಮ ಅರ್ಹತೆಯನ್ನು ಆಸ್ಪತ್ರೆ ಅಥವಾ ರಕ್ತ ಬ್ಯಾಂಕ್ ದೃಢೀಕರಿಸುತ್ತದೆ.",
    emergency:
      "ತುರ್ತು ಪೋಸ್ಟ್‌ಗಳಿಗೆ ಆದ್ಯತೆ ಸಿಗುತ್ತದೆ, ಆದರೆ Donorix ತುರ್ತು ಸೇವೆಯಲ್ಲ. ಜೀವಕ್ಕೆ ಅಪಾಯವಾದರೆ ತಕ್ಷಣ 112 ಅಥವಾ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಸಂಪರ್ಕಿಸಿ.",
    request:
      "ವಿನಂತಿ ಪೋಸ್ಟ್ ಮಾಡಲು ರೋಗಿಯ ಹೆಸರು, ರಕ್ತ ಗುಂಪು, ಆಸ್ಪತ್ರೆ, ನಗರ, ಸಂಪರ್ಕ ವಿವರಗಳು, ಅಗತ್ಯ ಸಮಯ ಮತ್ತು ಇದು ತುರ್ತು ಪ್ರಕರಣವೇ ಎಂಬುದನ್ನು ನೀಡಿ. ಬಹು ಹಂತದ ಫಾರ್ಮ್ ಪ್ರತಿಯೊಂದು ವಿಭಾಗವನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ.",
  },
  ml: {
    fallback:
      "രക്ത അഭ്യർത്ഥന സൃഷ്ടിക്കാനും, ദാതാവിന്റെ യോഗ്യത വിശദീകരിക്കാനും, ലൈവ് ഫീഡിലേക്ക് നയിക്കാനും ഞാൻ സഹായിക്കാം. അടിയന്തര കേസ്, ദാന നിയമങ്ങൾ, അല്ലെങ്കിൽ അഭ്യർത്ഥന പോസ്റ്റ് ചെയ്യൽ എന്നിവയിൽ എന്ത് സഹായം വേണ്ടെന്ന് പറയൂ.",
    eligibility:
      "മിക്ക ദാതാക്കൾക്കും കുറഞ്ഞത് 18 വയസ്സ്, 50 കിലോ ഭാരം, മുഴുവൻ രക്തദാനത്തിന് ശേഷം 90 ദിവസത്തെ ഇടവേള എന്നിവ ആവശ്യമാണ്. അന്തിമ യോഗ്യത ആശുപത്രിയോ ബ്ലഡ് ബാങ്കോ ഉറപ്പാക്കും.",
    emergency:
      "അടിയന്തര പോസ്റ്റുകൾക്ക് മുൻഗണന ലഭിക്കും, പക്ഷേ Donorix സ്വതന്ത്രമായ അടിയന്തര സേവനം അല്ല. ജീവന് ഭീഷണിയുള്ള സാഹചര്യത്തിൽ ഉടൻ 112 അല്ലെങ്കിൽ സമീപത്തെ ആശുപത്രിയെ സമീപിക്കുക.",
    request:
      "അഭ്യർത്ഥന പോസ്റ്റ് ചെയ്യാൻ രോഗിയുടെ പേര്, രക്തഗ്രൂപ്പ്, ആശുപത്രി, നഗരം, ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ, ആവശ്യമായ സമയം, അടിയന്തരമാണോ എന്നത് എന്നിവ നൽകണം. മൾട്ടി-സ്റ്റെപ്പ് ഫോം ഓരോ ഭാഗവും പരിശോധിക്കും.",
  },
  pa: {
    fallback:
      "ਮੈਂ ਖੂਨ ਦੀ ਬੇਨਤੀ ਬਣਾਉਣ, ਦਾਤਾ ਯੋਗਤਾ ਸਮਝਾਉਣ ਅਤੇ live feed ਵੱਲ ਰਾਹਦਾਰੀ ਦੇ ਸਕਦਾ ਹਾਂ। ਐਮਰਜੈਂਸੀ ਕੇਸ, ਦਾਨ ਨਿਯਮ ਜਾਂ ਬੇਨਤੀ ਪੋਸਟ ਕਰਨ ਬਾਰੇ ਕੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ ਦੱਸੋ।",
    eligibility:
      "ਜ਼ਿਆਦਾਤਰ ਦਾਤਾਵਾਂ ਲਈ ਘੱਟੋ-ਘੱਟ ਉਮਰ 18 ਸਾਲ, ਵਜ਼ਨ 50 ਕਿਲੋ ਅਤੇ ਪੂਰੇ ਖੂਨ ਦੇ ਦਾਨ ਤੋਂ ਬਾਅਦ 90 ਦਿਨ ਦਾ ਅੰਤਰ ਲਾਜ਼ਮੀ ਹੁੰਦਾ ਹੈ। ਅੰਤਿਮ ਯੋਗਤਾ ਹਸਪਤਾਲ ਜਾਂ ਬਲੱਡ ਬੈਂਕ ਤੈਅ ਕਰੇਗਾ।",
    emergency:
      "ਐਮਰਜੈਂਸੀ ਪੋਸਟਾਂ ਨੂੰ ਪਹਿਲ ਮਿਲਦੀ ਹੈ, ਪਰ Donorix ਖੁਦ ਐਮਰਜੈਂਸੀ ਸੇਵਾ ਨਹੀਂ ਹੈ। ਜਾਨਲੇਵਾ ਹਾਲਤ ਵਿੱਚ ਤੁਰੰਤ 112 ਜਾਂ ਨੇੜਲੇ ਹਸਪਤਾਲ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
    request:
      "ਬੇਨਤੀ ਪੋਸਟ ਕਰਨ ਲਈ ਮਰੀਜ਼ ਦਾ ਨਾਮ, ਖੂਨ ਦਾ ਗਰੁੱਪ, ਹਸਪਤਾਲ, ਸ਼ਹਿਰ, ਸੰਪਰਕ ਵੇਰਵਾ, ਲੋੜੀਂਦਾ ਸਮਾਂ ਅਤੇ ਕੀ ਕੇਸ ਐਮਰਜੈਂਸੀ ਹੈ ਇਹ ਦਿਓ। ਮਲਟੀ-ਸਟੈਪ ਫਾਰਮ ਹਰ ਭਾਗ ਦੀ ਜਾਂਚ ਕਰਦਾ ਹੈ।",
  },
  or: {
    fallback:
      "ମୁଁ ରକ୍ତ ଅନୁରୋଧ ତିଆରି କରିବା, ଦାତା ଯୋଗ୍ୟତା ବୁଝେଇବା ଏବଂ ଲାଇଭ୍ ଫିଡ୍‌କୁ ନେଇଯିବାରେ ସାହାଯ୍ୟ କରିପାରିବି। ଜରୁରୀ ପରିସ୍ଥିତି, ଦାନ ନିୟମ କିମ୍ବା ଅନୁରୋଧ ପୋଷ୍ଟ କରିବା ବିଷୟରେ କହନ୍ତୁ।",
    eligibility:
      "ଅଧିକାଂଶ ଦାତାଙ୍କ ପାଇଁ ବୟସ 18+, ଓଜନ କମରେ 50 କେଜି ଏବଂ ପୂର୍ଣ୍ଣ ରକ୍ତଦାନ ପରେ 90 ଦିନର ବିରତି ଆବଶ୍ୟକ। ଶେଷ ଯୋଗ୍ୟତା ହସ୍ପିଟାଲ କିମ୍ବା ବ୍ଲଡ୍ ବ୍ୟାଙ୍କ ନିଶ୍ଚିତ କରିବ।",
    emergency:
      "ଜରୁରୀ ପୋଷ୍ଟକୁ ପ୍ରାଥମିକତା ମିଳେ, କିନ୍ତୁ Donorix ଆପାତକାଳୀନ ସେବା ନୁହେଁ। ଜୀବନ ଜୋଖିମ ଥିଲେ ସତ୍ତ୍ୱର 112 କିମ୍ବା ନିକଟସ୍ଥ ହସ୍ପିଟାଲ ସହ ସମ୍ପର୍କ କରନ୍ତୁ।",
    request:
      "ଅନୁରୋଧ ପୋଷ୍ଟ କରିବା ପାଇଁ ରୋଗୀଙ୍କ ନାମ, ରକ୍ତ ଗୋଷ୍ଠୀ, ହସ୍ପିଟାଲ, ସହର, ଯୋଗାଯୋଗ ବିବରଣୀ, ଆବଶ୍ୟକ ସମୟ ଏବଂ ଏହା ଜରୁରୀ କି ନୁହେଁ ଦିଅନ୍ତୁ। ମଲ୍ଟି-ସ୍ଟେପ୍ ଫର୍ମ ପ୍ରତ୍ୟେକ ଭାଗ ଯାଞ୍ଚ କରେ।",
  },
  ur: {
    fallback:
      "میں خون کی درخواست بنانے، ڈونر کی اہلیت سمجھانے اور live feed تک رہنمائی کرنے میں مدد کر سکتا ہوں۔ بتائیں آپ کو ایمرجنسی کیس، ڈونیشن رولز یا درخواست پوسٹ کرنے میں کس چیز کی مدد چاہیے۔",
    eligibility:
      "زیادہ تر ڈونرز کے لیے عمر کم از کم 18 سال، وزن کم از کم 50 کلو اور مکمل خون کے عطیے کے بعد 90 دن کا وقفہ ضروری ہوتا ہے۔ حتمی اہلیت اسپتال یا بلڈ بینک طے کرے گا۔",
    emergency:
      "ایمرجنسی پوسٹس کو ترجیح ملتی ہے، لیکن Donorix خود ایمرجنسی سروس نہیں ہے۔ جان لیوا صورت حال میں فوراً 112 یا قریبی اسپتال سے رابطہ کریں۔",
    request:
      "درخواست پوسٹ کرنے کے لیے مریض کا نام، بلڈ گروپ، اسپتال، شہر، رابطہ معلومات، مطلوبہ وقت اور یہ کہ کیس ایمرجنسی ہے یا نہیں درج کریں۔ ملٹی اسٹیپ فارم ہر حصے کی جانچ کرتا ہے۔",
  },
};

function resolveLanguage(language?: string): SupportedLanguage {
  return language && language in LANGUAGE_NAMES ? (language as SupportedLanguage) : "en";
}

function detectIntent(message: string): Intent {
  const normalized = sanitizeText(message).toLowerCase();

  if (
    ["elig", "eligible", "eligibility", "donor", "पात्र", "যোগ্য", "అర్హ", "தகுதி", "اہلیت"].some((term) =>
      normalized.includes(term),
    )
  ) {
    return "eligibility";
  }

  if (
    ["emergency", "urgent", "critical", "आपात", "জরুরি", "అత్యవసర", "அவசர", "ایمرجنسی"].some((term) =>
      normalized.includes(term),
    )
  ) {
    return "emergency";
  }

  if (
    ["request", "post", "create", "hospital", "अनुरोध", "পোস্ট", "అభ్యర్థన", "கோரிக்கை", "درخواست"].some((term) =>
      normalized.includes(term),
    )
  ) {
    return "request";
  }

  return "fallback";
}

function buildFallbackReply(message: string, language: SupportedLanguage, persona: Persona) {
  const intent = detectIntent(message);

  if (persona !== "hospital" && intent === "request") {
    return RESPONSES[language].fallback;
  }

  return RESPONSES[language][intent];
}

function sanitizePersonaReply(reply: string, language: SupportedLanguage, persona: Persona) {
  if (persona === "hospital") {
    return reply;
  }

  const normalized = sanitizeText(reply).toLowerCase();
  const forbiddenPhrases = [
    "create a request",
    "create a blood request",
    "post a request",
    "publish the request",
    "draft the request",
    "create a post",
    "blood request",
  ];

  if (forbiddenPhrases.some((phrase) => normalized.includes(phrase))) {
    return RESPONSES[language].fallback;
  }

  return reply;
}

function resolvePersona(requestedPersona: unknown, accountType?: string | null): Persona {
  if (accountType === "hospital") return "hospital";
  if (accountType === "donor") return "donor";
  if (requestedPersona === "hospital" || requestedPersona === "donor" || requestedPersona === "guest") {
    return requestedPersona;
  }
  return "guest";
}

function isEligibilityRequest(message: string) {
  const normalized = sanitizeText(message).toLowerCase();
  return [
    "eligible",
    "eligibility",
    "compatible",
    "compatibility",
    "show posts",
    "find posts",
    "posts i can donate to",
    "eligible to donate",
    "donate to",
    "can i donate",
    "which posts",
  ].some((term) => normalized.includes(term));
}

function isHospitalDraftRequest(message: string, draftState: HospitalDraftState | null | undefined) {
  if (draftState?.readyForReview) {
    return true;
  }

  const normalized = sanitizeText(message).toLowerCase();
  return [
    "create post",
    "new request",
    "patient post",
    "blood request",
    "post for patient",
    "draft",
    "request for patient",
    "admit",
    "ward",
    "blood needed",
  ].some((term) => normalized.includes(term));
}

function getGuestReminder(language: SupportedLanguage) {
  if (language === "hi") {
    return "मुफ़्त खाता आपको ज़्यादा tailored help, donor matches, और hospital shortcuts देता है.";
  }

  return "A free account unlocks more tailored help, donor matches, and hospital shortcuts.";
}

function buildConversationTranscript(messages: ChatMessageInput[] | undefined, latestMessage: string) {
  const trimmed = (messages ?? []).slice(-8);
  const lines = trimmed.map((entry) => `${entry.role.toUpperCase()}: ${sanitizeText(entry.content)}`);
  lines.push(`USER: ${sanitizeText(latestMessage)}`);
  return lines.join("\n");
}

async function getOpenAIReply({
  message,
  language,
  persona,
  pathname,
  messages,
}: {
  message: string;
  language: SupportedLanguage;
  persona: Persona;
  pathname?: string;
  messages?: ChatMessageInput[];
}) {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: `${SYSTEM_PROMPT}

Current persona: ${persona}.
Current page: ${pathname ?? "unknown"}.
Rules:
- If persona is donor, answer general platform questions and guide eligible-post discovery.
- If persona is hospital, help with request drafting, but do not invent missing patient details.
- If persona is guest, answer general questions and stay subtly encouraging about creating a free account.
- Never give medical diagnosis or replace emergency services.
- Keep responses concise and practical.`,
          },
          {
            role: "user",
            content: `Conversation transcript:
${buildConversationTranscript(messages, message)}

Respond in ${LANGUAGE_NAMES[language]} when possible.`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json().catch(() => null)) as
      | {
          choices?: Array<{
            message?: {
              content?: string | null;
            };
          }>;
        }
      | null;

    const reply = payload?.choices?.[0]?.message?.content?.trim();
    return reply || null;
  } catch {
    return null;
  }
}

async function extractHospitalDraft({
  message,
  language,
  messages,
  currentDraft,
  hospitalDefaults,
}: {
  message: string;
  language: SupportedLanguage;
  messages?: ChatMessageInput[];
  currentDraft?: HospitalDraftState | null;
  hospitalDefaults: Partial<CreatePostInput>;
}) {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You extract blood-request fields for Donorix hospital users.
Never guess or invent missing values.
Only include values explicitly supplied by the user or present in the provided draft defaults.
If a field is uncertain, set it to null and list it in missing_fields or questions.
Return JSON with:
{
  "reply": string,
  "values": {
    "patient_name": string | null,
    "patient_id": string | null,
    "blood_type_needed": string | null,
    "units_needed": number | null,
    "hospital_name": string | null,
    "hospital_address": string | null,
    "city": string | null,
    "state": string | null,
    "contact_name": string | null,
    "contact_phone": string | null,
    "contact_email": string | null,
    "medical_condition": string | null,
    "additional_notes": string | null,
    "is_emergency": boolean | null,
    "required_by": string | null,
    "initial_radius_km": number | null
  },
  "missing_fields": string[],
  "questions": string[],
  "ready_for_review": boolean,
  "summary": string
}
The reply must be concise and in the same language as the user when possible.`,
          },
          {
            role: "user",
            content: `Language: ${LANGUAGE_NAMES[language]}
Draft defaults: ${JSON.stringify(hospitalDefaults)}
Current draft: ${JSON.stringify(currentDraft?.values ?? {})}
Conversation transcript:
${buildConversationTranscript(messages, message)}

Latest message: ${sanitizeText(message)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json().catch(() => null)) as
      | {
          choices?: Array<{
            message?: {
              content?: string | null;
            };
          }>;
        }
      | null;

    const raw = payload?.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<HospitalDraftState> & {
      reply?: string;
      values?: Partial<CreatePostInput>;
      missing_fields?: string[];
      questions?: string[];
      ready_for_review?: boolean;
      summary?: string;
    };

    return {
      reply: typeof parsed.reply === "string" ? parsed.reply.trim() : "",
      values: parsed.values ?? {},
      missingFields: Array.isArray(parsed.missing_fields)
        ? parsed.missing_fields.filter((field): field is string => typeof field === "string")
        : [],
      questions: Array.isArray(parsed.questions)
        ? parsed.questions.filter((field): field is string => typeof field === "string")
        : [],
      readyForReview: Boolean(parsed.ready_for_review),
      summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "",
    } satisfies HospitalDraftState & { reply: string };
  } catch {
    return null;
  }
}

function formatEligiblePostsReply(posts: EligiblePost[], language: SupportedLanguage) {
  const intro =
    language === "hi"
      ? `Mujhe ${posts.length} compatible requests mile.`
      : `I found ${posts.length} compatible request${posts.length === 1 ? "" : "s"}.`;

  const lines = posts
    .slice(0, 5)
    .map(
      (post, index) =>
        `${index + 1}. ${post.patient_name} - ${post.blood_type_needed} - ${post.hospital_name}, ${post.city}, ${post.state}`,
    );

  return [intro, ...lines, "Open any card to view the post and respond directly."].join("\n");
}

function buildHospitalFallbackReply(missingFields: string[], language: SupportedLanguage) {
  const questionMap: Record<string, string> = {
    patient_name: "What is the patient name?",
    patient_id: "What patient ID or case reference should I use?",
    blood_type_needed: "Which blood group is needed?",
    units_needed: "How many units are needed?",
    contact_name: "Who should I list as the contact person?",
    contact_phone: "What contact phone number should I use?",
    medical_condition: "What is the medical reason for the blood request?",
    required_by: "When is the blood required? Please share a date and time.",
  };

  const questions = missingFields
    .map((field) => questionMap[field])
    .filter((value): value is string => Boolean(value));

  const prefix =
    language === "hi"
      ? "मुझे यह request तैयार करने से पहले कुछ जानकारी चाहिए:"
      : "I need a few missing details before I can prepare this request:";

  return [prefix, ...questions.map((question) => `- ${question}`)].join("\n");
}

function buildEligiblePosts(posts: Awaited<ReturnType<typeof getFeedPosts>>, donorBloodType: string | null | undefined) {
  if (!donorBloodType || !isBloodType(donorBloodType)) {
    return [] as EligiblePost[];
  }

  return posts
    .filter((post) => post.blood_type_needed && isBloodType(post.blood_type_needed))
    .filter((post) => canDonateToRecipient(donorBloodType, post.blood_type_needed as BloodType))
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      patient_name: post.patient_name,
      blood_type_needed: post.blood_type_needed,
      hospital_name: post.hospital_name,
      city: post.city,
      state: post.state,
      units_needed: post.units_needed,
      required_by: post.required_by ?? null,
      link: `/posts/${post.id}`,
    }));
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ChatbotRequest | null;

  if (!body?.message) {
    return jsonError("Message is required", 422);
  }

  const { profile, hospitalAccount } = await requireServerUser(request);
  const language = resolveLanguage(body.language);
  const persona = resolvePersona(body.persona, profile?.account_type);
  const messages = body.messages ?? [];
  const userMessageCount = body.userMessageCount ?? messages.filter((entry) => entry.role === "user").length;
  const isGuestReminderTurn = persona === "guest" && userMessageCount > 0 && userMessageCount % 3 === 0;

  if (persona === "donor" && (isEligibilityRequest(body.message) || sanitizeText(body.message).includes("eligible posts"))) {
    const donorPosts = await getFeedPosts(profile?.id);
    const eligiblePosts = buildEligiblePosts(donorPosts, profile?.blood_type);

    const reply =
      eligiblePosts.length > 0
        ? formatEligiblePostsReply(eligiblePosts, language)
        : language === "hi"
          ? "Mujhe abhi koi compatible post nahi mila. Aap feed par compatible matches dobara check kar sakte hain."
          : "I couldn't find any compatible posts right now. You can check the compatible matches view again from the feed.";

    return NextResponse.json({
      language,
      languageName: LANGUAGE_NAMES[language],
      persona,
      mode: "eligible_posts",
      reply,
      eligiblePosts,
      reminder: isGuestReminderTurn ? getGuestReminder(language) : null,
    } satisfies ChatbotResponse);
  }

  if (persona === "hospital" && isHospitalDraftRequest(body.message, body.draftState)) {
    const hospitalDefaults: Partial<CreatePostInput> = {
      hospital_name: hospitalAccount?.hospital_name ?? profile?.full_name ?? undefined,
      hospital_address: hospitalAccount?.address ?? undefined,
      city: hospitalAccount?.city ?? profile?.city ?? undefined,
      state: hospitalAccount?.state ?? profile?.state ?? undefined,
      contact_name: hospitalAccount?.contact_person_name ?? profile?.full_name ?? undefined,
      contact_phone: hospitalAccount?.official_contact_phone ?? profile?.phone ?? undefined,
      contact_email: hospitalAccount?.official_contact_email ?? profile?.email ?? undefined,
      initial_radius_km: 25,
    };

    if (!hospitalAccount) {
      return NextResponse.json({
        language,
        languageName: LANGUAGE_NAMES[language],
        persona,
        mode: "hospital_draft",
        reply:
          language === "hi"
            ? "Mujhe aapka hospital account setup complete nahi dikh raha. Please settings complete karke phir try karein."
            : "Your hospital account setup looks incomplete. Please complete hospital registration in settings first.",
        draftState: {
          values: hospitalDefaults,
          missingFields: ["hospital account details"],
          questions: ["Please complete hospital registration in Settings before creating a request."],
          readyForReview: false,
          summary: "Hospital account details are incomplete.",
          blockedReason: "Hospital details are incomplete.",
        },
      } satisfies ChatbotResponse);
    }

    if (hospitalAccount.verification_status !== "verified") {
      return NextResponse.json({
        language,
        languageName: LANGUAGE_NAMES[language],
        persona,
        mode: "hospital_draft",
        reply:
          language === "hi"
            ? "Main draft banane mein madad kar sakta hoon, lekin post sirf verified hospital accounts se publish ho sakta hai. Pehle verification complete karein."
            : "I can help draft the request, but publishing is blocked until this hospital account is verified.",
        draftState: {
          values: hospitalDefaults,
          missingFields: ["hospital verification"],
          questions: ["Please finish hospital verification before publishing this request."],
          readyForReview: false,
          summary: "Drafting is allowed, but publishing is blocked until verification is complete.",
          blockedReason: "Only verified hospital accounts can create blood requests.",
        },
      } satisfies ChatbotResponse);
    }

    const extractedDraft =
      (await extractHospitalDraft({
        message: body.message,
        language,
        messages,
        currentDraft: body.draftState,
        hospitalDefaults,
      })) ?? null;

    const mergedValues = {
      ...(body.draftState?.values ?? {}),
      ...hospitalDefaults,
      ...(extractedDraft?.values ?? {}),
    };

    const normalizedDraft = {
      ...mergedValues,
      patient_name: typeof mergedValues.patient_name === "string" ? mergedValues.patient_name : "",
      patient_id: typeof mergedValues.patient_id === "string" ? mergedValues.patient_id : "",
      blood_type_needed:
        typeof mergedValues.blood_type_needed === "string" && isBloodType(mergedValues.blood_type_needed)
          ? mergedValues.blood_type_needed
          : undefined,
      units_needed:
        typeof mergedValues.units_needed === "number" && Number.isFinite(mergedValues.units_needed)
          ? mergedValues.units_needed
          : undefined,
      contact_name: typeof mergedValues.contact_name === "string" ? mergedValues.contact_name : "",
      contact_phone: typeof mergedValues.contact_phone === "string" ? mergedValues.contact_phone : "",
      contact_email: typeof mergedValues.contact_email === "string" ? mergedValues.contact_email : "",
      medical_condition: typeof mergedValues.medical_condition === "string" ? mergedValues.medical_condition : "",
      required_by: typeof mergedValues.required_by === "string" ? mergedValues.required_by : "",
      initial_radius_km:
        typeof mergedValues.initial_radius_km === "number" && Number.isFinite(mergedValues.initial_radius_km)
          ? mergedValues.initial_radius_km
          : 25,
    };

    const validation = createPostSchema.safeParse(normalizedDraft);
    const missingFields = validation.success
      ? []
      : validation.error.issues
          .map((issue) => issue.path[0])
          .filter((field): field is string => typeof field === "string");

    const readyForReview = validation.success;
    const summary =
      extractedDraft?.summary ||
      (readyForReview
        ? `Patient ${normalizedDraft.patient_name} needs ${normalizedDraft.blood_type_needed} blood, ${normalizedDraft.units_needed} unit${
            normalizedDraft.units_needed === 1 ? "" : "s"
          }, required by ${normalizedDraft.required_by}.`
        : `I still need ${missingFields.length} detail${missingFields.length === 1 ? "" : "s"} before I can finalize the draft.`);

    const reply =
      extractedDraft?.reply?.trim() ||
      (readyForReview
        ? language === "hi"
          ? "Draft tayyar hai. Neeche review karke post create karein."
          : "The draft is ready. Review it below and create the request when you're ready."
        : buildHospitalFallbackReply(missingFields, language));

    return NextResponse.json({
      language,
      languageName: LANGUAGE_NAMES[language],
      persona,
      mode: "hospital_draft",
      reply,
      draftState: {
        values: normalizedDraft,
        missingFields,
        questions: extractedDraft?.questions?.length
          ? extractedDraft.questions
          : missingFields.map((field) => field.replace(/_/g, " ")),
        readyForReview,
        summary,
        blockedReason: null,
      },
      reminder: isGuestReminderTurn ? getGuestReminder(language) : null,
    } satisfies ChatbotResponse);
  }

  const reply =
    (await getOpenAIReply({
      message: body.message,
      language,
      persona,
      pathname: body.pathname,
      messages,
    })) ?? buildFallbackReply(body.message, language, persona);

  const safeReply = sanitizePersonaReply(reply, language, persona);
  const guestReply = isGuestReminderTurn ? `${safeReply}\n\n${getGuestReminder(language)}` : safeReply;

  return NextResponse.json({
    language,
    languageName: LANGUAGE_NAMES[language],
    persona,
    mode: "general",
    reply: guestReply,
    reminder: isGuestReminderTurn ? getGuestReminder(language) : null,
  } satisfies ChatbotResponse);
}
