import NavBar from "../components/NavBar";

export default function HomePage() {
  return (
    <div>
      <NavBar />
      <main className="p-8">
        <h2 className="text-2xl font-semibold text-gray-900">Welcome to Helpdesk</h2>
        <p className="text-gray-500 mt-1">Your tickets will appear here.</p>
      </main>
    </div>
  );
}
