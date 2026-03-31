// Visual Asset Generator — Client-side Canvas Rendering
import { VisualType } from '@/types';

export interface VisualConfig {
  type: VisualType;
  headline: string;
  body?: string;
  cta?: string;
  brandName: string;
  slides?: { headline: string; body: string }[];
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

const DIMENSIONS: Record<VisualType, { w: number; h: number }> = {
  'linkedin-carousel': { w: 1080, h: 1080 },
  'twitter-header': { w: 1500, h: 500 },
  'instagram-story': { w: 1080, h: 1920 },
  'quote-card': { w: 1080, h: 1080 },
  'blog-featured': { w: 1200, h: 630 },
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, bg: string, primary: string) {
  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, hexToRgba(primary, 0.15));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle pattern overlay
  ctx.fillStyle = hexToRgba(primary, 0.03);
  for (let i = 0; i < w; i += 60) {
    for (let j = 0; j < h; j += 60) {
      ctx.beginPath();
      ctx.arc(i, j, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Accent shapes
  ctx.fillStyle = hexToRgba(primary, 0.08);
  ctx.beginPath();
  ctx.arc(w * 0.85, h * 0.15, w * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hexToRgba(primary, 0.05);
  ctx.beginPath();
  ctx.arc(w * 0.1, h * 0.85, w * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

function drawBrandBar(ctx: CanvasRenderingContext2D, w: number, h: number, brandName: string, primary: string, textColor: string) {
  // Bottom brand bar
  ctx.fillStyle = hexToRgba(primary, 0.15);
  ctx.fillRect(0, h - 60, w, 60);

  // Brand accent line
  ctx.fillStyle = primary;
  ctx.fillRect(0, h - 60, w, 3);

  // Brand name
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = hexToRgba(textColor, 0.6);
  ctx.textAlign = 'center';
  ctx.fillText(brandName.toUpperCase(), w / 2, h - 24);
}

export function generateQuoteCard(config: VisualConfig): string {
  const { w, h } = DIMENSIONS['quote-card'];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  drawBackground(ctx, w, h, config.colors.background, config.colors.primary);

  // Quote decoration
  ctx.font = 'bold 200px Georgia, serif';
  ctx.fillStyle = hexToRgba(config.colors.primary, 0.12);
  ctx.textAlign = 'left';
  ctx.fillText('\u201C', 60, 240);

  // Main quote text
  ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = config.colors.text;
  ctx.textAlign = 'left';
  const lines = wrapText(ctx, config.headline, w - 160);
  const startY = (h - lines.length * 64) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, 80, startY + i * 64);
  });

  // Accent line
  ctx.fillStyle = config.colors.primary;
  ctx.fillRect(80, startY + lines.length * 64 + 30, 80, 4);

  drawBrandBar(ctx, w, h, config.brandName, config.colors.primary, config.colors.text);

  return canvas.toDataURL('image/png');
}

export function generateTwitterHeader(config: VisualConfig): string {
  const { w, h } = DIMENSIONS['twitter-header'];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  drawBackground(ctx, w, h, config.colors.background, config.colors.primary);

  // Left accent bar
  ctx.fillStyle = config.colors.primary;
  ctx.fillRect(0, 0, 6, h);

  // Quote text centered
  ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = config.colors.text;
  ctx.textAlign = 'center';
  const lines = wrapText(ctx, config.headline, w - 200);
  const startY = (h - lines.length * 56) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, startY + i * 56);
  });

  // Brand name bottom right
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = hexToRgba(config.colors.text, 0.5);
  ctx.textAlign = 'right';
  ctx.fillText(config.brandName, w - 40, h - 25);

  // Accent dot
  ctx.fillStyle = config.colors.primary;
  ctx.beginPath();
  ctx.arc(w - ctx.measureText(config.brandName).width - 55, h - 30, 5, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL('image/png');
}

export function generateInstagramStory(config: VisualConfig): string {
  const { w, h } = DIMENSIONS['instagram-story'];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Full gradient background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, config.colors.background);
  grad.addColorStop(0.5, hexToRgba(config.colors.primary, 0.2));
  grad.addColorStop(1, config.colors.background);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Large decorative circle
  ctx.fillStyle = hexToRgba(config.colors.primary, 0.08);
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.3, 300, 0, Math.PI * 2);
  ctx.fill();

  // Top brand tag
  ctx.fillStyle = hexToRgba(config.colors.primary, 0.2);
  drawRoundedRect(ctx, w / 2 - 100, 120, 200, 40, 20);
  ctx.fill();
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = config.colors.primary;
  ctx.textAlign = 'center';
  ctx.fillText(config.brandName.toUpperCase(), w / 2, 146);

  // KEY TAKEAWAY label
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = config.colors.primary;
  ctx.letterSpacing = '4px';
  ctx.fillText('KEY TAKEAWAY', w / 2, h * 0.3);

  // Main headline
  ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = config.colors.text;
  const lines = wrapText(ctx, config.headline, w - 120);
  const startY = h * 0.38;
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, startY + i * 72);
  });

  // Body text
  if (config.body) {
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = hexToRgba(config.colors.text, 0.7);
    const bodyLines = wrapText(ctx, config.body, w - 120);
    const bodyY = startY + lines.length * 72 + 60;
    bodyLines.slice(0, 4).forEach((line, i) => {
      ctx.fillText(line, w / 2, bodyY + i * 40);
    });
  }

  // CTA at bottom
  if (config.cta) {
    ctx.fillStyle = config.colors.primary;
    drawRoundedRect(ctx, w / 2 - 180, h - 200, 360, 60, 30);
    ctx.fill();
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(config.cta, w / 2, h - 162);
  }

  // Swipe up indicator
  ctx.fillStyle = hexToRgba(config.colors.text, 0.3);
  ctx.font = '16px system-ui, -apple-system, sans-serif';
  ctx.fillText('SWIPE UP', w / 2, h - 60);

  // Arrow
  ctx.strokeStyle = hexToRgba(config.colors.text, 0.3);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 10, h - 80);
  ctx.lineTo(w / 2, h - 90);
  ctx.lineTo(w / 2 + 10, h - 80);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

export function generateBlogFeatured(config: VisualConfig): string {
  const { w, h } = DIMENSIONS['blog-featured'];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  drawBackground(ctx, w, h, config.colors.background, config.colors.primary);

  // Left accent stripe
  const stripeGrad = ctx.createLinearGradient(0, 0, 0, h);
  stripeGrad.addColorStop(0, config.colors.primary);
  stripeGrad.addColorStop(1, config.colors.secondary);
  ctx.fillStyle = stripeGrad;
  ctx.fillRect(0, 0, 8, h);

  // Title
  ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = config.colors.text;
  ctx.textAlign = 'left';
  const titleLines = wrapText(ctx, config.headline, w - 160);
  const titleY = h * 0.3;
  titleLines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, 60, titleY + i * 66);
  });

  // Subtitle
  if (config.body) {
    ctx.font = '26px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = hexToRgba(config.colors.text, 0.6);
    const subLines = wrapText(ctx, config.body, w - 160);
    const subY = titleY + titleLines.length * 66 + 30;
    subLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, 60, subY + i * 36);
    });
  }

  // Brand name bottom left
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = config.colors.primary;
  ctx.textAlign = 'left';
  ctx.fillText(config.brandName, 60, h - 30);

  // Decorative line
  ctx.fillStyle = config.colors.primary;
  ctx.fillRect(60, h - 50, 60, 3);

  return canvas.toDataURL('image/png');
}

export function generateLinkedInCarousel(config: VisualConfig): string[] {
  const { w, h } = DIMENSIONS['linkedin-carousel'];
  const slides = config.slides || [];
  if (slides.length === 0) return [];

  return slides.map((slide, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    const isFirst = index === 0;
    const isLast = index === slides.length - 1;

    drawBackground(ctx, w, h, config.colors.background, config.colors.primary);

    // Slide number indicator
    ctx.fillStyle = hexToRgba(config.colors.primary, 0.15);
    drawRoundedRect(ctx, w - 100, 40, 60, 36, 18);
    ctx.fill();
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = config.colors.primary;
    ctx.textAlign = 'center';
    ctx.fillText(`${index + 1}/${slides.length}`, w - 70, 64);

    // Brand name top left
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = hexToRgba(config.colors.text, 0.4);
    ctx.textAlign = 'left';
    ctx.fillText(config.brandName, 60, 68);

    if (isFirst) {
      // Hook slide — large text
      ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = config.colors.text;
      ctx.textAlign = 'left';
      const lines = wrapText(ctx, slide.headline, w - 120);
      const startY = (h - lines.length * 80) / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, 60, startY + i * 80);
      });

      // Swipe indicator
      ctx.font = '16px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = hexToRgba(config.colors.text, 0.3);
      ctx.textAlign = 'center';
      ctx.fillText('SWIPE \u2192', w / 2, h - 40);
    } else if (isLast) {
      // CTA slide
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = config.colors.text;
      ctx.textAlign = 'center';
      const lines = wrapText(ctx, slide.headline, w - 120);
      const startY = h * 0.3;
      lines.forEach((line, i) => {
        ctx.fillText(line, w / 2, startY + i * 62);
      });

      // CTA button
      ctx.fillStyle = config.colors.primary;
      drawRoundedRect(ctx, w / 2 - 160, h * 0.6, 320, 64, 32);
      ctx.fill();
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(slide.body || 'Learn More', w / 2, h * 0.6 + 40);
    } else {
      // Content slide
      // Headline
      ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = config.colors.text;
      ctx.textAlign = 'left';
      const headLines = wrapText(ctx, slide.headline, w - 120);
      const headY = 140;
      headLines.slice(0, 2).forEach((line, i) => {
        ctx.fillText(line, 60, headY + i * 56);
      });

      // Accent line
      const lineY = headY + headLines.length * 56 + 20;
      ctx.fillStyle = config.colors.primary;
      ctx.fillRect(60, lineY, 80, 4);

      // Body text
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = hexToRgba(config.colors.text, 0.75);
      const bodyLines = wrapText(ctx, slide.body, w - 120);
      const bodyY = lineY + 50;
      bodyLines.slice(0, 8).forEach((line, i) => {
        ctx.fillText(line, 60, bodyY + i * 42);
      });
    }

    // Bottom progress bar
    const barWidth = w / slides.length;
    for (let i = 0; i < slides.length; i++) {
      ctx.fillStyle = i <= index ? config.colors.primary : hexToRgba(config.colors.primary, 0.15);
      ctx.fillRect(i * barWidth + 2, h - 6, barWidth - 4, 4);
    }

    return canvas.toDataURL('image/png');
  });
}

export function generateVisual(config: VisualConfig): string | string[] {
  switch (config.type) {
    case 'quote-card':
      return generateQuoteCard(config);
    case 'twitter-header':
      return generateTwitterHeader(config);
    case 'instagram-story':
      return generateInstagramStory(config);
    case 'blog-featured':
      return generateBlogFeatured(config);
    case 'linkedin-carousel':
      return generateLinkedInCarousel(config);
    default:
      return generateQuoteCard(config);
  }
}
