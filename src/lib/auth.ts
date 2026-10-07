import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "fauna_admin_session";
export const ADMIN_DEFAULT_USER = "faunadaserra";
export const ADMIN_DEFAULT_PASSWORD = "fauna2026pi2";

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "fauna-serra-pi2-auth-secret-2026-aracoiaba";

/**
 * Valida o par usuário e senha fornecidos
 */
export function validateAdminCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;

  const expectedUser = (process.env.ADMIN_USER || ADMIN_DEFAULT_USER).trim();
  const expectedPassword = (process.env.ADMIN_PASSWORD || ADMIN_DEFAULT_PASSWORD).trim();

  return username.trim() === expectedUser && password.trim() === expectedPassword;
}

/**
 * Gera um token de sessão com assinatura criptográfica e expiração de 24h
 */
export function createAdminToken(username: string = ADMIN_DEFAULT_USER): string {
  const payload = JSON.stringify({
    u: username,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
  });

  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64url") + "." + hmac;
}

/**
 * Verifica a validade e a integridade de um token de sessão
 */
export function verifyAdminToken(token?: string | null): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [b64, signature] = parts;
  try {
    const payload = Buffer.from(b64, "base64url").toString("utf-8");
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

    // Comparação de tempo constante para evitar ataques de timing
    if (signature.length !== expectedSig.length) return false;
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSig);
    if (!crypto.timingSafeEqual(a, b)) return false;

    const data = JSON.parse(payload);
    if (!data.exp || typeof data.exp !== "number") return false;

    return data.exp > Date.now();
  } catch {
    return false;
  }
}

/**
 * Verifica se a requisição atual possui sessão de admin válida (via next/headers)
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminToken(sessionCookie);
  } catch {
    return false;
  }
}

/**
 * Verifica se uma requisição HTTP de API possui o cookie de sessão válido
 */
export function isRequestAuthenticated(request: Request): boolean {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${ADMIN_COOKIE_NAME}=`));

    if (!match) return false;
    const token = match.substring(`${ADMIN_COOKIE_NAME}=`.length);
    return verifyAdminToken(token);
  } catch {
    return false;
  }
}
