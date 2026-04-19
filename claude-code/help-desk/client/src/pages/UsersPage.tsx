import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import NavBar from "../components/NavBar";

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

  return (
    <div>
      <NavBar />
      <main className="p-8">
        <h2 className="text-2xl font-semibold text-gray-900">Users</h2>
        <p className="text-gray-500 mt-1">Manage all helpdesk users.</p>

        {isLoading && <p className="mt-6 text-gray-500">Loading...</p>}
        {error && <p className="mt-6 text-red-500">{(error as Error).message}</p>}

        {!isLoading && !error && (
          <div className="mt-6 rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="px-4 py-6 text-center text-gray-500">No users found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
