import { auth } from './src/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  PATH_ADMIN,
  PATH_ADMIN_PHOTOS,
  PATH_OG,
  PATH_OG_SAMPLE,
} from './src/app/path';

export function proxy(req: NextRequest, res:NextResponse) {
  const pathname = req.nextUrl.pathname;

  if (pathname === PATH_ADMIN) {
    return NextResponse.redirect(new URL(PATH_ADMIN_PHOTOS, req.url));
  } else if (pathname === PATH_OG) {
    return NextResponse.redirect(new URL(PATH_OG_SAMPLE, req.url));
  }

  // Also rewrites path aliases, e.g., /t/* to /tag/*, once authorized
  return auth(
    req as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
  );
}

export const config = {
  // Only run where the proxy has work to do: protected paths
  // (see `isPathProtected`), redirects, and path aliases
  // (see `getPathAliasTarget`). Every other request, including
  // cached pages, images, and prefetches, skips the proxy entirely,
  // so it no longer costs a function invocation.
  matcher: [
    '/admin/:path*',
    '/og/:path*',
    '/tag/private/:path*',
    '/library/edit/:path*',
    '/photos/:path+',
    '/t/:path+',
  ],
};
