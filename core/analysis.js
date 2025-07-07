import { htmlToText } from "html-to-text";
import { PROMPT_BASE, CONTEXT_CHAR_LIMIT } from './config.js';

export function findEmailParts(parts) {
  let textBody = '';
  let htmlBody = '';
  const attachments = [];
  console.log("Parsing...");

  function recurse(part) {
    if (part.parts) {
      part.parts.forEach(recurse);
      return;
    }
    if (part.contentType === 'text/plain' && !part.isAttachment) {
      textBody = part.body;
    } else if (part.contentType === 'text/html' && !part.isAttachment) {
      htmlBody = part.body;
    } else if (part.isAttachment || part.name) {
      attachments.push({
        name: part.name,
        mimeType: part.contentType,
        size: part.size
      });
    }
  }

  parts.forEach(recurse);
  
  let finalBody = textBody;
  if (htmlBody) {
      finalBody = htmlToText(htmlBody, { wordwrap: 130 });
  }
  
  return { body: finalBody, attachments };
}

export function buildPrompt(structuredData, customTags) {
    const headersJSON = JSON.stringify(structuredData.headers, null, 2);
    const attachmentsJSON = JSON.stringify(structuredData.attachments, null, 2);

    const customInstructions = customTags.map(tag => `- ${tag.key}: (boolean) ${tag.prompt}`).join('\n');
    const fullInstructions = `${PROMPT_BASE}\n${customInstructions}`;

    const frameSize = fullInstructions
        .replace('{headers}', headersJSON)
        .replace('{body}', '')
        .replace('{attachments}', attachmentsJSON)
        .length;

    const maxBodyLength = CONTEXT_CHAR_LIMIT - frameSize;
    let emailBody = structuredData.body;

    if (emailBody.length > maxBodyLength) {
        console.warn(`Spam-Filter Extension: Body length (${emailBody.length}) exceeds remaining space (${maxBodyLength}). Truncating.`);
        emailBody = emailBody.substring(0, maxBodyLength);
    }

    const finalPrompt = fullInstructions
        .replace('{headers}', headersJSON)
        .replace('{body}', emailBody)
        .replace('{attachments}', attachmentsJSON);
    
    if (finalPrompt.length > CONTEXT_CHAR_LIMIT) {
        console.error("Spam-Filter Extension: Final prompt still too long. Hard cutting.");
        return finalPrompt.substring(0, CONTEXT_CHAR_LIMIT);
    }

    return finalPrompt;
}