import { debug } from '../debug/debug';

interface Keyword {
  text: string;
  importance: number;
  context: string;
}

export class KeywordList {
  private container: HTMLElement;
  private isVisible: boolean = false;

  constructor() {
    // Create container element
    this.container = document.createElement('div');
    this.container.id = 'paperpilot-keyword-list';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      right: -300px;
      width: 300px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 5px rgba(0,0,0,0.2);
      transition: right 0.3s ease;
      z-index: 9999;
      overflow-y: auto;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    // Add to document
    document.body.appendChild(this.container);
  }

  /**
   * Update the keyword list with new keywords
   */
  updateKeywords(keywords: Keyword[]) {
    debug('Updating keyword list:', keywords);

    // Clear existing content
    this.container.innerHTML = '';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Keywords';
    title.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #333;
    `;
    this.container.appendChild(title);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      border: none;
      background: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    `;
    closeButton.onclick = () => this.toggleVisibility();
    this.container.appendChild(closeButton);

    // Create keyword list
    const list = document.createElement('div');
    list.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;

    // Add keywords
    keywords.forEach(keyword => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 10px;
        background: #f5f5f5;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
      `;

      const text = document.createElement('div');
      text.textContent = keyword.text;
      text.style.cssText = `
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      `;

      const context = document.createElement('div');
      context.textContent = keyword.context;
      context.style.cssText = `
        font-size: 14px;
        color: #666;
        line-height: 1.4;
      `;

      item.appendChild(text);
      item.appendChild(context);
      list.appendChild(item);
    });

    this.container.appendChild(list);
  }

  /**
   * Toggle the visibility of the keyword list
   */
  toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.container.style.right = this.isVisible ? '0' : '-300px';
    debug('Keyword list visibility:', this.isVisible);
  }
}
