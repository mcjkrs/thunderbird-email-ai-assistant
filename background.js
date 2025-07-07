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

console.log("Spam-Filter Extension: Setting up onNewMailReceived handler");

messenger.messages.onNewMailReceived.addListener(async (folder, messages) => {
  console.log("Spam-Filter Extension: New messages, yey!");

  for (const message of messages.messages) {
    try {
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
        continue;
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
      console.log("Spam-Filter Extension: Analysis complete, tagging...", tagSet);

      await messenger.messages.update(message.id, { tags: Array.from(tagSet) });
    } catch (error) {
      console.error("Error processing message ID:", message.id, error);
    }
  }
});

// Initialize
ensureTagsExist();