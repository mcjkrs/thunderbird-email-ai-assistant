export const TAG_KEY_PREFIX = "_ma_";
export const TAG_NAME_PREFIX = "A:";

export const HARDCODED_TAGS = {
  is_scam: { key: "is_scam", name: "Scam Alert", color: "#FF5722" },
  spf_fail: { key: "spf_fail", name: "SPF Fail", color: "#E91E63" },
  dkim_fail: { key: "dkim_fail", name: "DKIM Fail", color: "#E91E63" },
  tagged: { key: "tagged", name: "Tagged", color: "#4f4f4f" }
};

export const DEFAULT_CUSTOM_TAGS = [
  {
    key: "is_advertise",
    name: "Advertisement",
    color: "#FFC107",
    prompt: "check if email is advertising something and contains an offer or someone is asking for contact to show the offer"
  },
  {
    key: "is_business_approach",
    name: "Business Ad",
    color: "#2196F3",
    prompt: "check if email is a cold marketing/sales/business approach (or next message in the approach process where sender reply to self to refresh the approach in the mailbox). Consider typical sales and lead generation scenarios."
  },
  {
    key: "is_personal",
    name: "Personal",
    color: "#4CAF50",
    prompt: "check if this is non-sales scenario approach from someone who likes to contact in a non-business context."
  },
  {
    key: "is_business",
    name: "Business",
    color: "#af4c87",
    prompt: "check if this looks like work related email"
  },
  {
    key: "is_service_important",
    name: "Service Important",
    color: "#F44336",
    prompt: "check if email contains important information related to already subscribed service (if this is subscription offer - ignore it): bill, password reset, login link, 2fa code, expiration notice. Consider common services like electricity, bank account, netflix, or similar subscription service."
  },
  {
    key: "is_service_not_important",
    name: "Service Info",
    color: "#9E9E9E",
    prompt: "check if email contains non critical information from already subscribed service (if this is subscription offer - ignore it) - like: daily posts update from linkedin, AWS invitation for conference, cross sale, tips how to use product, surveys, new offers"
  },
  {
    key: "is_bill",
    name: "Bill",
    color: "#f4b136",
    prompt: "check if email contains bill or invoice information."
  },

  {
    key: "has_calendar_invite",
    name: "Appointment",
    color: "#7F07f2",
    prompt: "check if the mail has invitation to the call or meeting (with calendar appointment attached)"
  }
];

export const DEFAULTS = {
  provider: 'ollama',
  ollamaApiUrl: 'http://localhost:11434/api/generate',
  ollamaModel: 'gemma3:27b',
  openaiApiKey: '',
  geminiApiKey: '',
  claudeApiKey: '',
  mistralApiKey: '',
  deepseekApiKey: '',
  customTags: DEFAULT_CUSTOM_TAGS
};

export const PROMPT_BASE = [
  'Hi, I like you to check and score an email based on the following structured data. Please respond as a single, clean JSON object with the specified properties.',
  '',
  '### Email Headers',
  '```json',
  '{headers}',
  '```',
  '',
  '### Email Body (converted from HTML to plain text)',
  '```text',
  '{body}',
  '```',
  '',
  '### Attachments',
  '```json',
  '{attachments}',
  '```',
  '',
  '### INSTRUCTIONS',
  'Based on the data above, please populate the following JSON object:',
  '- sender: simply extract \'from\'',
  '- sender_consistent: check if from fields is consistent with headers and is not trying to spool identity',
  '- spf_pass: (boolean) check if there is positive verification in spf headers (leave null if no information is available or for spf-soft fail with ~all)',
  '- dkim_pass: (boolean) check if there is positive verification in dkim headers (leave null if no information is available)',
  '- is_scam: (boolean) check if the mail sounds like a scam'
].join('\n');

export const CONTEXT_TOKEN_LIMIT = 128000;
export const CHARS_PER_TOKEN_ESTIMATE = 4;
export const CONTEXT_CHAR_LIMIT = CONTEXT_TOKEN_LIMIT * CHARS_PER_TOKEN_ESTIMATE;
