import React, { useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmPop from "../Components/ConfirmPop";

function Todo() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: null,
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      fetchTodos();
      effectRan.current = true;
    }
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get-todo-list`);
      console.log(res.data.users, "==res");

      const serverTodos = res?.data?.users?.map((t) => ({
        id: t._id,
        todo: t.taskname,
        iscompleted: t.iscompleted, 
      }));

      setTodos(serverTodos);
      saveToLs(serverTodos);
      toast.success("Todos loaded successfully!");
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Failed to fetch todos");
    }
  };

  const saveToLs = (newTodos) => {
    localStorage.setItem("todos", JSON.stringify(newTodos));
  };

  const handleEditClick = (id) => {
    const t = todos.find((i) => i.id === id);
    if (!t) return;
    setTodo(t.todo);
    setEditId(id);
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
  
  const deleteTodoById = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/delete-todo/${id}`);
      const newTodos = todos.filter((item) => item.id !== id);
      setTodos(newTodos);
      saveToLs(newTodos);

      
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));

      toast.success("Todo deleted!");
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete todo");
    }
  };

  
  const handleDelete = (e, id) => {
    openConfirm(
      "Delete Todo",
      "Are you sure you want to delete this todo?",
      () => deleteTodoById(id)
    );
  };

  const deleteSelectedTodos = async () => {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((id) =>
          axios.delete(`${API_BASE_URL}/delete-todo/${id}`)
        )
      );

      const newTodos = todos.filter((item) => !selectedIds.includes(item.id));
      setTodos(newTodos);
      saveToLs(newTodos);
      setSelectedIds([]);

      toast.success("Selected todos deleted!");
    } catch (error) {
      console.error("Error deleting selected todos:", error);
      toast.error("Failed to delete selected todos");
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    openConfirm(
      "Delete Selected Todos",
      "Are you sure you want to delete all selected todos?",
      () => deleteSelectedTodos()
    );
  };

  const handleAddOrUpdate = async () => {
    if (!todo.trim()) return;

    // Update
    if (editId) {
      try {
        const res = await axios.put(`${API_BASE_URL}/edit-todo/${editId}`, {
          taskname: todo,
        });

        const updated = res.data;

        const newTodos = todos.map((t) =>
          t.id === editId
            ? {
                id: updated._id,
                todo: updated.taskname,
                iscompleted: updated.iscompleted,
              }
            : t
        );

        setTodos(newTodos);
        saveToLs(newTodos);
        setTodo("");
        setEditId(null);
        toast.success("Todo updated!");
      } catch (error) {
        console.error("Error updating todo:", error);
        toast.error("Failed to update todo");
      }
      return;
    }

    // Add
    try {
      const res = await axios.post(`${API_BASE_URL}/add-todo`, {
        taskname: todo,
        iscompleted: false,
      });

      const created = res.data;
      const newTodo = {
        id: created._id,
        todo: created.taskname,
        iscompleted: created.iscompleted,
      };

      const newTodos = [...todos, newTodo];
      setTodos(newTodos);
      setTodo("");
      saveToLs(newTodos);
      toast.success("Todo added successfully!");
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Failed to add todo");
    }
  };

  const handleChange = (e) => {
    setTodo(e.target.value);
  };

  const handleSelect = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(todos.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const allSelected =
    todos.length > 0 && selectedIds.length === todos.length;

  return (
    <div>
      <ToastContainer
        position="bottom-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Navbar />
      <div className="mx-3 container md:mx-auto my-5 rounded-xl p-5 bg-violet-100 min-h-[80vh] w-1/2">
        <h1 className="font-bold text-center text-4xl">
          iTask - Manage your todo at one place
        </h1>

        <div className="addTodo my-5 flex-col gap-4 ">
          <h2 className="text-lg font-bold">
            {editId ? "Edit Todo" : "Add a Todo"}
          </h2>
          <div className="flex">
            <input
              onChange={handleChange}
              value={todo}
              type="text"
              className="w-full rounded-full px-5 py-2 border-1 bg-white shadow-black"
            />
            <button
              onClick={handleAddOrUpdate}
              disabled={todo.length <= 3}
              className="bg-violet-800 mx-2 rounded-full hover:bg-violet-950 disabled:bg-violet-700 p-2 py-1 text-sm font-bold text-white"
            >
              {editId ? "Update" : "Save"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <span>Select All Todo </span>

          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-bold px-3 py-1 rounded-md"
          >
            Delete Todo
          </button>
        </div>

        <h2 className="text-lg font-bold mt-3">Your Todos</h2>
        <div className="todos">
          {todos.length === 0 && (
            <div className="m-5">No todos to display</div>
          )}
          {todos.map((item) => {
            return (
              <div
                key={item.id}
                className="todo flex md:w-1/2 my-3 justify-between"
              >
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={(e) =>
                      handleSelect(item.id, e.target.checked)
                    }
                  />

                  <div>{item.todo}</div>
                </div>
                <div className="buttons flex h-full">
                  <button
                    onClick={() => handleEditClick(item.id)}
                    className="bg-violet-800 hover:bg-violet-950 p-2 py-1 text-sm font-bold text-white rounded-md mx-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="bg-violet-800 hover:bg-violet-950 p-2 py-1 text-sm font-bold text-white rounded-md mx-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
