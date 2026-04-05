import React from "react";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
  const { user, logout, ready } = useAuth();

  return (
    <nav className="bg-purple-400 ">
      <div className="mycontainer flex justify-between items-center px-8 py-8 h-14 gap-4">
        <div className="logo font-bold text-2xl shrink-0">
          <span>Pass</span>
          <span className="text-violet-800">Man</span>
          <span className="text-purple-900">
            <lord-icon
              src="https://cdn.lordicon.com/srupsmbe.json"
              trigger="in"
              delay="800"
              state="pinch"
              colors="primary:#000000,secondary:#ffffff"
            ></lord-icon>
          </span>
        </div>
        <div className="flex items-center gap-3 min-w-0">
          {ready && user && (
            <>
              <span
                className="hidden sm:inline text-sm font-medium text-purple-950 truncate max-w-[12rem]"
                title={user.email}
              >
                {user.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-sm font-medium rounded-full px-3 py-1.5 bg-purple-900/15 hover:bg-purple-900/25 text-purple-950 transition-colors"
              >
                Log out
              </button>
            </>
          )}
          <button
            type="button"
            className="border-0 rounded-full hover:shadow-[0_10px_35px_rgba(110,17,176,0.85)] bg-none transition-shadow duration-300 shrink-0"
          >
            <img className="h-10 w-10" src="Icons/github.svg" alt="github logo" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
