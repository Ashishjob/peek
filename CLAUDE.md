# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Peek is a Chrome extension that provides advanced search functionality with keyword and semantic highlighting for web pages. It supports two search modes:
- **Keyword Search**: Traditional exact text matching with yellow highlighting
- **Semantic Search**: AI-powered meaning-based search with green highlighting

The project consists of:
- A Chrome extension (manifest v3) with background service worker, content script, and popup interface
- A Node.js proxy server for handling Elasticsearch requests with CORS support

## Development Commands

### Install Dependencies
```bash
npm install
```

### Run the Proxy Server
```bash
node server.mjs
```
The proxy server runs on port 3001 by default and is required for Elasticsearch integration.

### Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" toggle
3. Click "Load unpacked" and select the project directory
4. The extension icon will appear in the toolbar

## Architecture

### Chrome Extension Components
- **manifest.json**: Extension configuration with permissions for activeTab, scripting, storage, and host access to localhost:3001, Hugging Face API, and OpenAI API
- **background.js**: Service worker for handling background tasks and managing extension lifecycle
- **content.js**: Injected into web pages for DOM manipulation, text extraction, and highlighting functionality
  - Handles both keyword and semantic search highlighting
  - Manages highlight navigation (previous/next)
  - Extracts page content for semantic analysis
- **popup.html/popup.js**: Extension popup interface
  - Search input field
  - Radio buttons for search mode selection (Keyword/Semantic)
  - Navigation controls (Previous/Next buttons)
  - Clear highlights button
  - Results display with match count

### Backend Server
- **server.mjs**: Express proxy server that:
  - Proxies requests to Elasticsearch cluster at `/es-proxy` endpoint
  - Handles CORS for browser-to-server communication
  - Requires configuration of `ELASTIC_URL` and authentication credentials
  - Accepts POST requests with `path`, `method`, and `body` parameters

### Message Flow
1. User enters search query in popup.js
2. Popup sends message to content.js with action "highlightSearch", query, and mode
3. Content.js processes the search:
   - For keyword search: Uses regex to find exact matches
   - For semantic search: Extracts page content and sends to backend
4. Results are highlighted in the DOM with appropriate styling
5. Navigation controls allow cycling through matches

## Key Configuration

Before using the Elasticsearch features:
1. Update `ELASTIC_URL` in server.mjs:11 with your Elasticsearch cluster URL
2. Update the Basic Auth credentials in server.mjs:12 with your Elasticsearch username and password

## Highlighting Styles
- **Keyword matches**: Yellow background (`mark.peek-highlight`)
- **Semantic matches**: Light green background with dark green left border (`mark.peek-semantic`)

## Dependencies
- Chrome extension APIs (manifest v3)
- Express.js for the proxy server
- CORS support for cross-origin requests
- node-fetch for server-side HTTP requests
- pdfjs-dist for PDF handling capabilities