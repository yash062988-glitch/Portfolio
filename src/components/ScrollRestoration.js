"use client";

import { useEffect } from "react";

export default function ScrollRestoration() {
  useEffect(() => {
    // Disable browser scroll restoration to prevent jumping to previous scroll positions on reload
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    
    // Explicitly force scroll position to top on first page mount
    window.scrollTo(0, 0);
  }, []);

  return null;
}
