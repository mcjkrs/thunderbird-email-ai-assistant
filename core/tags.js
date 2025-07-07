import {DEFAULTS, HARDCODED_TAGS, TAG_KEY_PREFIX, TAG_NAME_PREFIX} from "./config";

export async function ensureTagsExist() {
    try {
        const allTags = await messenger.messages.tags.list();
        const { customTags } = await messenger.storage.local.get({ customTags: DEFAULTS.customTags });
        const tagsToEnsure = [...Object.values(HARDCODED_TAGS), ...customTags];

        for (const tagToCreate of tagsToEnsure) {
            // Check if any existing tag matches either the key or the name.
            const alreadyExists = allTags.some(existingTag => {
                    // console.log(existingTag);
                    // console.log(`Check: ${existingTag.key} === ${tagToCreate.key} || ${existingTag.name} === ${tagToCreate.name}`)
                    return existingTag.key === (TAG_KEY_PREFIX + tagToCreate.key) || existingTag.tag === (TAG_NAME_PREFIX + tagToCreate.name);
                }
            );

            if (alreadyExists) {
                console.log(`Tag with key "${tagToCreate.key}" or name "${tagToCreate.name}" already exists. Skipping.`);
                continue;
            }

            // If we reach here, it is safe to create the tag.
            console.log(`Spam-Filter Extension: Creating new tag: ${tagToCreate.name}`);
            await messenger.messages.tags.create(TAG_KEY_PREFIX + tagToCreate.key, TAG_NAME_PREFIX + tagToCreate.name, tagToCreate.color);
        }
    } catch (error) {
        // This catch block will now only be hit for unexpected errors, not simple existence checks.
        console.error("Spam-Filter Extension: Error during tag creation:", error);
    }
}
