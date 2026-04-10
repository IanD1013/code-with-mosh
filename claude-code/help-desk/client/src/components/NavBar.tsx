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
    <nav style={styles.nav}>
      <span style={styles.brand}>Helpdesk</span>
      <div style={styles.right}>
        {session?.user && (
          <>
            <span style={styles.name}>{session.user.name}</span>
            <button onClick={handleSignOut} style={styles.button}>
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1.5rem",
    height: "56px",
    backgroundColor: "#1e3a8a",
    color: "#fff",
  },
  brand: {
    fontWeight: 700,
    fontSize: "1.1rem",
    letterSpacing: "0.025em",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  name: {
    fontSize: "0.9rem",
  },
  button: {
    padding: "0.375rem 0.875rem",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.5)",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
};
