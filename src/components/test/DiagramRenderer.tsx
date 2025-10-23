import { useEffect, useRef, useState } from 'react';

interface DiagramRendererProps {
  diagramData: any[];
  className?: string;
}

export function DiagramRenderer({ diagramData, className = '' }: DiagramRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 440 });

  useEffect(() => {
    if (!canvasRef.current || !diagramData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    diagramData.forEach((element: any) => {
      const x1 = element.x;
      const y1 = element.y;
      const x2 = x1 + (element.width || 0);
      const y2 = y1 + (element.height || 0);
      
      minX = Math.min(minX, x1);
      minY = Math.min(minY, y1);
      maxX = Math.max(maxX, x2);
      maxY = Math.max(maxY, y2);
    });

    const padding = 40;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;
    
    // Set canvas size
    const scale = Math.min(600 / contentWidth, 440 / contentHeight);
    const finalWidth = contentWidth * scale;
    const finalHeight = contentHeight * scale;
    
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    setDimensions({ width: finalWidth, height: finalHeight });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-minX + padding, -minY + padding);

    // Render each element
    diagramData.forEach((element: any) => {
      ctx.strokeStyle = element.strokeColor || '#000000';
      ctx.fillStyle = element.backgroundColor || 'transparent';
      ctx.lineWidth = element.strokeWidth || 2;

      if (element.type === 'ellipse') {
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        const radiusX = element.width / 2;
        const radiusY = element.height / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        if (element.backgroundColor !== 'transparent') {
          ctx.fill();
        }
        ctx.stroke();
      } else if (element.type === 'rectangle') {
        ctx.beginPath();
        ctx.rect(element.x, element.y, element.width, element.height);
        if (element.backgroundColor !== 'transparent') {
          ctx.fill();
        }
        ctx.stroke();
      } else if (element.type === 'line') {
        const points = element.points || [[0, 0], [element.width || 0, element.height || 0]];
        ctx.beginPath();
        ctx.moveTo(element.x + points[0][0], element.y + points[0][1]);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(element.x + points[i][0], element.y + points[i][1]);
        }
        ctx.stroke();
      }
    });

    ctx.restore();
  }, [diagramData]);

  if (!diagramData || diagramData.length === 0) {
    return null;
  }

  return (
    <div className={`flex justify-center items-center my-4 ${className}`}>
      <div className="bg-white border-2 border-border rounded-lg p-4 shadow-sm">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="max-w-full h-auto"
        />
      </div>
    </div>
  );
}
