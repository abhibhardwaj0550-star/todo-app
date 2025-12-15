import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Auth from "../../Components/Auth";

export default function Register({ setIsAuthenticated }) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const onSubmit = async (values) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/signup`, values);
      console.log("Register response:", response.data);

      const token = response.data?.token;
      const name = response.data?.user?.name || values.name; // store the registered name

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("username", name); // 🔥 store username
        if (setIsAuthenticated) setIsAuthenticated(true);
      }

      toast.success(
        response.data?.message || "User registered successfully!"
      );

      navigate("/home");
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";
      toast.error(msg);
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
          placeholder: " Enter your Email address",
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
      onSubmit={onSubmit}
    />
  );
}
