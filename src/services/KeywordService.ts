import { debug } from '../debug/debug';

export interface Keyword {
  text: string;
  importance: number;
  context: string;
}

export class KeywordService {
  private store: any;
  private readonly stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
    'will', 'with', 'this', 'these', 'those', 'such', 'when', 'where', 'which',
    'who', 'whom', 'whose', 'what', 'why', 'how'
  ]);

  constructor(store: any) {
    this.store = store;
  }

  async processDocument(paperText: string): Promise<Keyword[]> {
    try {
      debug('Processing document for keywords...');
      
      // Extract keywords
      const keywords = await this.extractKeywords(paperText);
      
      // Store keywords
      keywords.forEach(keyword => {
        this.store.addKeyword(keyword);
      });

      return keywords;
    } catch (error) {
      debug('Error processing document:', error);
      return [];
    }
  }

  highlightKeywords(container: HTMLElement) {
    const keywords = this.store.getKeywords();
    if (!keywords || keywords.length === 0) {
      debug('No keywords to highlight');
      return;
    }

    debug('Highlighting keywords:', keywords);

    // Create styles for highlights if they don't exist
    this.ensureHighlightStyles();

    // Get all text nodes that are direct children of the container
    // This is specific to PDF.js text layer structure
    const textElements = Array.from(container.children) as HTMLElement[];
    
    textElements.forEach(element => {
      if (!element.textContent) return;

      keywords.forEach(keyword => {
        if (!keyword.text) return;
        
        const regex = new RegExp(`\\b${this.escapeRegExp(keyword.text)}\\b`, 'gi');
        const text = element.textContent;
        
        if (regex.test(text)) {
          this.wrapKeywordInHighlight(element, keyword);
        }
      });
    });
  }

  private ensureHighlightStyles() {
    const styleId = 'paperpilot-highlight-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .keyword-highlight {
        background-color: rgba(255, 255, 0, 0.3) !important;
        border-radius: 3px !important;
        padding: 0 2px !important;
        margin: 0 1px !important;
        position: relative !important;
        cursor: help !important;
        display: inline !important;
      }

      .keyword-highlight:hover {
        background-color: rgba(255, 255, 0, 0.5) !important;
      }

      .keyword-highlight:hover::after {
        content: attr(data-context);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 8px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  private wrapKeywordInHighlight(element: HTMLElement, keyword: Keyword) {
    const text = element.textContent || '';
    const regex = new RegExp(`\\b${this.escapeRegExp(keyword.text)}\\b`, 'gi');
    
    // Create a temporary container
    const temp = document.createElement('span');
    temp.innerHTML = text.replace(regex, match => {
      const highlight = document.createElement('span');
      highlight.className = 'keyword-highlight';
      highlight.textContent = match;
      highlight.dataset.context = keyword.context || keyword.text;
      highlight.style.cssText = element.style.cssText; // Preserve original styles
      return highlight.outerHTML;
    });

    // Copy over the original element's styles and classes
    temp.style.cssText = element.style.cssText;
    temp.className = element.className;

    // Replace the original element
    element.parentNode?.replaceChild(temp, element);
  }

  private async extractKeywords(text: string): Promise<Keyword[]> {
    debug('Extracting keywords from text');

    // Split into sentences for context
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Get word frequencies
    const wordFreq = new Map<string, number>();
    const wordContexts = new Map<string, string>();

    sentences.forEach(sentence => {
      const words = sentence.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && 
          !this.stopWords.has(word) &&
          !/^\d+$/.test(word)
        );

      words.forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        if (!wordContexts.has(word)) {
          wordContexts.set(word, sentence.trim());
        }
      });
    });

    // Calculate importance scores
    const totalWords = Array.from(wordFreq.values()).reduce((a, b) => a + b, 0);
    const keywords: Keyword[] = [];

    wordFreq.forEach((freq, word) => {
      // TF-IDF-like importance score
      const importance = (freq / totalWords) * Math.log(1 + freq);
      
      keywords.push({
        text: word,
        importance,
        context: wordContexts.get(word) || ''
      });
    });

    // Sort by importance and take top 20
    keywords.sort((a, b) => b.importance - a.importance);
    const topKeywords = keywords.slice(0, 20);

    debug('Extracted keywords:', topKeywords);
    return topKeywords;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}