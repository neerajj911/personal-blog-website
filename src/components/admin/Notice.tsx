/** One-line confirmation after a redirect, e.g. "Saved." */
export function Notice({ children }: { children: string }) {
  return (
    <p
      role="status"
      className="mb-6 rounded-panel border border-green bg-panel px-4 py-3 text-ui font-medium text-green"
    >
      {children}
    </p>
  );
}
