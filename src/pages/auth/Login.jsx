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
    // 1️⃣ Sign in with Google popup
    const result = await signInWithPopup(auth, provider);

    if (!result.user) {
      throw new Error("No user returned from Google popup");
    }

    // 2️⃣ Force refresh ID token
    const idToken = await result.user.getIdToken(true); // true = force refresh
    console.log("ID Token:", idToken); // Debug: check that token is valid

    // 3️⃣ Send token to backend
    const res = await axios.post(`${apiBaseUrl}/auth/google-login`, { idToken });
    console.log("Backend response:", res.data); // Debug: see exact response

    const data = res.data;

    // 4️⃣ Handle successful login
    if (data?.user && data?.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("username", data.user.name);
      setIsAuthenticated?.(true);

      toast.success("Logged in with Google");
      navigate(data.user.role === "admin" ? "/admin" : "/home");
    } else {
      toast.error("Google login failed: Invalid backend response");
    }
  } catch (err) {
    // 5️⃣ Log full error for debugging
    console.error("Google login error:", err.response?.data || err.message);
    toast.error(`Google login failed: ${err.response?.data?.message || err.message}`);
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
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border rounded-lg shadow hover:shadow-lg hover:scale-[1.02] transition duration-200"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Login with Google
        </button>
      </div>

    </Auth>
  );
}
