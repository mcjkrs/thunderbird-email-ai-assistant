import {DEFAULTS, HARDCODED_TAGS, TAG_KEY_PREFIX, TAG_NAME_PREFIX} from './core/config.js';
import { findEmailParts } from './core/analysis.js';
import { PROVIDER_ENGINES } from './providers';
import {ensureTagsExist} from "./core/tags";

console.log("Spam-Filter Extension: Background script loaded.");

async function analyzeEmail(structuredData) {
  const settings = await messenger.storage.local.get(DEFAULTS);
  const engine = PROVIDER_ENGINES[settings.provider];

  if (engine) {
    // Pass both general settings and custom tags to the engine
    console.log(`Using ${settings.provider}`);
    return await engine(settings, structuredData, settings.customTags);
  } else {
    console.error(`No analysis engine found for provider: ${settings.provider}`);
    return null;
  }
}

async function processMessage(message) {
  const fullMessage = await messenger.messages.getFull(message.id);
  const { body, attachments } = findEmailParts(fullMessage.parts);

  const structuredData = {
    headers: fullMessage.headers,
    body: body,
    attachments: attachments
  };

  const analysis = await analyzeEmail(structuredData);

  if (!analysis) {
    console.log("Skipping tagging due to analysis failure for ID:", message.id);
    return;
  }

  const { customTags } = await messenger.storage.local.get({ customTags: DEFAULTS.customTags });
  const messageDetails = await messenger.messages.get(message.id);
  const tagSet = new Set(messageDetails.tags || []);

  // Handle hardcoded tags
  if (analysis.is_scam || analysis.spf_pass === false || analysis.dkim_pass === false) tagSet.add(HARDCODED_TAGS.is_scam.key);
  if (analysis.spf_pass === false) tagSet.add(HARDCODED_TAGS.spf_fail.key);
  if (analysis.dkim_pass === false) tagSet.add(HARDCODED_TAGS.dkim_fail.key);

  // Handle dynamic custom tags
  for (const tag of customTags) {
    if (analysis[tag.key] === true) {
      tagSet.add(TAG_KEY_PREFIX + tag.key);
    }
  }
  tagSet.add(TAG_KEY_PREFIX + HARDCODED_TAGS.tagged);
  console.log("Email Assistant: Analysis complete, tagging...", tagSet);

  await messenger.messages.update(message.id, { tags: Array.from(tagSet) });
}

// Trigger on new mail
console.log("Email Assistant: Setting up onNewMailReceived handler");

messenger.messages.onNewMailReceived.addListener(async (folder, messages) => {
  console.log("Email Assistant: New messages received");
  for (const message of messages.messages) {
    try {
      await processMessage(message);
    } catch (error) {
      console.error("Error processing message ID:", message.id, error);
    }
  }
});

// Context menu for manual trigger
messenger.menus.create({
  id: "analyze-email",
  title: "Analyze with Email Assistant",
  contexts: ["message_list"],
});

messenger.menus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== "analyze-email") return;

  const selectedMessages = info.selectedMessages;
  if (!selectedMessages || selectedMessages.messages.length === 0) return;

  console.log(`Email Assistant: Manually analyzing ${selectedMessages.messages.length} message(s)`);
  for (const message of selectedMessages.messages) {
    try {
      await processMessage(message);
    } catch (error) {
      console.error("Error processing message ID:", message.id, error);
    }
  }
});

// Initialize
ensureTagsExist();