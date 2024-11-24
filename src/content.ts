/// <reference types="chrome"/>

import { PDFService } from './services/PDFService';
import { KeywordService } from './services/KeywordService';
import { KeywordStore } from './store/KeywordStore';
import { KeywordList } from './components/KeywordList';
import { debug } from './debug/debug';

// Initialize services
const pdfService = new PDFService();
const keywordService = new KeywordService();
const keywordStore = new KeywordStore();
const keywordList = new KeywordList();

// Debug panel element
let debugPanel: HTMLElement | null = null;

// Function to create and append debug panel
function createDebugPanel() {
  if (debugPanel) return;

  debugPanel = document.createElement('div');
  debugPanel.id = 'paperpilot-debug-panel';
  debugPanel.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 10px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    z-index: 9999;
  `;

  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'Show Keywords';
  toggleButton.onclick = () => {
    keywordList.toggleVisibility();
  };

  debugPanel.appendChild(toggleButton);
  document.body.appendChild(debugPanel);
}

// Process PDF and extract keywords
async function processPDF(url: string) {
  try {
    debug('Processing PDF:', url);

    // Extract text from PDF
    const text = await pdfService.extractText(url);
    if (!text) {
      debug('No text extracted from PDF');
      return;
    }

    // Extract keywords
    const keywords = await keywordService.extractKeywords(text);
    if (!keywords || keywords.length === 0) {
      debug('No keywords extracted');
      return;
    }

    // Store keywords
    keywordStore.setKeywords(keywords);

    // Update UI
    keywordList.updateKeywords(keywords);

    debug('Keywords extracted:', keywords);
  } catch (error: unknown) {
    if (error instanceof Error) {
      debug('Error processing PDF:', error.message);
    } else {
      debug('Unknown error processing PDF');
    }
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message: { type: string; url?: string }, sender, sendResponse) => {
  debug('Received message:', message);

  switch (message.type) {
    case 'PING':
      debug('Received PING');
      sendResponse({ status: 'alive' });
      break;

    case 'PDF_LOADED':
      if (message.url) {
        debug('PDF loaded:', message.url);
        createDebugPanel();
        processPDF(message.url).catch((error: unknown) => {
          if (error instanceof Error) {
            debug('Error in PDF_LOADED handler:', error.message);
          } else {
            debug('Unknown error in PDF_LOADED handler');
          }
        });
      }
      break;

    case 'TOGGLE_KEYWORDS':
      debug('Toggling keywords panel');
      keywordList.toggleVisibility();
      break;

    default:
      debug('Unknown message type:', message.type);
  }

  // Return true to indicate async response
  return true;
});