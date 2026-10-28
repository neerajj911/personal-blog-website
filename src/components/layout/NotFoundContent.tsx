import { Button } from "@/components/ui/Button";

export function NotFoundContent() {
  return (
    <div className="page-container pt-18 pb-18">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-serif text-title font-bold text-ink">Page not found</h1>
      <p className="mt-4 max-w-[40rem] font-serif text-lg leading-[1.6] text-muted">
        There is nothing at this address. It may have been moved, unpublished, or never
        existed.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/">Back to home</Button>
        <Button href="/articles" variant="secondary">
          Browse articles
        </Button>
      </div>
    </div>
  );
}
