import { NextResponse } from "next/server";
import {
  validateAdminCredentials,
  createAdminToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const usuario = body.usuario || body.username;
    const senha = body.senha || body.password;

    if (!usuario || !senha) {
      return NextResponse.json(
        { error: "Informe o usuário e a senha." },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(usuario, senha);
    if (!isValid) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos." },
        { status: 401 }
      );
    }

    const token = createAdminToken(usuario.trim());
    const response = NextResponse.json({
      sucesso: true,
      mensagem: "Autenticação realizada com sucesso.",
      usuario: usuario.trim(),
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 horas
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro interno no servidor de autenticação.", details: error.message },
      { status: 500 }
    );
  }
}
