'use client';
// Dashboard Global Error
export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Dashboard Error!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}