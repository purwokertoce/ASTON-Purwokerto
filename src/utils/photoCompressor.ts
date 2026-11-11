/**
 * Photo Compression & Watermarking Utility
 * Compresses images for mobile performance and overlays inspection metadata
 */

interface WatermarkOptions {
  equipmentName: string;
  inspectorName: string;
  checklistId?: string;
  photoType?: string;
}

export async function compressAndWatermarkPhoto(
  fileOrBlob: File | Blob,
  options: WatermarkOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calculate target dimensions (max 1280px to keep file size under 120KB)
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          // Draw base image
          ctx.drawImage(img, 0, 0, width, height);

          // Render metadata watermark footer bar
          const bannerHeight = Math.max(54, Math.round(height * 0.085));
          ctx.fillStyle = 'rgba(15, 23, 42, 0.82)'; // Slate 900 with opacity
          ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

          // Top border of banner
          ctx.fillStyle = '#3b82f6'; // Blue accent
          ctx.fillRect(0, height - bannerHeight, width, Math.max(2, Math.round(height * 0.003)));

          // Current date and time formatted in Indonesian locale
          const now = new Date();
          const dateStr = now.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          const timeStr = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          // Text styling
          const fontSize = Math.max(13, Math.round(bannerHeight * 0.26));
          ctx.fillStyle = '#ffffff';
          ctx.font = `600 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
          ctx.textBaseline = 'middle';

          // Left side: Hotel Engineering & Equipment
          const leftX = Math.round(width * 0.025);
          const line1Y = height - bannerHeight + bannerHeight * 0.35;
          const line2Y = height - bannerHeight + bannerHeight * 0.72;

          ctx.fillText(`HOTEL ENGINEERING ROOFTOP · ${options.equipmentName.toUpperCase()}`, leftX, line1Y);

          // Secondary line
          ctx.fillStyle = '#cbd5e1'; // Slate 300
          const subFontSize = Math.max(11, Math.round(fontSize * 0.85));
          ctx.font = `400 ${subFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
          const inspectorInfo = `Inspector: ${options.inspectorName || 'Duty Technician'} | ${options.photoType ? `Tipe: ${options.photoType}` : ''}`;
          ctx.fillText(inspectorInfo, leftX, line2Y);

          // Right side: Timestamp
          ctx.fillStyle = '#f8fafc';
          ctx.font = `600 ${fontSize}px 'JetBrains Mono', monospace`;
          ctx.textAlign = 'right';
          const rightX = width - Math.round(width * 0.025);
          ctx.fillText(`${dateStr} ${timeStr}`, rightX, line1Y);

          if (options.checklistId) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = `400 ${subFontSize}px 'JetBrains Mono', monospace`;
            ctx.fillText(`ID: ${options.checklistId.slice(0, 10)}`, rightX, line2Y);
          }

          // Export compressed JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(compressedDataUrl);
        } catch (err) {
          console.error('Canvas compression error, fallback to raw', err);
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(fileOrBlob);
  });
}
