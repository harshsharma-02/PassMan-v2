import { useCallback, useState } from "react";
import "./App.css";
import Navbar from "./Components/Navbar";
import Manager from "./Components/Manager";
import Footer from "./Components/Footer";
import ResetPassword from "./Components/ResetPassword";
import { AuthProvider } from "./context/AuthProvider";

function readResetTokenFromUrl() {
  return new URLSearchParams(window.location.search).get("reset") || "";
}

function App() {
  const [resetToken, setResetToken] = useState(() => readResetTokenFromUrl());

  const clearResetToken = useCallback(() => {
    const path = window.location.pathname || "/";
    window.history.replaceState({}, "", path);
    setResetToken("");
  }, []);

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        {resetToken ? (
          <ResetPassword token={resetToken} onDone={clearResetToken} />
        ) : (
          <Manager />
        )}

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
