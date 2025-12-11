// src/pages/Reset.jsx
import React from "react";
import Auth from "../../Components/Auth";

export default function Reset() {
  const onSubmit = (values) => {
    console.log("Password reset", values);
    // call your backend reset-password API here
  };

  return (
    <Auth
      title="Reset Password"
      buttonText="Reset Password"
      fields={[
        {
          label: "New Password",
          type: "password",
          name: "newPassword",
          placeholder: "Enter new password",
        },
        {
          label: "Confirm Password",
          type: "password",
          name: "confirmPassword",
          placeholder: "Confirm new password",
          validate: (value, allValues) => {
            if (value !== allValues["newPassword"]) {
              return "Passwords do not match";
            }
            return null;
          },
        },
      ]}
      onSubmit={onSubmit}
    />
  );
}
