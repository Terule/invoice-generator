import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { cep: string } }
) {
  const cep = params.cep.replace(/\D/g, "");

  if (!/^\d{8}$/.test(cep)) {
    return NextResponse.json({ message: "Invalid CEP." }, { status: 400 });
  }

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json({ message: "CEP lookup failed." }, { status: 502 });
  }

  const payload = await response.json();

  if (payload.erro) {
    return NextResponse.json({ message: "CEP not found." }, { status: 404 });
  }

  return NextResponse.json(payload);
}
