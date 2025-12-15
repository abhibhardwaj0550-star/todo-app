import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Auth({
  title,
  fields,
  buttonText,
  linkText,
  linkTo,
  onSubmit,
  showPassword,
  toggleShowPassword,
  children, // ✅ for Google button or other custom content
}) {
  const [values, setValues] = useState(
    fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {})
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError(null);
  };

  const validateAll = () => {
    const newErrors = {};
    fields.forEach((field) => {
      const value = (values[field.name] || "").trim();

      if (!value) newErrors[field.name] = `${field.label} is required`;

      if (field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) newErrors[field.name] = "Invalid email";
      }

      if (field.type === "password" && value.length < 6)
        newErrors[field.name] = "Password must be at least 6 characters";

      if (field.validate) {
        const customError = field.validate(value, values);
        if (customError) newErrors[field.name] = customError;
      }
    });

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateAll();
    if (Object.keys(newErrors).length > 0) {
      setFormError("Please fix the errors above.");
      return;
    }
    setFormError(null);
    onSubmit(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">{title}</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {fields.map((f) => {
            const isPassword = f.type === "password";

            return (
              <div key={f.name}>
                <label className="text-sm font-medium text-slate-600">{f.label}</label>

                <div className="relative">
                  <input
                    type={isPassword ? (showPassword ? "text" : "password") : f.type}
                    name={f.name}
                    placeholder={f.placeholder}
                    value={values[f.name] || ""}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 mt-1 rounded-lg border outline-none ${errors[f.name]
                        ? "border-red-500 focus:ring-2 focus:ring-red-400"
                        : "border-slate-300 focus:ring-2 focus:ring-indigo-400"
                      } ${isPassword ? "pr-10" : ""}`}
                  />

                  {isPassword && (
                    <span
                      onClick={toggleShowPassword}
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-slate-500"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </span>
                  )}
                </div>

                {errors[f.name] && (
                  <p className="text-xs text-red-500 mt-1">{errors[f.name]}</p>
                )}
              </div>
            );
          })}

          {formError && (
            <p className="text-sm text-red-600 text-center">{formError}</p>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:brightness-110"
          >
            {buttonText}
          </button>
        </form>

        {/* Render children like Google login button */}
        {children && <div className="mt-4">{children}</div>}

        {linkText && linkTo && (
          <p className="mt-4 text-center text-sm">
            {linkText}
            <Link to={linkTo} className="text-indigo-600 font-medium ml-1">
              Click here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

