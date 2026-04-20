import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight bar chart — no external dependency.
 * Crisp, clean, modern UI.
 */
export default function ChartComponent({ data = [], title, height = 200 }) {
  const canvasRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Re-render when container resizes
  useEffect(() => {
    if (!canvasRef.current) return;
    const obs = new ResizeObserver((entries) => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });
    obs.observe(canvasRef.current.parentElement);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    const canvas = canvasRef.current;
    
    // Retina display support
    const dpr = window.devicePixelRatio || 1;
    const W = containerWidth || canvas.parentElement.clientWidth || 480;
    const H = height;
    
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, W, H);

    const max      = Math.max(...data.map(d => d.value), 1);
    
    // Formatting function for large numbers
    const formatValue = (val) => {
      if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (val >= 1000) return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
      return Math.round(val).toString();
    };

    ctx.font = '11px "Inter", "DM Sans", sans-serif';
    // Dynamically calculate left padding based on the widest label
    const maxLabelWidth = ctx.measureText(formatValue(max)).width;
    const padLeft  = Math.max(40, maxLabelWidth + 24);
    
    const padRight = 20;
    const padBot   = 36;
    const chartW   = W - padLeft - padRight;
    const chartH   = H - padBot - 24; // Extra top padding for numbers
    
    // Spacing math - perfectly distribute across entire width
    const stepX = chartW / Math.max(data.length, 1);
    // Bar width is 60% of the step, capped at 120px
    const barW = Math.min(Math.floor(stepX * 0.6), 120);
    // Center each bar within its step
    const startX = padLeft + (stepX - barW) / 2;

    // Read current theme colors
    const computed = getComputedStyle(document.documentElement);
    const textColor = computed.getPropertyValue('--text').trim() || '#ffffff';
    const text2Color = computed.getPropertyValue('--text2').trim() || '#94a3b8';
    const borderColor = computed.getPropertyValue('--border2').trim() || 'rgba(255, 255, 255, 0.06)';

    // Grid lines (subtle, clean)
    ctx.strokeStyle = borderColor;
    ctx.lineWidth   = 1;
    
    ctx.fillStyle = text2Color; 
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Generate unique, sensible Y-axis ticks
    let ticks = [];
    let chartMax = max;
    
    if (max <= 8) {
      for (let i = 1; i <= max; i++) ticks.push(i);
    } else {
      let step = Math.ceil(max / 4);
      if (step > 10) {
        const p = Math.pow(10, Math.floor(Math.log10(step)));
        step = Math.ceil(step / p) * p;
      }
      for (let i = step; i <= max + step; i += step) {
        ticks.push(i);
        if (i >= max) break;
      }
      chartMax = ticks[ticks.length - 1];
    }
    // Remove any accidental duplicates
    ticks = [...new Set(ticks)];

    ticks.forEach(val => {
      const f = val / chartMax;
      const y = 24 + chartH * (1 - f);
      ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(W - padRight, y); ctx.stroke();
      ctx.fillText(formatValue(val), padLeft - 12, y);
    });

    // Baseline
    ctx.beginPath(); ctx.moveTo(padLeft, 24 + chartH); ctx.lineTo(W - padRight, 24 + chartH); ctx.stroke();

    // Bars
    data.forEach((d, i) => {
      // If value is 0, still show a tiny sliver
      const barH  = Math.max((d.value / chartMax) * chartH, 2);
      const x     = startX + i * stepX;
      const y     = 24 + chartH - barH;
      const color = d.color || '#6366f1'; 

      // Clean, crisp gradient (no blur)
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, color + 'e6'); // 90% opacity top
      grad.addColorStop(1, color + '11'); // Fade out
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
      ctx.fill();

      // Sharp accent line at the very top of the bar
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, Math.min(4, barH), [6, 6, 0, 0]);
      ctx.fill();

      // Label (bottom)
      ctx.fillStyle = text2Color; 
      ctx.font = '12px "Inter", "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const lx = x + barW / 2;
      ctx.fillText(d.label.length > 12 ? d.label.slice(0, 10) + '…' : d.label, lx, H - 28);

      // Value (top)
      ctx.fillStyle = textColor; 
      ctx.font = 'bold 13px "Inter", "DM Mono", monospace';
      ctx.textBaseline = 'bottom';
      ctx.fillText(Number(d.value).toLocaleString(), lx, y - 6);
    });
  }, [data, height, containerWidth]);

  if (!data.length) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 14, color: 'var(--text-secondary)' }}>
          {title}
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: height, display: 'block' }}
      />
    </div>
  );
}