import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { config } from '../proxy';

jest.mock('../src/auth/server', () => ({ auth: jest.fn() }));
jest.mock('../src/app/path', () => ({}));

const matches = (url: string) =>
  unstable_doesMiddlewareMatch({ config, nextConfig: {}, url });

describe('Proxy', () => {
  it('runs on protected, redirected, and aliased paths', () => {
    [
      '/admin',
      '/admin/photos',
      '/admin/photos/abc/edit',
      '/og',
      '/og/all',
      '/tag/private',
      '/tag/private/abc',
      '/library/edit',
      '/photos/abc',
      '/t/street',
    ].forEach(url => expect(matches(url)).toBe(true));
  });
  it('skips public paths', () => {
    [
      '/',
      '/grid',
      '/full',
      '/library',
      '/p/abc',
      '/p/abc/image',
      '/tag/street',
      '/tag/street/abc',
      '/tag/privateer',
      '/photos',
      '/t',
      '/api/auth/session',
      '/_next/static/chunk.js',
      '/_next/image',
      '/favicon.ico',
      '/sign-in',
    ].forEach(url => expect(matches(url)).toBe(false));
  });
});
