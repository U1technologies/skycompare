/**
 * Carries the per-visitor KAYAK link context (market domain + deeplink code)
 * from the root route's loader down to whichever page renders a search form.
 *
 * A context rather than route loader data on each page, because SearchBox is
 * rendered by more than one route (/ and /link-builder) and neither should have
 * to know how the link is resolved.
 *
 * The value is undefined until the root loader resolves, and stays undefined if
 * it fails. Callers must handle that by falling back to a /go link, which
 * resolves the same destination server-side.
 */
import { createContext, useContext, type ReactNode } from "react";
import type { KayakLinkContext } from "./affiliates";

const Context = createContext<KayakLinkContext | undefined>(undefined);

export function KayakLinkProvider({
  value,
  children,
}: {
  value: KayakLinkContext | undefined;
  children: ReactNode;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** This visitor's KAYAK link context, or undefined if it isn't available yet. */
export function useKayakLinkContext(): KayakLinkContext | undefined {
  return useContext(Context);
}
