/**
 * Utilitário de compressão de imagens no navegador via HTML5 Canvas.
 * Evita o estouro do limite de 512 MB do plano gratuito do MongoDB Atlas.
 * Reduz fotos de celulares (5 a 10 MB) para aproximadamente 80 a 150 KB
 * mantendo excelente nitidez para exibição em telas.
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 900,
  quality: number = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Se o arquivo já for muito pequeno (menos de 100 KB), lê diretamente
    if (file.size < 100 * 1024 && file.type === "image/jpeg") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Mantém a proporção (aspect ratio) calculando a escala máxima
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback se não conseguir contexto 2D
          resolve(e.target?.result as string);
          return;
        }

        // Desenha com suavização de interpolação bicúbica
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Exporta em JPEG otimizado
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
