import React, { useState } from "react";
import Auth from "../../Components/Auth";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../../firebase.jsx";
import { signInWithPopup } from "firebase/auth";

export default function Login({ setIsAuthenticated }) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const onSubmit = async (values) => {
    try {
      const res = await axios.post(`${apiBaseUrl}/auth/login`, values);
      const data = res.data;

      if (data?.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.name);
        setIsAuthenticated?.(true);

        toast.success(data.message || "Login successful");
        navigate(data.user.role === "admin" ? "/admin" : "/home");
      } else {
        toast.error(data?.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Login error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await axios.post(`${apiBaseUrl}/auth/google-login`, { idToken });
      const data = res.data;

      if (data?.user && data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.name);
        setIsAuthenticated?.(true);

        toast.success("Logged in with Google");
        navigate(data.user.role === "admin" ? "/admin" : "/home");
      } else {
        toast.error("Google login failed");
      }
    } catch (err) {
      toast.error("Google login failed");
    }
  };

  return (
    <Auth
      title="Login"
      buttonText="Login"
      linkText="Don't have an account?"
      linkTo="/register"
      showPassword={showPassword}
      toggleShowPassword={toggleShowPassword}
      onSubmit={onSubmit}
      fields={[
        { label: "Email", type: "email", name: "email", placeholder: "Enter email" },
        {
          label: "Password",
          type: "password", // ✅ must be password
          name: "password",
          placeholder: "Enter password",
          validate: (value) => {
            if (!strongPasswordRegex.test(value)) {
              return "Password must be 8+ chars with uppercase, lowercase, number & special";
            }
            return null;
          },
        },
      ]}
    >
      {/* Google Login Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleGoogleLogin}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:brightness-110"
        >
          Login with Google
        </button>
      </div>
    </Auth>
  );
}
