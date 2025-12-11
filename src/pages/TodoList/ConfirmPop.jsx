import React from "react";

function ConfirmPop({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">
        <h2 className="text-lg font-bold mb-2">
          {title || "Are you sure?"}
        </h2>
        <p className="text-sm mb-5">
          {message || "Do you really want to perform this action?"}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-1 text-sm font-semibold rounded-md border"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPop;
