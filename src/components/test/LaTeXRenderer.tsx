import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

// Import additional KaTeX packages for advanced features
import katex from 'katex';

// Add support for additional packages
if (typeof window !== 'undefined') {
  // Enable array environment and other LaTeX packages
  try {
    require('katex/dist/contrib/auto-render.min.js');
  } catch (e) {
    // Fallback for when auto-render is not available
  }
}

interface LaTeXRendererProps {
  content: string;
  className?: string;
}

export function LaTeXRenderer({ content, className = "" }: LaTeXRendererProps) {
  // Enhanced KaTeX settings for better rendering of complex expressions
  const katexOptions = {
    throwOnError: false,
    errorColor: '#cc0000',
    strict: false,
    trust: true,
    fleqn: false,
    macros: {
      "\\mathbb": "\\mathbb{#1}",
      "\\mathcal": "\\mathcal{#1}",
      "\\mathfrak": "\\mathfrak{#1}",
      "\\mathscr": "\\mathscr{#1}",
      "\\text": "\\text{#1}",
      "\\textbf": "\\textbf{#1}",
      "\\textit": "\\textit{#1}",
      "\\leq": "\\leq",
      "\\geq": "\\geq",
      "\\approx": "\\approx",
      "\\sim": "\\sim",
      "\\pm": "\\pm",
      "\\mp": "\\mp",
      "\\times": "\\times",
      "\\cdot": "\\cdot",
      "\\div": "\\div",
      "\\frac": "\\frac{#1}{#2}",
      "\\sqrt": "\\sqrt{#1}",
      "\\sum": "\\sum",
      "\\prod": "\\prod",
      "\\int": "\\int",
      "\\lim": "\\lim",
      "\\infty": "\\infty",
      "\\alpha": "\\alpha",
      "\\beta": "\\beta",
      "\\gamma": "\\gamma",
      "\\delta": "\\delta",
      "\\epsilon": "\\epsilon",
      "\\theta": "\\theta",
      "\\lambda": "\\lambda",
      "\\mu": "\\mu",
      "\\pi": "\\pi",
      "\\sigma": "\\sigma",
      "\\phi": "\\phi",
      "\\omega": "\\omega",
      "\\Gamma": "\\Gamma",
      "\\Delta": "\\Delta",
      "\\Theta": "\\Theta",
      "\\Lambda": "\\Lambda",
      "\\Xi": "\\Xi",
      "\\Pi": "\\Pi",
      "\\Sigma": "\\Sigma",
      "\\Upsilon": "\\Upsilon",
      "\\Phi": "\\Phi",
      "\\Psi": "\\Psi",
      "\\Omega": "\\Omega",
      "\\log": "\\log",
      "\\ln": "\\ln",
      "\\sin": "\\sin",
      "\\cos": "\\cos",
      "\\tan": "\\tan",
      "\\sec": "\\sec",
      "\\csc": "\\csc",
      "\\cot": "\\cot",
      "\\arcsin": "\\arcsin",
      "\\arccos": "\\arccos",
      "\\arctan": "\\arctan",
      "\\sinh": "\\sinh",
      "\\cosh": "\\cosh",
      "\\tanh": "\\tanh",
      "\\Re": "\\Re",
      "\\Im": "\\Im",
      "\\mathbf": "\\mathbf{#1}",
      "\\mathrm": "\\mathrm{#1}",
      "\\mathit": "\\mathit{#1}",
      "\\mathsf": "\\mathsf{#1}",
      "\\mathtt": "\\mathtt{#1}",
      "\\overline": "\\overline{#1}",
      "\\underline": "\\underline{#1}",
      "\\overbrace": "\\overbrace{#1}",
      "\\underbrace": "\\underbrace{#1}",
      "\\overrightarrow": "\\overrightarrow{#1}",
      "\\overleftarrow": "\\overleftarrow{#1}",
      "\\overleftrightarrow": "\\overleftrightarrow{#1}",
      "\\hat": "\\hat{#1}",
      "\\widehat": "\\widehat{#1}",
      "\\tilde": "\\tilde{#1}",
      "\\widetilde": "\\widetilde{#1}",
      "\\vec": "\\vec{#1}",
      "\\dot": "\\dot{#1}",
      "\\ddot": "\\ddot{#1}",
      "\\bar": "\\bar{#1}",
      "\\check": "\\check{#1}",
      "\\breve": "\\breve{#1}",
      "\\acute": "\\acute{#1}",
      "\\grave": "\\grave{#1}",
      "\\not": "\\not"
    }
  };

  // Function to render TikZ-like diagrams using SVG
  const renderDiagram = (diagramType: string, params: any) => {
    try {
      switch (diagramType.toLowerCase()) {
        case 'circle':
          return (
            <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto my-4">
              <circle 
                cx="100" 
                cy="100" 
                r={params.radius || "80"} 
                fill={params.fill || "none"} 
                stroke={params.stroke || "black"} 
                strokeWidth={params.strokeWidth || "2"}
              />
              {params.label && (
                <text x="100" y="105" textAnchor="middle" fontSize="14" fill="black">
                  {params.label}
                </text>
              )}
            </svg>
          );
        
        case 'piechart':
          const data = params.data || [{ value: 100, color: '#3b82f6' }];
          let currentAngle = 0;
          const center = 100;
          const radius = 80;
          
          return (
            <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto my-4">
              {data.map((slice: any, index: number) => {
                const angle = (slice.value / 100) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                
                const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
                const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
                const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const pathData = [
                  `M ${center} ${center}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                currentAngle += angle;
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={slice.color || `hsl(${index * 60}, 70%, 50%)`}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
          );
        
        case 'triangle':
          return (
            <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto my-4">
              <polygon 
                points={params.points || "100,20 180,180 20,180"} 
                fill={params.fill || "none"} 
                stroke={params.stroke || "black"} 
                strokeWidth={params.strokeWidth || "2"}
              />
            </svg>
          );
        
        case 'rectangle':
          return (
            <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto my-4">
              <rect 
                x={params.x || "50"}
                y={params.y || "50"}
                width={params.width || "100"}
                height={params.height || "100"}
                fill={params.fill || "none"} 
                stroke={params.stroke || "black"} 
                strokeWidth={params.strokeWidth || "2"}
              />
            </svg>
          );
        
        default:
          return null;
      }
    } catch (e) {
      return null;
    }
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    
    // Handle diagram directives first
    let processedText = text;
    const diagramRegex = /\\diagram\{([^}]+)\}(?:\{([^}]*)\})?/g;
    
    processedText = processedText.replace(diagramRegex, (match, type, paramsStr) => {
      try {
        const params = paramsStr ? JSON.parse(paramsStr) : {};
        const diagramElement = renderDiagram(type, params);
        if (diagramElement) {
          return `<div class="diagram-placeholder" data-type="${type}" data-params="${encodeURIComponent(JSON.stringify(params))}"></div>`;
        }
      } catch (e) {
        console.error('Error parsing diagram:', e);
      }
      return match;
    });
    
    // Pre-process the text to handle special cases
    processedText = processedText
      // Fix common LaTeX issues
      .replace(/\\\[/g, '$$')
      .replace(/\\\]/g, '$$')
      // Handle array environments better
      .replace(/\\begin\{array\}/g, '\\begin{array}')
      .replace(/\\end\{array\}/g, '\\end{array}')
      // Handle matrix environments
      .replace(/\\begin\{matrix\}/g, '\\begin{matrix}')
      .replace(/\\end\{matrix\}/g, '\\end{matrix}')
      .replace(/\\begin\{pmatrix\}/g, '\\begin{pmatrix}')
      .replace(/\\end\{pmatrix\}/g, '\\end{pmatrix}')
      .replace(/\\begin\{bmatrix\}/g, '\\begin{bmatrix}')
      .replace(/\\end\{bmatrix\}/g, '\\end{bmatrix}')
      .replace(/\\begin\{vmatrix\}/g, '\\begin{vmatrix}')
      .replace(/\\end\{vmatrix\}/g, '\\end{vmatrix}')
      .replace(/\\begin\{Vmatrix\}/g, '\\begin{Vmatrix}')
      .replace(/\\end\{Vmatrix\}/g, '\\end{Vmatrix}')
      // Handle table-like structures
      .replace(/\\hline/g, '\\hline')
      .replace(/&/g, ' & ')
      .replace(/\\\\/g, ' \\\\ ')
      // Handle fraction formatting
      .replace(/\\frac(\d+)(\d+)/g, '\\frac{$1}{$2}')
      // Handle common math notation fixes
      .replace(/P\(([^)]+)\)/g, '\\mathrm{P}($1)')
      .replace(/Var\(([^)]+)\)/g, '\\mathrm{Var}($1)')
      .replace(/E\[([^\]]+)\]/g, '\\mathrm{E}[$1]')
      .replace(/\\mathbbP/g, '\\mathbb{P}')
      .replace(/\\mathbbE/g, '\\mathbb{E}')
      .replace(/\\mathbbR/g, '\\mathbb{R}')
      .replace(/\\mathbbN/g, '\\mathbb{N}')
      .replace(/\\mathbbZ/g, '\\mathbb{Z}')
      .replace(/\\mathbbQ/g, '\\mathbb{Q}')
      .replace(/\\mathbbC/g, '\\mathbb{C}');

    // Handle display math first ($$...$$)
    const displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
    const inlineMathRegex = /\$([^$]*?)\$/g;
    
    // Split by display math first
    const displayParts = processedText.split(displayMathRegex);
    
    return displayParts.map((part, index) => {
      // Even indices are regular text/inline math, odd indices are display math
      if (index % 2 === 1) {
        // This is display math content
        const mathContent = part.trim();
        try {
          return (
            <div key={index} className="my-6 overflow-x-auto flex justify-center">
              <BlockMath 
                math={mathContent}
                settings={katexOptions}
                renderError={(error) => {
                  console.error('BlockMath render error:', error, 'Content:', mathContent);
                  return (
                    <div className="text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                      <div className="font-medium text-sm">LaTeX Render Error:</div>
                      <div className="text-xs mt-1 font-mono">{mathContent}</div>
                      <div className="text-xs mt-1 text-red-500">{error.message || 'Unknown error'}</div>
                    </div>
                  );
                }}
              />
            </div>
          );
        } catch (error: any) {
          console.error('Error rendering display math:', error, 'Content:', mathContent);
          return (
            <div key={index} className="text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200 my-4">
              <div className="font-medium text-sm">LaTeX Render Error:</div>
              <div className="text-xs mt-1 font-mono">{mathContent}</div>
              <div className="text-xs mt-1 text-red-500">{error.message || 'Unknown error'}</div>
            </div>
          );
        }
      } else {
        // This might contain inline math
        const inlineParts = part.split(inlineMathRegex);
        return inlineParts.map((inlinePart, inlineIndex) => {
          if (inlineIndex % 2 === 1) {
            // This is inline math content
            const mathContent = inlinePart.trim();
            try {
              return (
                <InlineMath 
                  key={`${index}-${inlineIndex}`} 
                  math={mathContent}
                  settings={katexOptions}
                  renderError={(error) => {
                    console.error('InlineMath render error:', error, 'Content:', mathContent);
                    return (
                      <span className="text-red-600 bg-red-50 px-1 py-0.5 rounded text-xs font-mono">
                        Error: {mathContent}
                      </span>
                    );
                  }}
                />
              );
            } catch (error: any) {
              console.error('Error rendering inline math:', error, 'Content:', mathContent);
              return (
                <span key={`${index}-${inlineIndex}`} className="text-red-600 bg-red-50 px-1 py-0.5 rounded text-xs font-mono">
                  Error: {mathContent}
                </span>
              );
            }
          } else {
            // Regular text - handle basic markdown and formatting
            return (
              <span 
                key={`${index}-${inlineIndex}`} 
                dangerouslySetInnerHTML={{
                  __html: inlinePart
                    // Headers
                    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-800">$1</h3>')
                    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-4 text-gray-800">$1</h2>')
                    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-6 text-gray-900">$1</h1>')
                    // Bold and italic
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                    // Code blocks
                    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
                    // Lists
                    .replace(/^(\d+)\.\s+(.*)$/gm, '<div class="ml-4 mb-2"><span class="font-medium">$1.</span> $2</div>')
                    .replace(/^-\s+(.*)$/gm, '<div class="ml-4 mb-2 flex items-start"><span class="text-gray-600 mr-2">•</span><span>$1</span></div>')
                    // Horizontal rules
                    .replace(/^---$/gm, '<hr class="border-gray-300 my-6">')
                    // Line breaks
                    .replace(/\n\n/g, '</p><p class="mb-4">')
                    .replace(/\n/g, '<br />')
                }} 
              />
            );
          }
        });
      }
    });
  };

  return (
    <div className={`latex-content prose prose-lg max-w-none ${className}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .latex-content {
            font-family: 'Computer Modern', 'Times New Roman', serif;
            line-height: 1.6;
          }
          
          .latex-content .katex-display {
            margin: 1.5rem 0;
            text-align: center;
            overflow: visible;
            padding: 0.5rem;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .latex-content .katex {
            font-size: 1.1em;
            max-width: 100%;
            overflow: visible;
          }
          
          .latex-content .katex-display .katex {
            font-size: 1.2em;
            display: inline-block;
            max-width: 100%;
            overflow: visible;
            white-space: nowrap;
          }
          
          /* Fix scrollbar issues for large expressions */
          .latex-content .katex-display {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
          
          .latex-content .katex-display::-webkit-scrollbar {
            display: none; /* Chrome, Safari and Opera */
          }
          
          /* Better mobile handling for large expressions */
          @media (max-width: 768px) {
            .latex-content .katex-display {
              overflow-x: auto;
              overflow-y: visible;
              scrollbar-width: thin;
              -webkit-overflow-scrolling: touch;
            }
            
            .latex-content .katex-display::-webkit-scrollbar {
              display: block;
              height: 4px;
            }
            
            .latex-content .katex-display::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 2px;
            }
            
            .latex-content .katex-display::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 2px;
            }
          }
          
          /* Enhanced support for arrays and matrices */
          .latex-content .katex .arraycolsep {
            width: 0.5em;
          }
          
          .latex-content .katex .array {
            display: inline-table;
            vertical-align: middle;
            text-align: center;
          }
          
          .latex-content .katex .array tr {
            line-height: 1.5;
          }
          
          .latex-content .katex .array td {
            padding: 0.3em 0.5em;
            border: none;
          }
          
          /* Table styling for LaTeX arrays */
          .latex-content .katex .arraycolsep {
            width: 0.5em;
          }
          
          .latex-content .katex .hline::before {
            content: '';
            display: block;
            border-bottom: 1px solid currentColor;
            margin: 0.2em 0;
          }
          
          /* Better fraction rendering */
          .latex-content .katex .frac-line {
            border-bottom-width: 0.06em;
          }
          
          /* Enhanced matrix support */
          .latex-content .katex .left-right {
            display: inline-flex;
            align-items: center;
          }
          
          .latex-content .katex .mopen,
          .latex-content .katex .mclose {
            font-size: 1.2em;
          }
          
          /* Improved spacing for complex expressions */
          .latex-content .katex .mrel {
            margin: 0 0.2777777778em;
          }
          
          .latex-content .katex .mbin {
            margin: 0 0.2222222222em;
          }
          
          .latex-content .katex .mop {
            margin: 0 0.1666666667em;
          }
          
          /* Error styling improvements */
          .latex-content .katex-error {
            color: #cc0000;
            border: 1px solid #cc0000;
            padding: 0.2em;
            border-radius: 0.25em;
            background: #ffe6e6;
          }
          
          .latex-content h1, .latex-content h2, .latex-content h3 {
            color: #1f2937;
          }
          
          .latex-content code {
            background-color: #f3f4f6;
            padding: 0.2em 0.4em;
            border-radius: 0.25rem;
            font-family: 'Fira Code', 'Monaco', monospace;
          }
          
          .latex-content hr {
            border: none;
            border-top: 1px solid #d1d5db;
            margin: 2rem 0;
          }
          
          .latex-content strong {
            font-weight: 600;
            color: #111827;
          }
          
          .latex-content em {
            font-style: italic;
            color: #374151;
          }
          
          /* Responsive LaTeX for mobile */
          @media (max-width: 768px) {
            .latex-content .katex {
              font-size: 0.95em;
            }
            
            .latex-content .katex-display {
              margin: 1rem 0;
              padding: 0.25rem;
            }
            
            .latex-content .katex-display .katex {
              font-size: 1.1em;
            }
          }

          /* SVG diagram styling */
          .latex-content svg {
            max-width: 100%;
            height: auto;
          }
          
          /* Better option spacing in test interface */
          .latex-content .option-content {
            display: inline-block;
            vertical-align: middle;
            padding: 0.25rem 0;
          }
        `
      }} />
      
      <div className="leading-relaxed text-gray-800">
        <p className="mb-4">
          {renderContent(content)}
        </p>
      </div>
    </div>
  );
}