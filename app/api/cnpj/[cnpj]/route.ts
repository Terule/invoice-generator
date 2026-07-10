import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { cnpj: string } }
) {
  const cnpj = params.cnpj.replace(/\D/g, "");

  if (!/^\d{14}$/.test(cnpj)) {
    return NextResponse.json({ message: "Invalid CNPJ." }, { status: 400 });
  }

  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "CNPJ lookup failed." },
      { status: response.status === 404 ? 404 : 502 }
    );
  }

  const payload = await response.json();

  return NextResponse.json({
    legalName: payload.razao_social,
    tradingName: payload.nome_fantasia,
    taxId: payload.cnpj,
    cep: payload.cep,
    street: payload.logradouro,
    number: payload.numero,
    neighborhood: payload.bairro,
    city: payload.municipio,
    state: payload.uf,
    country: "Brazil"
  });
}
