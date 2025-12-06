// User Detail Page
export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <h1>User Detail - {id}</h1>
      {/* Add user detail content here */}
    </div>
  );
}