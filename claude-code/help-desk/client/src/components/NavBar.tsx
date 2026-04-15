import { useNavigate } from "react-router-dom";
import { signOut, useSession } from "../lib/auth-client";

export default function NavBar() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <nav className="flex items-center justify-between px-6 h-14 bg-blue-900 text-white">
      <span className="font-bold text-lg tracking-wide">Helpdesk</span>
      <div className="flex items-center gap-4">
        {session?.user && (
          <>
            <span className="text-sm">{session.user.name}</span>
            <button
              onClick={handleSignOut}
              className="px-3.5 py-1.5 text-sm border border-white/50 rounded cursor-pointer hover:bg-white/10"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
