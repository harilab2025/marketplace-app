// Edit User Page
export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <h1>Edit User - {id}</h1>
      {/* Add edit user form here */}
    </div>
  );
}