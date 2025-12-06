'use client';
// Users Error
export default function UsersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Error loading users!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}