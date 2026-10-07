import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Remove acentos, diacríticos e normaliza caracteres para comparação insensível a acentuação.
 * Exemplo: "Tamanduá-bandeira" -> "tamandua-bandeira"
 */
export function normalizarTexto(texto: string): string {
  if (!texto) return "";
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Verifica se um texto contém o termo de busca ignorando acentos, maiúsculas/minúsculas e hífens.
 * Permite buscar tanto "tamandua" quanto "tamanduá", "onca" quanto "onça", "lobo guara" quanto "lobo-guará".
 */
export function correspondeBusca(texto: string, termo: string): boolean {
  if (!termo || !termo.trim()) return true;
  if (!texto) return false;

  const textoNorm = normalizarTexto(texto);
  const termoNorm = normalizarTexto(termo);

  if (textoNorm.includes(termoNorm)) return true;

  // Trata variações de hífens, traços e espaços múltiplos
  const textoSemTraco = textoNorm.replace(/[-_]/g, " ").replace(/\s+/g, " ");
  const termoSemTraco = termoNorm.replace(/[-_]/g, " ").replace(/\s+/g, " ");

  return textoSemTraco.includes(termoSemTraco);
}
