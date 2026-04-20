import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import NavBar from "../components/NavBar";
import { Button } from "../components/ui/button";
import CreateUserModal from "../components/CreateUserModal";
import UsersTable from "../components/UsersTable";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

async function fetchUsers(): Promise<User[]> {
  const res = await axios.get<User[]>("/api/users", { withCredentials: true });
  return res.data;
}

export default function UsersPage() {
  const { data: users = [], isLoading, error } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <NavBar />
      <main className="p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Users</h2>
            <p className="text-gray-500 mt-1">Manage all helpdesk users.</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>New User</Button>
        </div>
        <CreateUserModal open={modalOpen} onOpenChange={setModalOpen} />
        <UsersTable users={users} isLoading={isLoading} error={error as Error | null} />
      </main>
    </div>
  );
}
