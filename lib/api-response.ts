import { NextResponse } from "next/server";

export function jsonError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ error: message }, { status });
}

export function requiredParam(searchParams: URLSearchParams, name: string) {
  const value = searchParams.get(name);
  if (!value) throw new Error(`Missing required query parameter: ${name}`);
  return value;
}
