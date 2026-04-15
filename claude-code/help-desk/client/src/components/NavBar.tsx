import { Link, useNavigate } from "react-router-dom";
import { signOut, useSession } from "../lib/auth-client";

export default function NavBar() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <nav className="flex items-center justify-between px-6 h-14 bg-white border-b text-foreground">
      <span className="font-bold text-lg tracking-wide">Helpdesk</span>
      <div className="flex items-center gap-4">
        {session?.user?.role === "admin" && (
          <Link to="/users" className="text-sm hover:underline">
            Users
          </Link>
        )}
        {session?.user && (
          <>
            <span className="text-sm">{session.user.name}</span>
            <button
              onClick={handleSignOut}
              className="px-3.5 py-1.5 text-sm border border-border rounded cursor-pointer hover:bg-muted"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
