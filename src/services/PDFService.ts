import * as pdfjsLib from 'pdfjs-dist';
import { DEBUG } from '../debug/debug';

interface PDFPage {
  pageNumber: number;
  content: string;
  items: any[];
}

interface PDFContent {
  text: string;
  pages: PDFPage[];
  title?: string;
  metadata?: any;
}

export class PDFService {
  private initialized: boolean = false;
  private document: pdfjsLib.PDFDocumentProxy | null = null;

  constructor() {
    // Don't initialize in constructor - wait for init() call
  }

  async init(workerUrl: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      DEBUG.log('Initializing PDF.js worker with URL:', workerUrl);

      // Ensure worker URL is valid
      if (!workerUrl) {
        throw new Error('Worker URL is required');
      }

      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      // Test worker initialization
      const testPdf = new Uint8Array([
        0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a
      ]); // Empty PDF header

      try {
        await pdfjsLib.getDocument({ data: testPdf }).promise;
        DEBUG.log('PDF.js worker test successful');
      } catch (error) {
        if (error.name === 'InvalidPDFException') {
          // This is actually good - means worker is working but PDF is invalid
          DEBUG.log('PDF.js worker initialized successfully');
        } else {
          throw error;
        }
      }

      this.initialized = true;
    } catch (error) {
      DEBUG.error('Failed to initialize PDF.js worker:', error);
      throw error;
    }
  }

  async parsePDF(url: string): Promise<PDFContent> {
    if (!this.initialized) {
      throw new Error('PDFService not initialized. Call init() first.');
    }

    try {
      DEBUG.log('Starting PDF parse:', url);
      let pdfData: string | ArrayBuffer = url;

      // Handle local files
      if (url.startsWith('file://')) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          pdfData = await response.arrayBuffer();
          DEBUG.log('Successfully loaded local PDF file');
        } catch (error) {
          DEBUG.error('Error loading local PDF:', error);
          throw new Error(`Unable to load local PDF file: ${error.message}`);
        }
      }

      // Load the PDF document with improved options
      DEBUG.log('Creating PDF document with options');
      const loadingTask = pdfjsLib.getDocument({
        url: pdfData,
        cMapUrl: chrome.runtime.getURL('cmaps/'),
        cMapPacked: true,
        standardFontDataUrl: chrome.runtime.getURL('standard_fonts/'),
      });

      this.document = await loadingTask.promise;
      DEBUG.log('PDF document loaded successfully, pages:', this.document.numPages);

      // Get document metadata
      const metadata = await this.document.getMetadata();
      const info = metadata.info;

      // Extract text from each page
      const pages: PDFPage[] = [];
      let fullText = '';

      for (let i = 1; i <= this.document.numPages; i++) {
        const page = await this.document.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text items and their positions
        const items = textContent.items;
        const pageText = items.map(item => item.str).join(' ');
        
        fullText += pageText + '\n';
        pages.push({
          pageNumber: i,
          content: pageText,
          items: items
        });

        // Clean up page object
        page.cleanup();
      }

      return {
        text: fullText,
        pages: pages,
        title: info?.Title,
        metadata: info
      };
    } catch (error) {
      DEBUG.error('PDF parsing error:', error);
      throw error;
    }
  }

  /**
   * Extract text content from a PDF file
   */
  async extractText(url: string): Promise<string> {
    try {
      DEBUG.log('Loading PDF:', url);

      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;

      DEBUG.log('PDF loaded, extracting text...');

      // Get all pages
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => 'str' in item ? item.str : '')
          .join(' ');
        pages.push(pageText);
      }

      // Get metadata
      const metadata = await pdf.getMetadata();
      const title = metadata.info?.Title || 'Untitled PDF';

      DEBUG.log('PDF text extracted successfully');

      // Return combined text
      return pages.join('\n');

    } catch (error: unknown) {
      if (error instanceof Error) {
        DEBUG.log('Error extracting PDF text:', error.message);
      } else {
        DEBUG.log('Unknown error extracting PDF text');
      }
      throw error;
    }
  }
}

// Usage example in content script:
/*
const pdfService = new PDFService();

// Parse PDF when loaded in browser
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'PDF_LOADED') {
    try {
      const pdfContent = await pdfService.parsePDF(message.url);
      // Process content with KeywordService
      // ...
    } catch (error) {
      console.error('Error processing PDF:', error);
    }
  }
});
*/ 