import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import NavBar from "../components/NavBar";
import { Button } from "../components/ui/button";
import CreateUserModal from "../components/CreateUserModal";
import EditUserModal from "../components/EditUserModal";
import UsersTable, { type User } from "../components/UsersTable";

async function fetchUsers(): Promise<User[]> {
  const res = await axios.get<User[]>("/api/users", { withCredentials: true });
  return res.data;
}

export default function UsersPage() {
  const { data: users = [], isLoading, error } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <div>
      <NavBar />
      <main className="p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Users</h2>
            <p className="text-gray-500 mt-1">Manage all helpdesk users.</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>New User</Button>
        </div>
        <CreateUserModal open={createOpen} onOpenChange={setCreateOpen} />
        <EditUserModal
          user={editingUser}
          open={editingUser !== null}
          onOpenChange={(open) => { if (!open) setEditingUser(null); }}
        />
        <UsersTable
          users={users}
          isLoading={isLoading}
          error={error as Error | null}
          onEdit={setEditingUser}
        />
      </main>
    </div>
  );
}
