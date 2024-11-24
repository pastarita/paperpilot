/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/debug/debug.ts":
/*!****************************!*\
  !*** ./src/debug/debug.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEBUG: () => (/* binding */ DEBUG),
/* harmony export */   DebugLevel: () => (/* binding */ DebugLevel),
/* harmony export */   configure: () => (/* binding */ configure),
/* harmony export */   debug: () => (/* binding */ debug),
/* harmony export */   error: () => (/* binding */ error),
/* harmony export */   info: () => (/* binding */ info),
/* harmony export */   setEnabled: () => (/* binding */ setEnabled),
/* harmony export */   setLevel: () => (/* binding */ setLevel),
/* harmony export */   setPrefix: () => (/* binding */ setPrefix),
/* harmony export */   trace: () => (/* binding */ trace),
/* harmony export */   warn: () => (/* binding */ warn)
/* harmony export */ });
/**
 * Debug configuration and utility functions
 */
// Debug levels
var DebugLevel;
(function (DebugLevel) {
    DebugLevel[DebugLevel["ERROR"] = 0] = "ERROR";
    DebugLevel[DebugLevel["WARN"] = 1] = "WARN";
    DebugLevel[DebugLevel["INFO"] = 2] = "INFO";
    DebugLevel[DebugLevel["DEBUG"] = 3] = "DEBUG";
    DebugLevel[DebugLevel["TRACE"] = 4] = "TRACE";
})(DebugLevel || (DebugLevel = {}));
// Default configuration
const config = {
    enabled: true,
    level: DebugLevel.INFO,
    prefix: '[PaperPilot]'
};
/**
 * Log a debug message
 */
function debug(...args) {
    if (!config.enabled || config.level < DebugLevel.DEBUG)
        return;
    console.debug(config.prefix, ...args);
}
/**
 * Log an info message
 */
function info(...args) {
    if (!config.enabled || config.level < DebugLevel.INFO)
        return;
    console.info(config.prefix, ...args);
}
/**
 * Log a warning message
 */
function warn(...args) {
    if (!config.enabled || config.level < DebugLevel.WARN)
        return;
    console.warn(config.prefix, ...args);
}
/**
 * Log an error message
 */
function error(...args) {
    if (!config.enabled || config.level < DebugLevel.ERROR)
        return;
    console.error(config.prefix, ...args);
}
/**
 * Log a trace message
 */
function trace(...args) {
    if (!config.enabled || config.level < DebugLevel.TRACE)
        return;
    console.trace(config.prefix, ...args);
}
/**
 * Configure debug settings
 */
function configure(options) {
    Object.assign(config, options);
}
/**
 * Enable or disable debugging
 */
function setEnabled(enabled) {
    config.enabled = enabled;
}
/**
 * Set debug level
 */
function setLevel(level) {
    config.level = level;
}
/**
 * Set debug prefix
 */
function setPrefix(prefix) {
    config.prefix = prefix;
}
// Export debug configuration
const DEBUG = {
    config,
    debug,
    info,
    warn,
    error,
    trace,
    configure,
    setEnabled,
    setLevel,
    setPrefix,
    DebugLevel
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _debug_debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug/debug */ "./src/debug/debug.ts");
/// <reference types="chrome"/>

// Helper function to check if a tab is ready for messaging
async function isTabReady(tabId) {
    try {
        (0,_debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug)('Checking if tab is ready:', tabId);
        await chrome.tabs.sendMessage(tabId, { type: 'PING' });
        (0,_debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug)('Tab is ready:', tabId);
        return true;
    }
    catch (error) {
        (0,_debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug)('Tab not ready:', tabId, error);
        return false;
    }
}
// Helper function to wait for tab to be ready
async function waitForTab(tabId, maxAttempts = 10) {
    (0,_debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug)('Waiting for tab to be ready:', tabId);
    for (let i = 0; i < maxAttempts; i++) {
        (0,_debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug)(`Attempt ${i + 1}/${maxAttempts} for tab ${tabId}`);
        if (await isTabReady(tabId)) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return false;
}
// Helper function to check if URL is a PDF
async function isPDF(url) {
    // First check URL pattern
    if (url.toLowerCase().endsWith('.pdf')) {
        return true;
    }
    // Then try content type check
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            headers: {
                'Accept': 'application/pdf'
            }
        });
        const contentType = response.headers.get('content-type');
        return contentType?.toLowerCase().includes('application/pdf') || false;
    }
    catch (error) {
        _debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug.error('Error checking content type:', error);
        return false;
    }
}
// Helper function to inject content script
async function injectContentScript(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        });
        (0,_debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug)('Content script injected successfully');
        return true;
    }
    catch (error) {
        _debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug.error('Error injecting content script:', error);
        return false;
    }
}
// Helper function to notify content script about PDF
async function notifyPDFLoaded(tabId, url) {
    (0,_debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug)('Notifying content script about PDF:', url);
    try {
        const isReady = await waitForTab(tabId);
        if (isReady) {
            await chrome.tabs.sendMessage(tabId, {
                type: 'PDF_LOADED',
                url: url
            });
            (0,_debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug)('PDF_LOADED message sent successfully');
        }
        else {
            _debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug.error('Content script not ready after maximum attempts');
        }
    }
    catch (error) {
        _debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug.error('Error notifying content script:', error);
    }
}
// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        try {
            // Check if this is a PDF
            const isPdfFile = await isPDF(tab.url);
            if (!isPdfFile)
                return;
            (0,_debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug)('PDF tab updated:', tabId, tab.url);
            // Try to inject content script
            const injected = await injectContentScript(tabId);
            if (injected) {
                await notifyPDFLoaded(tabId, tab.url);
            }
        }
        catch (error) {
            _debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug.error('Error handling tab update:', error);
        }
    }
});
// Listen for navigation completion
chrome.webNavigation.onCompleted.addListener(async (details) => {
    try {
        // Skip if not the main frame
        if (details.frameId !== 0)
            return;
        // Check if this is a PDF
        const isPdfFile = await isPDF(details.url);
        if (isPdfFile) {
            (0,_debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug)('PDF navigation completed:', details.url);
            const injected = await injectContentScript(details.tabId);
            if (injected) {
                await notifyPDFLoaded(details.tabId, details.url);
            }
        }
    }
    catch (error) {
        _debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug.error('Error handling navigation:', error);
    }
}, {
    url: [{ schemes: ['http', 'https', 'file'] }]
});
// Listen for extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
        try {
            const isReady = await isTabReady(tab.id);
            if (isReady) {
                await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_KEYWORDS' });
                (0,_debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug)('Toggled keywords panel');
            }
            else {
                _debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug.error('Content script not ready for keyword toggle');
            }
        }
        catch (error) {
            _debug_debug__WEBPACK_IMPORTED_MODULE_0__.debug.error('Error toggling keywords:', error);
        }
    }
});

})();

/******/ })()
;
//# sourceMappingURL=background.js.map