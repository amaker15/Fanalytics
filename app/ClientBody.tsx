/*
 * Fanalytics - Client Body Wrapper Component
 *
 * This component wraps the application body and ensures consistent
 * styling by setting dark mode classes during client-side hydration.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */

"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased dark";
  }, []);

  return <div className="antialiased dark">{children}</div>;
}
