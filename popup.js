// popup.js
let currentMode = 'keyword';

// Update current mode when radio buttons change
document.querySelectorAll('input[name="searchMode"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentMode = e.target.value;
  });
});

// Search functionality
document.getElementById("searchButton").addEventListener("click", async () => {
  const query = document.getElementById("searchQuery").value.trim();
  if (!query) return;
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const resultsDiv = document.getElementById('results');
  
  // Show loading state
  resultsDiv.style.display = 'block';
  resultsDiv.innerHTML = `Searching ${currentMode === 'semantic' ? 'semantically' : 'for keywords'}...`;

  chrome.tabs.sendMessage(
    tab.id,
    { 
      action: "highlightSearch", 
      query: query,
      mode: currentMode
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌", chrome.runtime.lastError.message);
        resultsDiv.innerHTML = `<span style="color: red;">Error: ${chrome.runtime.lastError.message}</span>`;
      } else {
        const indicator = response.mode === 'semantic' ? 'semantic-indicator' : 'keyword-indicator';
        const modeText = response.mode === 'semantic' ? 'semantic' : 'keyword';
        
        resultsDiv.innerHTML = `
          <span class="${indicator}">
            Found ${response.count} ${modeText} matches
          </span>
          ${response.count > 0 ? '<br>Use ↑↓ to navigate' : ''}
        `;
        
        console.log("✅ Matches:", response.count, "Mode:", response.mode);
      }
    }
  );
});

// Navigation buttons
document.getElementById("nextBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "nextMatch" });
});

document.getElementById("prevBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "prevMatch" });
});

// Clear button
document.getElementById("clearBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "clearHighlights" });
  
  const resultsDiv = document.getElementById('results');
  resultsDiv.style.display = 'none';
  document.getElementById("searchQuery").value = '';
});

// Enter key support
document.getElementById("searchQuery").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("searchButton").click();
  }
});

// Focus search input on popup open
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("searchQuery").focus();
});
