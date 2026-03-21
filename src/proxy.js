import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define your public routes
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/api/download/(.*)' 
]);

export default clerkMiddleware(async (auth, request) => {
  // 2. Use await auth() to get the latest session state (v6+ standard)
  const session = await auth();

  // 3. If it's not a public route, protect it.
  // Clerk's .protect() is smart: if no user is found, it automatically
  // redirects to your CLERK_SIGN_IN_URL defined in .env
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  // 4. Ensure the matcher doesn't skip the Google callback routes
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};