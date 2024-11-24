import { Keyword } from '../services/KeywordService';

export interface KeywordData {
  word: string;
  contextDescription: string;
  whereAreWe?: string;
  dictionaryDefinition?: string;
  paperContext?: string;
  ideaTree?: string;
}

export class KeywordStore {
  private keywords: Map<string, Keyword>;

  constructor() {
    this.keywords = new Map();
  }

  addKeyword(keyword: Keyword): void {
    if (!keyword.word) return;
    this.keywords.set(keyword.word.toLowerCase(), keyword);
  }

  getKeyword(word: string): Keyword | undefined {
    return this.keywords.get(word.toLowerCase());
  }

  getKeywords(): Keyword[] {
    return Array.from(this.keywords.values())
      .sort((a, b) => b.importance - a.importance);
  }

  updateKeywordData(word: string, data: Partial<Keyword>): void {
    const existing = this.keywords.get(word.toLowerCase());
    if (existing) {
      this.keywords.set(word.toLowerCase(), {
        ...existing,
        ...data
      });
    }
  }

  clear(): void {
    this.keywords.clear();
  }

  size(): number {
    return this.keywords.size;
  }

  hasKeyword(word: string): boolean {
    return this.keywords.has(word.toLowerCase());
  }
}