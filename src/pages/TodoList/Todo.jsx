import React, { useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmPop from "./ConfirmPop";
import { useNavigate } from "react-router-dom";
import todoImg from "../../assets/todoImg.jpg";

function Todo({ setIsAuthenticated }) {
  const [todo, setTodo] = useState("");
  const [todoError, setTodoError] = useState("");
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null);

  const [selectedTodoIds, setSelectedTodoIds] = useState([]);
  const [selectedCompletedIds, setSelectedCompletedIds] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: null,
  });

  const [activeTab, setActiveTab] = useState("todo");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const effectRan = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (effectRan.current === false) {
      localStorage.removeItem("todos");
      setTodos([]);

      fetchTodos();
      effectRan.current = true;
    }
  }, []);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/get-todo-list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const serverTodos =
        res?.data?.users?.map((t) => ({
          id: t._id,
          todo: t.taskname,
          iscompleted: t.iscompleted,
          createdAt: t.createdAt,
        })) || [];

      setTodos(serverTodos);
      toast.success("Todos loaded successfully!");
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Failed to fetch todos");
    }
  };

  const handleEditClick = (id) => {
    const t = todos.find((i) => i.id === id);
    if (!t) return;
    setTodo(t.todo);
    setEditId(id);
    setTodoError("");
    setActiveTab("todo");
  };

  const openConfirm = (title, message, onConfirm) => {
    setConfirmConfig({ title, message, onConfirm });
    setConfirmOpen(true);
  };

  const handleConfirmYes = () => {
    if (confirmConfig.onConfirm) {
      confirmConfig.onConfirm();
    }
    setConfirmOpen(false);
  };

  const handleConfirmNo = () => {
    setConfirmOpen(false);
  };

  const markTodoAsCompleted = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const todoToUpdate = todos.find((t) => t.id === id);
      if (!todoToUpdate) return;

      const res = await axios.put(
        `${API_BASE_URL}/edit-todo/${id}`,
        {
          taskname: todoToUpdate.todo,
          iscompleted: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data;

      const newTodos = todos.map((t) =>
        t.id === id
          ? {
            id: updated._id,
            todo: updated.taskname,
            iscompleted: updated.iscompleted,
            createdAt: updated.createdAt,
          }
          : t
      );

      setTodos(newTodos);
      setSelectedTodoIds((prev) => prev.filter((sid) => sid !== id));
      toast.success("Todo moved to completed!");
    } catch (error) {
      console.error("Error marking todo as completed:", error);
      toast.error("Failed to move todo to completed");
    }
  };

  const markSelectedAsCompleted = async () => {
    if (selectedTodoIds.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const selectedTodos = todos.filter((t) =>
        selectedTodoIds.includes(t.id)
      );

      await Promise.all(
        selectedTodos.map((t) =>
          axios.put(
            `${API_BASE_URL}/edit-todo/${t.id}`,
            {
              taskname: t.todo,
              iscompleted: true,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      const newTodos = todos.map((t) =>
        selectedTodoIds.includes(t.id) ? { ...t, iscompleted: true } : t
      );

      setTodos(newTodos);
      setSelectedTodoIds([]);
      toast.success("Selected todos moved to completed!");
    } catch (error) {
      console.error("Error marking selected as completed:", error);
      toast.error("Failed to move selected todos");
    }
  };

  const deleteTodoById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/delete-todo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newTodos = todos.filter((item) => item.id !== id);
      setTodos(newTodos);

      setSelectedTodoIds((prev) => prev.filter((sid) => sid !== id));
      setSelectedCompletedIds((prev) => prev.filter((sid) => sid !== id));

      toast.success("Todo deleted!");
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete todo");
    }
  };

  const deleteSelectedTodos = async (ids) => {
    if (ids.length === 0) return;

    try {
      const token = localStorage.getItem("token");

      await Promise.all(
        ids.map((id) =>
          axios.delete(`${API_BASE_URL}/delete-todo/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      const newTodos = todos.filter((item) => !ids.includes(item.id));
      setTodos(newTodos);

      setSelectedTodoIds((prev) => prev.filter((sid) => !ids.includes(sid)));
      setSelectedCompletedIds((prev) =>
        prev.filter((sid) => !ids.includes(sid))
      );

      toast.success("Selected todos deleted!");
    } catch (error) {
      console.error("Error deleting selected todos:", error);
      toast.error("Failed to delete selected todos");
    }
  };

  const handleMoveSelectedToCompleted = () => {
    if (selectedTodoIds.length === 0) return;

    openConfirm(
      "Move to completed",
      "Are you sure you want to move selected todos to completed?",
      () => markSelectedAsCompleted()
    );
  };

  const handleDeleteSelectedTodoSide = () => {
    if (selectedTodoIds.length === 0) return;

    openConfirm(
      "Delete Todos",
      "Are you sure you want to permanently delete selected todos?",
      () => deleteSelectedTodos(selectedTodoIds)
    );
  };

  const handleDeleteSelectedCompletedSide = () => {
    if (selectedCompletedIds.length === 0) return;

    openConfirm(
      "Delete Completed Todos",
      "Are you sure you want to permanently delete selected completed todos?",
      () => deleteSelectedTodos(selectedCompletedIds)
    );
  };

  const hasAlphabet = (str) => /[a-zA-Z]/.test(str);

  const validateTodo = (value) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setTodoError("Todo is required.");
      return false;
    }

    if (trimmed.length <= 3) {
      setTodoError("Todo must be more than 3 characters.");
      return false;
    }

    if (!hasAlphabet(trimmed)) {
      setTodoError("Todo must contain at least one alphabet (A-Z).");
      return false;
    }

    setTodoError("");
    return true;
  };

  const handleAddOrUpdate = async () => {
    const trimmed = todo.trim();

    const isValid = validateTodo(trimmed);
    if (!isValid) return;

    if (editId) {
      try {
        const token = localStorage.getItem("token");
        const existing = todos.find((t) => t.id === editId);

        const res = await axios.put(
          `${API_BASE_URL}/edit-todo/${editId}`,
          {
            taskname: trimmed,
            iscompleted: existing ? existing.iscompleted : false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const updated = res.data;

        const newTodos = todos.map((t) =>
          t.id === editId
            ? {
              id: updated._id,
              todo: updated.taskname,
              iscompleted: updated.iscompleted,
              createdAt: updated.createdAt,
            }
            : t
        );

        setTodos(newTodos);
        setTodo("");
        setEditId(null);
        toast.success("Todo updated!");
      } catch (error) {
        console.error("Error updating todo:", error);
        toast.error("Failed to update todo");
      }
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_BASE_URL}/add-todo`,
        { taskname: trimmed, iscompleted: false },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const created = res.data;
      const newTodo = {
        id: created._id,
        todo: created.taskname,
        iscompleted: created.iscompleted,
        createdAt: created.createdAt,
      };

      const newTodos = [...todos, newTodo];
      setTodos(newTodos);
      setTodo("");
      setTodoError("");
      toast.success("Todo added successfully!");
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Todo is already Exists");
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setTodo(value);
    validateTodo(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddOrUpdate();
    }
  };

  const handleSelectTodo = (id, checked) => {
    if (checked) {
      setSelectedTodoIds((prev) => [...prev, id]);
    } else {
      setSelectedTodoIds((prev) => prev.filter((sid) => sid !== id));
    }
  };

  const handleSelectCompleted = (id, checked) => {
    if (checked) {
      setSelectedCompletedIds((prev) => [...prev, id]);
    } else {
      setSelectedCompletedIds((prev) => prev.filter((sid) => sid !== id));
    }
  };

  const handleSelectAllTodo = (checked, list) => {
    if (checked) {
      setSelectedTodoIds(list.map((t) => t.id));
    } else {
      setSelectedTodoIds([]);
    }
  };

  const handleSelectAllCompleted = (checked, list) => {
    if (checked) {
      setSelectedCompletedIds(list.map((t) => t.id));
    } else {
      setSelectedCompletedIds([]);
    }
  };

  const doLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
    navigate("/login");
  };

  const handleLogoutClick = () => {
    openConfirm("Logout", "Are you sure you want to logout?", () => doLogout());
  };

  const pendingTodos = todos.filter((t) => !t.iscompleted);
  const completedTodos = todos.filter((t) => t.iscompleted);

  const allTodoSelected =
    pendingTodos.length > 0 &&
    pendingTodos.every((t) => selectedTodoIds.includes(t.id));

  const allCompletedSelected =
    completedTodos.length > 0 &&
    completedTodos.every((t) => selectedCompletedIds.includes(t.id));

  return (
    <div
      style={{
        backgroundImage: `url(${todoImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <Navbar onLogoutClick={handleLogoutClick} />

      <div className="mx-auto my-5 rounded-xl p-4 sm:p-5 min-h-[80vh]
  w-full sm:max-w-[95%] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl
  bg-gradient-to-r from-sky-700/60 via-emerald-400/60 to-yellow-300/60">
        <div className="flex w-full max-w-md mx-auto gap-3 mb-4">
          <button
            onClick={() => {
              setActiveTab("todo");
              setSelectedCompletedIds([]);
            }}
            className={`flex-1 py-2 rounded-full text-sm font-bold text-center ${activeTab === "todo"
              ? "bg-violet-800 text-white"
              : "bg-white/60 text-black"
              }`}
          >
            Todo
          </button>
          <button
            onClick={() => {
              setActiveTab("completed");
              setSelectedTodoIds([]);
            }}
            className={`flex-1 py-2 rounded-full text-sm font-bold text-center ${activeTab === "completed"
              ? "bg-violet-800 text-white"
              : "bg-white/60 text-black"
              }`}
          >
            Completed Todo
          </button>
        </div>

        {/* ONLY SHOW HEADING + INPUT WHEN ON TODO TAB */}
        {activeTab === "todo" && (
          <>
            <h1 className="font-bold text-center text-xl sm:text-2xl md:text-4xl">
              iTask - Manage your todo at one place
            </h1>

            {/* Add / Edit */}
            <div className="addTodo my-5 flex flex-col gap-4">
              <h2 className="text-lg font-bold">
                {editId ? "Edit Todo" : "Add a Todo"}
              </h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="w-full">
                  <input
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    value={todo}
                    type="text"
                    className="w-full rounded-full px-5 py-2 border-1 bg-white shadow-black"
                    placeholder="Write your todo here..."
                  />
                  {todoError && (
                    <p className="text-red-600 text-sm mt-1 ml-2">
                      {todoError}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleAddOrUpdate}
                  className="bg-violet-800 md:mx-2 rounded-full hover:bg-violet-950 text-sm font-bold text-white px-5 h-10 md:h-10 whitespace-nowrap self-start md:self-center"
                >
                  {editId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* TAB CONTENT */}
        {activeTab === "todo" && (
          <div className="bg-white/30 rounded-lg p-3">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allTodoSelected}
                  onChange={(e) =>
                    handleSelectAllTodo(e.target.checked, pendingTodos)
                  }
                />
                <span>Todo</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleMoveSelectedToCompleted}
                  disabled={selectedTodoIds.length === 0}
                  className="bg-violet-800 hover:bg-violet-950 disabled:bg-violet-400 text-white text-sm font-bold px-3 py-1 rounded-md"
                >
                  Move to Completed
                </button>
                <button
                  onClick={handleDeleteSelectedTodoSide}
                  disabled={selectedTodoIds.length === 0}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-bold px-3 py-1 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>

            <h2 className="text-lg font-bold mt-3">Your Todos</h2>
            <div className="todos max-h-[50vh] overflow-y-auto">
              {pendingTodos.length === 0 && (
                <div className="m-5">No todos to display</div>
              )}
              {pendingTodos.map((item) => (
                <div
                  key={item.id}
                  className="todo flex flex-col md:flex-row my-3 justify-between md:items-center bg-white/40 rounded-lg p-3"
                >
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <input
                      type="checkbox"
                      checked={selectedTodoIds.includes(item.id)}
                      onChange={(e) =>
                        handleSelectTodo(item.id, e.target.checked)
                      }
                    />
                    <div className="break-words">{item.todo}</div>
                    <div className="break-words">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : ""}
                    </div>
                  </div>
                  <div className="buttons flex mt-3 md:mt-0">
                    <button
                      onClick={() => handleEditClick(item.id)}
                      className="bg-violet-800 hover:bg-violet-950 p-2 py-1 text-sm font-bold text-white rounded-md mx-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        openConfirm(
                          "Move to completed",
                          "Are you sure you want to move this todo to completed?",
                          () => markTodoAsCompleted(item.id)
                        )
                      }
                      className="bg-violet-800 hover:bg-violet-950 p-2 py-1 text-sm font-bold text-white rounded-md mx-1"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "completed" && (
          <div className="bg-white/30 rounded-lg p-3">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allCompletedSelected}
                  onChange={(e) =>
                    handleSelectAllCompleted(e.target.checked, completedTodos)
                  }
                />
                <span>Completed Todo</span>
              </div>

              <button
                onClick={handleDeleteSelectedCompletedSide}
                disabled={selectedCompletedIds.length === 0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-bold px-3 py-1 rounded-md"
              >
                Delete
              </button>
            </div>

            <h2 className="text-lg font-bold mt-3">Completed Tasks</h2>
            <div className="todos max-h-[50vh] overflow-y-auto">
              {completedTodos.length === 0 && (
                <div className="m-5">No completed todos to display</div>
              )}
              {completedTodos.map((item) => (
                <div
                  key={item.id}
                  className="todo flex flex-col md:flex-row gap-3 my-3 justify-between md:items-center bg-white/40 rounded-lg p-3"
                >
                  <div className="flex gap-3 items-start md:items-center">
                    <input
                      type="checkbox"
                      checked={selectedCompletedIds.includes(item.id)}
                      onChange={(e) =>
                        handleSelectCompleted(item.id, e.target.checked)
                      }
                    />
                    <div className="break-words">{item.todo}</div>
                    <div className="break-words">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : ""}
                    </div>
                  </div>
                  <div className="buttons flex flex-wrap gap-2 mt-3 md:mt-0">
                    <button
                      onClick={() =>
                        openConfirm(
                          "Delete Todo",
                          "Are you sure you want to permanently delete this todo?",
                          () => deleteTodoById(item.id)
                        )
                      }
                      className="bg-violet-800 hover:bg-violet-950 p-2 py-1 text-sm font-bold text-white rounded-md mx-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmPop
        open={confirmOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={handleConfirmYes}
        onCancel={handleConfirmNo}
      />
    </div>
  );
}

export default Todo;
