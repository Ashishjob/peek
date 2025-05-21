/******/ (() => { // webpackBootstrap
/*!**********************!*\
  !*** ./src/popup.js ***!
  \**********************/
document.addEventListener('DOMContentLoaded', function () {
  var searchInput = document.getElementById('search-input');
  var searchButton = document.getElementById('search-button');
  var thresholdSlider = document.getElementById('threshold-slider');
  var thresholdValue = document.getElementById('threshold-value');
  var resultsCount = document.getElementById('results-count');
  var resultsList = document.getElementById('results-list');
  var statusMessage = document.getElementById('status-message');
  var settingsButton = document.getElementById('settings-button');
  var upgradeLink = document.getElementById('upgrade-link');

  // Update threshold value display when slider changes
  thresholdSlider.addEventListener('input', function () {
    var value = parseFloat(thresholdSlider.value / 100).toFixed(1);
    thresholdValue.textContent = value;
  });

  // Handle search button click
  searchButton.addEventListener('click', function () {
    performSearch();
  });

  // Handle enter key press in search input
  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Handle settings button click
  settingsButton.addEventListener('click', function () {
    // To be implemented - open settings page
    setStatusMessage('Settings feature coming soon!');
  });

  // Handle upgrade link click
  upgradeLink.addEventListener('click', function (e) {
    e.preventDefault();
    // To be implemented - open upgrade page
    setStatusMessage('Upgrade feature coming soon!');
  });

  // Function to perform search
  function performSearch() {
    var query = searchInput.value.trim();
    if (!query) {
      setStatusMessage('Please enter a search query');
      return;
    }
    setStatusMessage('Searching...');

    // Get the current threshold value from the slider
    var threshold = parseFloat(thresholdSlider.value / 100);

    // Send search request to content script
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'performSearch',
        query: query,
        threshold: threshold
      }, function (response) {
        if (chrome.runtime.lastError) {
          // Handle errors (e.g., if content script isn't loaded)
          setStatusMessage('Error: Could not connect to page. Try refreshing.');
          return;
        }
        displayResults(response);
      });
    });
  }

  // Function to display search results
  function displayResults(response) {
    // Clear previous results
    resultsList.innerHTML = '';
    if (!response || !response.results || response.results.length === 0) {
      resultsCount.textContent = 'No results found';
      setStatusMessage('');
      return;
    }
    resultsCount.textContent = "Found ".concat(response.results.length, " results");

    // Display each result
    response.results.forEach(function (result, index) {
      var resultItem = document.createElement('div');
      resultItem.className = 'result-item';

      // Create result text element
      var resultText = document.createElement('div');
      resultText.className = 'result-text';
      resultText.textContent = truncateText(result.text, 100);

      // Create result similarity score element
      var resultScore = document.createElement('div');
      resultScore.className = 'result-score';
      resultScore.textContent = "Match: ".concat((result.similarity * 100).toFixed(1), "%");

      // Add elements to result item
      resultItem.appendChild(resultText);
      resultItem.appendChild(resultScore);

      // Add click handler to scroll to this result on the page
      resultItem.addEventListener('click', function () {
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'scrollToResult',
            index: result.index
          });
        });
      });
      resultsList.appendChild(resultItem);
    });
    setStatusMessage('');
  }

  // Utility function to truncate text with ellipsis
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Function to set status message
  function setStatusMessage(message) {
    statusMessage.textContent = message;
  }

  // Check tier status when popup opens
  function checkTierStatus() {
    chrome.storage.local.get(['tierStatus'], function (data) {
      var tierBadge = document.getElementById('tier-badge');
      if (data.tierStatus === 'premium') {
        tierBadge.textContent = 'Premium Tier';
        tierBadge.className = 'premium';
        upgradeLink.style.display = 'none';
      } else {
        tierBadge.textContent = 'Free Tier';
        tierBadge.className = 'free';
      }
    });
  }

  // Initialize
  checkTierStatus();
  setStatusMessage('Ready to search');
});
/******/ })()
;
//# sourceMappingURL=popup.js.map