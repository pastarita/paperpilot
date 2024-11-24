import { LLMService } from '@/services/LLMService';

export async function getWhereAreWe(keyword: string, paperContext: string): Promise<string> {
  const prompt = `
    Generate a top-down Mermaid graph showing the scientific discipline hierarchy for the keyword "${keyword}" in the context of this paper.
    The graph should:
    - Use TD (top-down) direction
    - Include maximum 3 levels
    - Include Wikipedia links for each node
    - Follow this format:
    - Generate superset categorical containers if need be

    graph TD
      A[Main Field] --> B[Subfield]
      B --> C[Specific Area]
      
    Return ONLY the Mermaid graph code.
  `;

  const llm = new LLMService();
  const response = await llm.generate(prompt, paperContext);
  
  return response;
} 