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
  const [isLoading, setIsLoading] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  // 🔹 Normal Login
  const onSubmit = async (values) => {
    try {
      setIsLoading(true);

      const res = await axios.post(`${apiBaseUrl}/auth/login`, values);
      const data = res.data;

      if (data?.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.name);

        setIsAuthenticated?.(true);
        toast.success("Login successful");

        navigate(data.user.role === "admin" ? "/admin" : "/home");
      } else {
        toast.error(data?.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login error");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Google Login
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(true);

      const res = await axios.post(`${apiBaseUrl}/auth/google-login`, {
        idToken,
      });

      const data = res.data;

      if (data?.token && data?.user) {
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
      toast.error(err.response?.data?.message || "Google login error");
    } finally {
      setIsLoading(false);
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
      isLoading={isLoading}
      fields={[
        {
          label: "Email",
          type: "email",
          name: "email",
          placeholder: "Enter email",
        },
        {
          label: "Password",
          type: "password",
          name: "password",
          placeholder: "Enter password",
          validate: (value) =>
            strongPasswordRegex.test(value)
              ? null
              : "Password must be strong",
        },
      ]}
    >
      {/* Google Button */}
      <button
        type="button"
        disabled={isLoading}
        onClick={handleGoogleLogin}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-60"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          className="w-5 h-5"
          alt="Google"
        />
        Continue with Google
      </button>
    </Auth>
  );
}
