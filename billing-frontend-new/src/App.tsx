import "./App.css";
import Navbar from "./components/Navbar";
import { Outlet } from "@tanstack/react-router";

function App() {
  return (
    <div>
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;