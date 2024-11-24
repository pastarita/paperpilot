import React, { useState } from 'react';

interface MermaidRendererProps {
  diagram: string;
  onRegenerate?: () => Promise<void>;
  onNodeClick?: (concept: string) => void;
  defaultDirection?: 'TD' | 'LR';
  showWikiLinks?: boolean;
}

export function MermaidRenderer({
  diagram,
  onRegenerate,
  onNodeClick,
  defaultDirection = 'TD',
  showWikiLinks = false
}: MermaidRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ... consolidate shared functionality from WhereAreWe and IdeaTree
} 