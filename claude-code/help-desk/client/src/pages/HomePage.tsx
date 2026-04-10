import NavBar from "../components/NavBar";

export default function HomePage() {
  return (
    <div>
      <NavBar />
      <main style={{ padding: "2rem" }}>
        <h2>Welcome to Helpdesk</h2>
        <p>Your tickets will appear here.</p>
      </main>
    </div>
  );
}
