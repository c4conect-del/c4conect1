// Keep the original upload; use a smaller image only for on-screen display.
export async function createLogoPreview(file: File): Promise<Blob | null> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.decoding = 'async'; image.src = url;
    await image.decode();
    const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d'); if (!context) return null;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', .86));
    canvas.width = 1; canvas.height = 1;
    return blob && ['image/webp', 'image/png'].includes(blob.type) && blob.size <= 512 * 1024 ? blob : null;
  } catch { return null; }
  finally { URL.revokeObjectURL(url); }
}
