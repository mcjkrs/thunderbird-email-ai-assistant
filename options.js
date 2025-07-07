import { DEFAULTS } from './core/config.js';
import {ensureTagsExist} from "./core/tags";

document.addEventListener('DOMContentLoaded', async () => {
  // --- General Settings Elements ---
  const providerSelect = document.getElementById('provider');
  const generalForm = document.getElementById('general-options-form');
  const generalStatusMessage = document.getElementById('general-status-message');
  const statusMessage = document.getElementById('general-status-message');

  // --- Tag Management Elements ---
  const tagListContainer = document.getElementById('tag-list-container');
  const modal = document.getElementById('tag-modal');
  const modalTitle = document.getElementById('modal-title');
  const tagForm = document.getElementById('tag-form');
  const closeModalBtn = document.querySelector('.close-button');
  const addNewTagBtn = document.getElementById('add-new-tag-btn');
  
  let currentCustomTags = [];

  // --- Tab Logic ---
  const tabs = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      tabContents.forEach(c => c.classList.remove('active'));
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // --- General Settings Logic ---
  function showRelevantSettings(provider) {
    document.querySelectorAll('.provider-settings').forEach(div => div.style.display = 'none');
    const settingsToShow = document.getElementById(`${provider}-settings`);
    if (settingsToShow) settingsToShow.style.display = 'block';
  }

  async function loadGeneralSettings() {
    const settings = await messenger.storage.local.get(DEFAULTS);

    providerSelect.value = settings.provider;
    if(document.getElementById('ollama-api-url'))
      document.getElementById('ollama-api-url').value = settings.ollamaApiUrl;
    if(document.getElementById('ollama-model'))
      document.getElementById('ollama-model').value = settings.ollamaModel;
    if(document.getElementById('openai-api-key'))
      document.getElementById('openai-api-key').value = settings.openaiApiKey;
    if(document.getElementById('gemini-api-key'))
      document.getElementById('gemini-api-key').value = settings.geminiApiKey;
    if(document.getElementById('claude-api-key'))
      document.getElementById('claude-api-key').value = settings.claudeApiKey;
    if(document.getElementById('mistral-api-key'))
      document.getElementById('mistral-api-key').value = settings.mistralApiKey;
    if(document.getElementById('deepseek-api-key'))
      document.getElementById('deepseek-api-key').value = settings.deepseekApiKey;
    showRelevantSettings(settings.provider);
  }

  generalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const provider = providerSelect.value;
    const settingsToSave = { provider };
    let permissionGranted = true;
    let permissionOrigin = '';

    // Gather data from the visible form
    switch (provider) {
      case 'ollama':
        settingsToSave.ollamaApiUrl = document.getElementById('ollama-api-url').value.trim();
        settingsToSave.ollamaModel = document.getElementById('ollama-model').value.trim();
        permissionOrigin = new URL(settingsToSave.ollamaApiUrl).origin + "/*";
        break;
      case 'openai':
        settingsToSave.openaiApiKey = document.getElementById('openai-api-key').value.trim();
        permissionOrigin = 'https://api.openai.com/';
        break;
      case 'gemini':
        settingsToSave.geminiApiKey = document.getElementById('gemini-api-key').value.trim();
        permissionOrigin = 'https://generativelanguage.googleapis.com/';
        break;
      case 'claude':
        settingsToSave.claudeApiKey = document.getElementById('claude-api-key').value.trim();
        permissionOrigin = 'https://api.anthropic.com/';
        break;
      case 'mistral':
        settingsToSave.mistralApiKey = document.getElementById('mistral-api-key').value.trim();
        permissionOrigin = 'https://api.mistral.ai/';
        break;
      case 'deepseek':
        settingsToSave.deepseekApiKey = document.getElementById('deepseek-api-key').value.trim();
        permissionOrigin = 'https://api.deepseek.com/';
        break;
    }

    // Request permission if an API key or URL is set
    if (Object.values(settingsToSave).some(val => val)) {
      try {
        permissionGranted = await messenger.permissions.request({ origins: [permissionOrigin] });
      } catch (e) {
        console.error("Error requesting permission:", e);
        statusMessage.textContent = 'Error with permission request.';
        permissionGranted = false;
      }
    }

    if (permissionGranted) {
      try {
        await messenger.storage.local.set(settingsToSave);
        statusMessage.textContent = 'Settings saved!';
        setTimeout(() => { statusMessage.textContent = ''; }, 3000);
      } catch (e) {
        console.error("Error saving settings:", e);
        statusMessage.textContent = 'Error saving settings.';
      }
    } else {
      statusMessage.textContent = 'Permission denied. Settings not saved.';
    }


    generalStatusMessage.textContent = 'General settings saved!';
    setTimeout(() => { generalStatusMessage.textContent = ''; }, 3000);
  });
  
  providerSelect.addEventListener('change', (e) => showRelevantSettings(e.target.value));

  // --- Tag Management Logic ---
  function renderTagList() {
    ensureTagsExist().then(() => {
      tagListContainer.innerHTML = '';
      currentCustomTags.forEach((tag, index) => {
        const item = document.createElement('div');
        item.className = 'tag-item';
        item.innerHTML = `
          <div class="tag-color-preview" style="background-color: ${tag.color};"></div>
          <div class="tag-details">
            <div class="tag-name">${tag.name}</div>
            <div class="tag-key">Key: ${tag.key}</div>
            <div class="tag-prompt">Prompt: ${tag.prompt}</div>
          </div>
          <div class="tag-actions">
            <button class="edit-tag-btn" data-index="${index}">Edit</button>
            <button class="delete-tag-btn" data-index="${index}">Delete</button>
          </div>
        `;
        tagListContainer.appendChild(item);
      });
    });
  }

  async function loadCustomTags() {
    const { customTags } = await messenger.storage.local.get({ customTags: DEFAULTS.customTags });
    currentCustomTags = customTags;
    renderTagList();
  }

  async function saveCustomTags() {
    await messenger.storage.local.set({ customTags: currentCustomTags });
    renderTagList();
  }

  function openModal(tag = null, index = -1) {
    tagForm.reset();
    document.getElementById('tag-index').value = index;
    if (tag) {
      modalTitle.textContent = 'Edit Tag';
      document.getElementById('tag-name').value = tag.name;
      document.getElementById('tag-key').value = tag.key;
      document.getElementById('tag-color').value = tag.color;
      document.getElementById('tag-prompt').value = tag.prompt;
    } else {
      modalTitle.textContent = 'Add New Tag';
    }
    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  addNewTagBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  tagListContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-tag-btn')) {
      const index = parseInt(e.target.dataset.index, 10);
      openModal(currentCustomTags[index], index);
    }
    if (e.target.classList.contains('delete-tag-btn')) {
      const index = parseInt(e.target.dataset.index, 10);
      if (confirm(`Are you sure you want to delete the "${currentCustomTags[index].name}" tag?`)) {
        currentCustomTags.splice(index, 1);
        saveCustomTags();
      }
    }
  });

  tagForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const index = parseInt(document.getElementById('tag-index').value, 10);
    const key = document.getElementById('tag-key').value.trim();
    
    const isDuplicate = currentCustomTags.some((tag, i) => tag.key === key && i !== index);
    if (isDuplicate) {
      alert('Error: Tag key must be unique.');
      return;
    }

    const newTag = {
      name: document.getElementById('tag-name').value.trim(),
      key: key,
      color: document.getElementById('tag-color').value,
      prompt: document.getElementById('tag-prompt').value.trim(),
    };

    if (index === -1) { // Add new
      currentCustomTags.push(newTag);
    } else { // Update existing
      currentCustomTags[index] = newTag;
    }
    
    saveCustomTags();
    closeModal();
  });

  // --- Initial Load ---
  loadGeneralSettings();
  loadCustomTags();
});