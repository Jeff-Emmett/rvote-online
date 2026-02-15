/**
 * Ambient type declarations for @encryptid/sdk subpath imports.
 *
 * The SDK's dist/ directory may not include .d.ts files in all environments
 * (e.g., when built without TypeScript on the server). These declarations
 * prevent "Could not find a declaration file" errors during Docker builds.
 */

declare module "@encryptid/sdk/server/nextjs" {
  export function getEncryptIDSession(
    request: Request,
    options?: Record<string, unknown>
  ): Promise<Record<string, unknown> | null>;

  export function withEncryptID(
    handler: (
      request: Request,
      session: Record<string, unknown>
    ) => Promise<Response>,
    options?: Record<string, unknown>
  ): (request: Request) => Promise<Response>;

  export function createEncryptIDMiddleware(
    config?: Record<string, unknown>
  ): (request: Request) => Promise<Response | null>;

  export function checkSpaceAccess(
    request: Request,
    spaceSlug: string,
    options: Record<string, unknown>
  ): Promise<{
    allowed: boolean;
    readOnly?: boolean;
    reason?: string;
    claims?: Record<string, unknown> | null;
  }>;
}

declare module "@encryptid/sdk/server" {
  export function verifyEncryptIDToken(
    token: string,
    options?: Record<string, unknown>
  ): Promise<{
    sub: string;
    username?: string;
    did?: string;
    exp?: number;
    [key: string]: unknown;
  }>;
}
