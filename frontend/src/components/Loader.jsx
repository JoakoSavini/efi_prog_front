import React from "react";

const Loader = ({ fullScreen = false }) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm z-50"
    : "flex items-center justify-center p-4";

  return (
    <div className={containerClasses}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-indigo-600 font-medium">
        Cargando datos...
      </span>
    </div>
  );
};

export default Loader;
