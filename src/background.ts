/// <reference types="chrome"/>

import { DEBUG } from './debug/debug';

// Message types
interface Message {
  type: string;
  url?: string;
}

// Helper function to check if a tab is ready for messaging
async function isTabReady(tabId: number): Promise<boolean> {
  try {
    DEBUG('Checking if tab is ready:', tabId);
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    DEBUG('Tab is ready:', tabId);
    return true;
  } catch (error) {
    DEBUG('Tab not ready:', tabId, error);
    return false;
  }
}

// Helper function to wait for tab to be ready
async function waitForTab(tabId: number, maxAttempts: number = 10): Promise<boolean> {
  DEBUG('Waiting for tab to be ready:', tabId);
  for (let i = 0; i < maxAttempts; i++) {
    DEBUG(`Attempt ${i + 1}/${maxAttempts} for tab ${tabId}`);
    if (await isTabReady(tabId)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

// Helper function to check if URL is a PDF
async function isPDF(url: string): Promise<boolean> {
  try {
    // Skip chrome:// URLs
    if (url.startsWith('chrome://')) {
      return false;
    }

    // First check URL pattern
    if (url.toLowerCase().endsWith('.pdf')) {
      return true;
    }

    // Then try content type check
    const response = await fetch(url, {
      method: 'HEAD',
      credentials: 'include'
    });
    const contentType = response.headers.get('content-type');
    return contentType?.toLowerCase().includes('application/pdf') || false;
  } catch (error) {
    DEBUG.error('Error checking content type:', error);
    return false;
  }
}

// Helper function to inject content script
async function injectContentScript(tabId: number): Promise<boolean> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    DEBUG('Content script injected successfully');
    return true;
  } catch (error) {
    DEBUG.error('Error injecting content script:', error);
    return false;
  }
}

// Helper function to notify content script about PDF
async function notifyPDFLoaded(tabId: number, url: string): Promise<void> {
  DEBUG('Notifying content script about PDF:', url);
  try {
    const isReady = await waitForTab(tabId);
    if (isReady) {
      await chrome.tabs.sendMessage(tabId, {
        type: 'PDF_LOADED',
        url: url
      } as Message);
      DEBUG('PDF_LOADED message sent successfully');
    } else {
      DEBUG.error('Content script not ready after maximum attempts');
    }
  } catch (error) {
    DEBUG.error('Error notifying content script:', error);
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      // Check if this is a PDF
      const isPdfFile = await isPDF(tab.url);
      if (!isPdfFile) return;

      DEBUG('PDF tab updated:', tabId, tab.url);

      // Try to inject content script
      const injected = await injectContentScript(tabId);
      if (injected) {
        await notifyPDFLoaded(tabId, tab.url);
      }
    } catch (error) {
      DEBUG.error('Error handling tab update:', error);
    }
  }
});

// Listen for navigation completion
chrome.webNavigation.onCompleted.addListener(async (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => {
  try {
    // Skip if not the main frame
    if (details.frameId !== 0) return;

    // Check if this is a PDF
    const isPdfFile = await isPDF(details.url);
    if (isPdfFile) {
      DEBUG('PDF navigation completed:', details.url);
      const injected = await injectContentScript(details.tabId);
      if (injected) {
        await notifyPDFLoaded(details.tabId, details.url);
      }
    }
  } catch (error) {
    DEBUG.error('Error handling navigation:', error);
  }
}, { 
  url: [{ schemes: ['http', 'https', 'file'] }] 
});

// Listen for extension icon clicks
chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  if (tab.id) {
    try {
      const isReady = await isTabReady(tab.id);
      if (isReady) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_KEYWORDS' } as Message);
        DEBUG('Toggled keywords panel');
      } else {
        DEBUG.error('Content script not ready for keyword toggle');
      }
    } catch (error) {
      DEBUG.error('Error toggling keywords:', error);
    }
  }
});