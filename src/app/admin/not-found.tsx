import { Button } from "@/components/ui/Button";

export default function AdminNotFound() {
  return (
    <div className="pt-12">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-serif text-h2 font-bold text-ink">Not found</h1>
      <p className="mt-3 font-serif text-body text-muted">
        That admin page or record does not exist.
      </p>
      <div className="mt-6">
        <Button href="/admin">Back to the dashboard</Button>
      </div>
    </div>
  );
}
