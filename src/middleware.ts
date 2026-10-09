import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const league = request.nextUrl.searchParams.get("league");
  if (!league || request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/leagues/${league}`;
  url.searchParams.delete("league");
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/",
};
