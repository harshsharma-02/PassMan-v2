import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-purple-400 ">
      <div className="mycontainer flex justify-between items-center px-8 py-8 h-14">
        <div className="logo font-bold text-2xl">
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
        {/* <ul>
          <li className="flex gap-6">
            <a href="/" className="font-medium hover:font-bold">
              Home
            </a>
            <a href="#" className="font-medium hover:font-bold">
              About
            </a>
            <a href="#" className="font-medium hover:font-bold">
              Contact
            </a>
            <a href="#" className="font-medium hover:font-bold">
              Pricing
            </a>
          </li>
        </ul> */}
        <button className="border-0 rounded-full hover:shadow-[0_10px_35px_rgba(110,17,176,0.85)]  bg-none transition-shadow duration-300">
          <img className=" h-10 w-10" src="Icons/github.svg" alt="github logo" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
