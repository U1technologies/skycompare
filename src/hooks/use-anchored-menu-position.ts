import { useLayoutEffect, useState, type RefObject } from "react";

export type AnchoredMenuPosition = { top: number; left: number; width: number };

/**
 * Tracks an anchor element's viewport rect while a floating menu is open, so
 * the menu can be portaled to <body> and positioned with `position: fixed`.
 * Portaling keeps it from being clipped or covered by ancestor sections that
 * have overflow-hidden/isolate/stacking contexts of their own.
 */
export function useAnchoredMenuPosition(open: boolean, anchorRef: RefObject<HTMLElement | null>) {
  const [pos, setPos] = useState<AnchoredMenuPosition | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left, width: r.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, anchorRef]);

  return pos;
}
