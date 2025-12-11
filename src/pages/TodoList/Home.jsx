// 📁 src/TodoList/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";

export default function Home() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  const [suggestion, setSuggestion] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedbackAlreadySubmitted, setFeedbackAlreadySubmitted] = useState(false);

  // ---------------- SYNC LOCAL STORAGE ----------------
  useEffect(() => {
    const onStorage = () => setUsername(localStorage.getItem("username") || "");
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ---------------- FETCH FEEDBACK ----------------
  useEffect(() => {
    if (!token) return;
    checkFeedback();
  }, [token]);

  const checkFeedback = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/feedback/user-feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { hasFeedback, suggestion, rating } = res.data;

      setFeedbackAlreadySubmitted(hasFeedback);

      if (hasFeedback) {
        setSuggestion(suggestion || "");
        setRating(rating || 0);
      }

      localStorage.setItem("feedbackSubmitted", hasFeedback);
    } catch (error) {
      console.error("Error checking feedback:", error);
      setFeedbackAlreadySubmitted(false);
      localStorage.setItem("feedbackSubmitted", "false");
    }
  };

  // ---------------- HANDLERS ----------------
  const handleGetStarted = () => {
    if (token) navigate("/todo");
    else navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("feedbackSubmitted");

    navigate("/login");
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!suggestion.trim() || rating === 0) {
      alert("Please fill both suggestion and rating.");
      return;
    }

    if (!token) {
      alert("You must be logged in to submit feedback.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/feedback/add-feedback`,
        { suggestion, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitted(true);
      setFeedbackAlreadySubmitted(true);
      localStorage.setItem("feedbackSubmitted", "true");

      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to submit feedback.";
      setErrorMessage(msg);
      alert(msg);
    }
  };

  // ---------------- STAR COMPONENT ----------------
  const Star = ({ index }) => {
    const filled = (hoverRating || rating) >= index;
    return (
      <button
        type="button"
        disabled={feedbackAlreadySubmitted}
        onClick={() => setRating(index)}
        onMouseEnter={() => setHoverRating(index)}
        onMouseLeave={() => setHoverRating(0)}
        className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${feedbackAlreadySubmitted ? "cursor-not-allowed" : ""
          }`}
        aria-label={`${index} star`}
      >
        <span className={filled ? "text-yellow-400" : "text-gray-300"}>★</span>
      </button>
    );
  };

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-200 to-purple-200 flex flex-col">
      <Navbar onLogoutClick={handleLogout} />

      <div className="flex items-center justify-center p-6 flex-1">
        <div className="bg-white shadow-2xl rounded-3xl p-12 max-w-2xl w-full text-center transform transition-all hover:scale-105 duration-300">
          <h1 className="text-5xl font-extrabold text-indigo-800 mb-6">
            Welcome to iTask
            {username && (
              <span className="block text-pink-600 mt-2 text-4xl">{username}</span>
            )}
          </h1>

          <p className="text-gray-700 mb-4 text-lg">
            Organize your tasks, stay focused, and boost your productivity.
          </p>

          <p className="text-gray-600 mb-6 text-lg">
            Manage all your todos in one place. Easily add, edit, and delete tasks.
          </p>

          <ul className="text-gray-700 mb-8 text-left list-disc list-inside space-y-1">
            <li>Add and manage your daily tasks</li>
            <li>Track progress and complete tasks</li>
            <li>Edit or delete todos anytime</li>
            <li>Stay productive and organized</li>
          </ul>

          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            Get Started
          </button>

          <div className="mt-10 text-left">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
              Feedback
            </h2>
            
            {feedbackAlreadySubmitted && (
              <p className="text-green-600 text-center text-lg mt-4">
                ⭐ You have already submitted your feedback. Thank you!
              </p>
            )}

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Suggestion</label>
                <textarea
                  className={`w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${feedbackAlreadySubmitted ? "cursor-not-allowed" : "cursor-text"
                    }`}
                  rows="3"
                  placeholder="Tell us how we can improve iTask..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  disabled={feedbackAlreadySubmitted}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} index={i} />
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-600">{rating} / 5</span>
                  )}
                </div>
              </div>

              {!feedbackAlreadySubmitted && (
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-semibold shadow-md transition-all"
                >
                  Submit Feedback
                </button>
              )}

              {submitted && (
                <p className="text-green-600 text-center mt-2">
                  Thank you for your feedback! 😊
                </p>
              )}

              {errorMessage && !submitted && (
                <p className="text-red-600 text-center mt-2">{errorMessage}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
