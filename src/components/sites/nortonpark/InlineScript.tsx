/* Inline script that runs while the HTML is parsed, before first paint.
   The type swap avoids React's dev warning about <script> rendered on the
   client (see Next docs: preventing-flash-before-hydration). */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
