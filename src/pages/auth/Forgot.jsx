import React from "react";
import Auth from "../../Components/Auth";

export default function Forgot() {
  const onSubmit = (values) => {
    console.log("Send reset email", values);
  };

  return (
    <Auth
      title="Forgot Password"
      buttonText="Send Reset Link"
      linkText="Go back to Login?"
      linkTo="/login"
      fields={[
        {
          label: "Email",
          type: "email",
          name: "email",
          placeholder: "Enter your email",
        },
      ]}
      onSubmit={onSubmit}
    />
  );
}
