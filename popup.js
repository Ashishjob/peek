document.getElementById("searchButton").addEventListener("click", async () => {
  const query = document.getElementById("searchQuery").value;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(
    tab.id,
    { action: "highlightSearch", query },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌", chrome.runtime.lastError.message);
      } else {
        console.log("✅ Matches:", response.count);
      }
    }
  );
});

document.getElementById("nextBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "nextMatch" });
});

document.getElementById("prevBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "prevMatch" });
});
