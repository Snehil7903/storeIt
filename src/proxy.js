import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/api/download/(.*)' 
]);

export default clerkMiddleware((auth, request) => {
  // auth is an object, so we call .protect() directly on it
  if (!isPublicRoute(request)) {
    auth.protect(); // <--- Removed the () after auth
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};