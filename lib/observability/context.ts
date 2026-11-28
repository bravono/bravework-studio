import { AsyncLocalStorage } from "async_hooks";

export interface RequestContext {
  requestId: string;
  method?: string;
  path?: string;
  userId?: string;
  ip?: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Executes a callback within an AsyncLocalStorage request context so that
 * downstream logger calls and Sentry events automatically inherit correlation IDs.
 */
export function runWithRequestContext<T>(
  context: RequestContext,
  fn: () => T,
): T {
  return requestContextStorage.run(context, fn);
}

/**
 * Returns the active request context for the current async execution chain, if any.
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

/**
 * Attaches an authenticated user ID to the active request context, if one exists.
 */
export function setRequestContextUser(userId: string): void {
  const store = requestContextStorage.getStore();
  if (store) {
    store.userId = userId;
  }
}
