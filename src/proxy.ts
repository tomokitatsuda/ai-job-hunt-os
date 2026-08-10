export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/", "/companies/:path*", "/tasks/:path*"],
};
