// middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // protect everything under / (except static assets). Adjust as needed.
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};