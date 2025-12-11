// src/TodoList/Navbar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = ({ onLogoutClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname;
  const token = localStorage.getItem("token");

  const linkClass = (path) =>
    `cursor-pointer px-2 py-1 rounded-md transition-all ${current === path
      ? "bg-white text-indigo-700 font-bold shadow-sm"
      : "text-white hover:underline"
    }`;

  return (
    <nav className="flex justify-between bg-indigo-500 text-white py-3 px-5 shadow-md items-center">
      <span className="font-bold text-2xl">iTask</span>
      <div className="Logo cursor-pointer" onClick={() => navigate("/")}>
      </div>
      <ul className="flex gap-4 items-center">
        <li className={linkClass("/home")} onClick={() => navigate("/home")}>
          Home
        </li>
        {token && (
          <li className={linkClass("/todo")} onClick={() => navigate("/todo")}>
            Your Todo
          </li>
        )}
        {token && (
          <li>
            <button
              onClick={onLogoutClick}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 hover:scale-105 transition-transform duration-200"
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
