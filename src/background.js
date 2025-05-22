// Background service worker for peek Semantic Search extension

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "open_semantic_search") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "triggerSemanticSearchShortcut"
      });
    });
  }
});


// Handle messages from popup or content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Background received message:', request.action);
  
  switch(request.action) {
    case 'checkTier':
      // Check user's subscription tier
      checkUserTier(sendResponse);
      return true; // Keep the message channel open for the async response
      
    case 'updateSettings':
      // Update user settings
      updateSettings(request.settings, sendResponse);
      return false; // No async response needed
      
    case 'getSettings':
      // Retrieve user settings
      getSettings(sendResponse);
      return true; // Keep the message channel open for the async response
  }
});

// Function to check user's tier (free vs premium)
function checkUserTier(sendResponse) {
  // For now, we'll just return the stored tier value
  // In a real implementation, this would verify with a backend service
  chrome.storage.local.get(['tierStatus'], function(data) {
    sendResponse({ tier: data.tierStatus || 'free' });
  });
}

// Function to update user settings
function updateSettings(settings, sendResponse) {
  chrome.storage.local.set(settings, function() {
    console.log('Settings updated:', settings);
    if (sendResponse) {
      sendResponse({ success: true });
    }
  });
}

// Function to retrieve user settings
function getSettings(sendResponse) {
  chrome.storage.local.get(null, function(data) {
    sendResponse(data);
  });
}

chrome.runtime.onInstalled.addListener(function() {
  console.log('peek Semantic Search extension installed');

  // Set default extension settings
  chrome.storage.local.set({
    tierStatus: 'free',
    searchThreshold: 0.7,
    highlightColor: '#FFFF00',
    isEnabled: true,
    searchHistory: []
  }, function() {
    console.log('Default settings initialized');
  });

  // Create context menu
  chrome.contextMenus.create({
    id: 'searchSelection',
    title: 'Search with peek',
    contexts: ['selection']
  });
});


// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'searchSelection') {
    // Get the selected text
    const selectedText = info.selectionText;
    
    // Send message to content script to perform search
    chrome.tabs.sendMessage(tab.id, {
      action: 'performSearch',
      query: selectedText,
      threshold: 0.7 // Default threshold
    });
  }
});
