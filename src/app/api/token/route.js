import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

export async function GET() {
  return NextResponse.json({
    token: uuid(),
  });
}
