import { ReactNode } from 'react';

// Returning an empty array keeps nested photo routes static: each path is
// rendered on its first request, then served from cache until revalidated
export const generateStaticParams = async () => [];

export default function OnDemandStaticLayout({
  children,
}: {
  children: ReactNode
}) {
  return children;
}
