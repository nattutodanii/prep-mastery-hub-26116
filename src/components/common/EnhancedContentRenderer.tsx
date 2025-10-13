import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface EnhancedContentRendererProps {
  content: string;
  className?: string;
}

export function EnhancedContentRenderer({ content, className = "" }: EnhancedContentRendererProps) {
  const katexOptions = {
    throwOnError: false,
    errorColor: '#cc0000',
    strict: false,
    trust: true,
    fleqn: false,
    macros: {
      "\\mathbb": "\\mathbb{#1}",
      "\\mathcal": "\\mathcal{#1}",
      "\\frac": "\\frac{#1}{#2}",
      "\\sqrt": "\\sqrt{#1}",
      "\\sum": "\\sum",
      "\\int": "\\int",
      "\\alpha": "\\alpha",
      "\\beta": "\\beta",
      "\\gamma": "\\gamma",
      "\\delta": "\\delta",
      "\\pi": "\\pi",
      "\\sigma": "\\sigma",
      "\\theta": "\\theta",
      "\\lambda": "\\lambda",
      "\\mu": "\\mu",
      "\\omega": "\\omega"
    }
  };

  // Clean and process content
  const processContent = (text: string): React.ReactNode[] => {
    if (!text || typeof text !== 'string') return [];
    
    // Clean up supabase artifacts and unwanted characters
    let cleanText = text
      .replace(/\{[^}]*supabase[^}]*\}/gi, '') // Remove supabase references
      .replace(/\[object Object\]/g, '') // Remove object references
      .replace(/undefined/g, '') // Remove undefined values
      .replace(/null/g, '') // Remove null values
      .trim();

    // Split content into sections by double newlines
    const sections = cleanText.split(/\n\s*\n/);
    
    return sections.map((section, index) => {
      section = section.trim();
      if (!section) return null;

      // Check if this section is a table (contains | characters in a structured way)
      if (isTableSection(section)) {
        return renderTable(section, index);
      }
      
      // Check if this section contains math
      if (containsMath(section)) {
        return renderMathSection(section, index);
      }
      
      // Regular text section
      return renderTextSection(section, index);
    }).filter(Boolean);
  };

  // Check if section is a table
  const isTableSection = (section: string): boolean => {
    const lines = section.split('\n');
    let pipeCount = 0;
    let lineCount = 0;
    
    for (const line of lines) {
      if (line.includes('|')) {
        pipeCount++;
      }
      lineCount++;
    }
    
    // If more than half the lines contain pipes, it's likely a table
    return pipeCount > lineCount / 2 && pipeCount >= 2;
  };

  // Render table from pipe-delimited text
  const renderTable = (section: string, key: number): React.ReactNode => {
    const lines = section.split('\n').filter(line => line.trim());
    if (lines.length < 2) return renderTextSection(section, key);

    const tableLines = lines.filter(line => line.includes('|'));
    if (tableLines.length < 2) return renderTextSection(section, key);

    // Parse header
    const headerLine = tableLines[0];
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h && h !== '---' && !h.match(/^-+$/));
    
    if (headers.length === 0) return renderTextSection(section, key);

    // Parse data rows (skip separator lines)
    const dataRows = tableLines.slice(1)
      .filter(line => !line.match(/^\s*\|[\s-|]+\|\s*$/)) // Skip separator lines
      .map(line => {
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        return cells.length >= headers.length ? cells : null;
      })
      .filter(Boolean);

    if (dataRows.length === 0) return renderTextSection(section, key);

    return (
      <div key={key} className="my-6 overflow-x-auto">
        <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-muted/50">
              {headers.map((header, i) => (
                <th key={i} className="border border-border px-4 py-3 text-left font-semibold text-foreground">
                  {renderInlineContent(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, i) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                {headers.map((_, j) => (
                  <td key={j} className="border border-border px-4 py-3 text-foreground">
                    {renderInlineContent(row[j] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Check if section contains math
  const containsMath = (section: string): boolean => {
    return /\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\[a-zA-Z]+|[α-ωΑ-Ω]/.test(section);
  };

  // Render section with math
  const renderMathSection = (section: string, key: number): React.ReactNode => {
    const parts = [];
    let currentIndex = 0;
    
    // Handle block math ($$...$$)
    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
    let match;
    
    while ((match = blockMathRegex.exec(section)) !== null) {
      // Add text before math
      if (match.index > currentIndex) {
        const textBefore = section.slice(currentIndex, match.index);
        parts.push(renderInlineContent(textBefore));
      }
      
      // Add block math
      parts.push(
        <div key={`block-${match.index}`} className="my-4">
          <BlockMath math={match[1]} {...katexOptions} />
        </div>
      );
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < section.length) {
      const remainingText = section.slice(currentIndex);
      parts.push(renderInlineContent(remainingText));
    }
    
    return <div key={key} className="my-4">{parts}</div>;
  };

  // Render regular text section
  const renderTextSection = (section: string, key: number): React.ReactNode => {
    // Handle headings
    if (section.startsWith('###')) {
      return (
        <h3 key={key} className="text-xl font-bold text-foreground mt-8 mb-4">
          {renderInlineContent(section.replace(/^###\s*/, ''))}
        </h3>
      );
    }
    if (section.startsWith('##')) {
      return (
        <h2 key={key} className="text-2xl font-bold text-foreground mt-8 mb-4">
          {renderInlineContent(section.replace(/^##\s*/, ''))}
        </h2>
      );
    }
    if (section.startsWith('#')) {
      return (
        <h1 key={key} className="text-3xl font-bold text-foreground mt-8 mb-4">
          {renderInlineContent(section.replace(/^#\s*/, ''))}
        </h1>
      );
    }

    // Handle lists
    const lines = section.split('\n');
    if (lines.every(line => line.match(/^\s*[\*\-\+]\s/) || line.match(/^\s*\d+\.\s/) || !line.trim())) {
      const listItems = lines.filter(line => line.trim()).map((line, i) => {
        const content = line.replace(/^\s*[\*\-\+\d\.]\s*/, '');
        return (
          <li key={i} className="text-foreground leading-relaxed">
            {renderInlineContent(content)}
          </li>
        );
      });

      const isOrdered = lines.some(line => line.match(/^\s*\d+\.\s/));
      const ListComponent = isOrdered ? 'ol' : 'ul';
      
      return (
        <ListComponent key={key} className={`my-4 ml-6 space-y-2 ${isOrdered ? 'list-decimal' : 'list-disc'}`}>
          {listItems}
        </ListComponent>
      );
    }

    // Regular paragraph
    return (
      <div key={key} className="my-4 text-foreground leading-relaxed">
        {renderInlineContent(section)}
      </div>
    );
  };

  // Render inline content with math support
  const renderInlineContent = (text: string): React.ReactNode => {
    if (!text) return '';
    
    const parts = [];
    let currentIndex = 0;
    
    // Handle inline math ($...$)
    const inlineMathRegex = /\$([^$\n]+)\$/g;
    let match;
    
    while ((match = inlineMathRegex.exec(text)) !== null) {
      // Add text before math
      if (match.index > currentIndex) {
        const textBefore = text.slice(currentIndex, match.index);
        parts.push(formatText(textBefore));
      }
      
      // Add inline math
      parts.push(
        <InlineMath key={`inline-${match.index}`} math={match[1]} {...katexOptions} />
      );
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      parts.push(formatText(remainingText));
    }
    
    return parts.length > 1 ? <>{parts}</> : parts[0] || formatText(text);
  };

  // Format regular text (bold, italic, etc.)
  const formatText = (text: string): React.ReactNode => {
    if (!text) return '';

    // Handle bold **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic *text*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle code `text`
    text = text.replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-muted rounded text-sm font-mono">$1</code>');

    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className={`enhanced-content-renderer ${className}`}>
      {processContent(content)}
      
      <style>{`
        .enhanced-content-renderer {
          line-height: 1.7;
        }
        
        .enhanced-content-renderer table {
          font-size: 0.95rem;
        }
        
        .enhanced-content-renderer th {
          background-color: hsl(var(--muted) / 0.5);
          font-weight: 600;
        }
        
        .enhanced-content-renderer td {
          vertical-align: top;
        }
        
        .enhanced-content-renderer tr:nth-child(even) {
          background-color: hsl(var(--muted) / 0.1);
        }
        
        .enhanced-content-renderer code {
          background-color: hsl(var(--muted));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        
        .katex-display {
          margin: 1rem 0;
        }
        
        .katex {
          font-size: 1em;
        }
      `}</style>
    </div>
  );
}