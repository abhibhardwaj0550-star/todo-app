import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Auth from "../../Components/Auth";

export default function Register({ setIsAuthenticated }) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${apiBaseUrl}/auth/signup`, values);
      const data = response.data;

      const token = data?.token;
      const name = data?.user?.name || values.name;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("username", name);
        setIsAuthenticated?.(true);
      }

      toast.success(data?.message || "User registered successfully!");
      navigate("/home");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Auth
      title="Create Account"
      buttonText="Register"
      linkText="Already have an account?"
      linkTo="/login"
      showPassword={showPassword}
      toggleShowPassword={toggleShowPassword}
      onSubmit={onSubmit}
      isLoading={isLoading}   // ✅ IMPORTANT
      fields={[
        {
          label: "Name",
          type: "text",
          name: "name",
          placeholder: "Enter name",
          validate: (value) => {
            const nameRegex = /^[A-Za-z\s]+$/;

            if (value.length < 4) {
              return "Name must be at least 4 characters long";
            }

            if (!nameRegex.test(value)) {
              return "Name must contain only alphabets";
            }

            return null;
          },
        },
        {
          label: "Email",
          type: "email",
          name: "email",
          placeholder: "Enter your Email address",
        },
        {
          label: "Password",
          type: "password",
          name: "password",
          placeholder: "Enter your password",
          validate: (value) => {
            if (!strongPasswordRegex.test(value)) {
              return "Password must be 8+ with uppercase, lowercase, number & special.";
            }
            return null;
          },
        },
      ]}
    />
  );
}
