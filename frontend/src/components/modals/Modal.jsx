// src/components/Modal/Modal.jsx

import React from "react";

/**
 * Componente base reutilizable para todos los modales.
 * Maneja el overlay oscuro, la posición central y el botón de cerrar.
 * * @param {boolean} isOpen - Controla la visibilidad del modal.
 * @param {function} onClose - Función para cerrar el modal.
 * @param {string} title - Título del modal.
 * @param {string} size - Clase de ancho del modal (e.g., 'max-w-lg', 'max-w-xl').
 * @param {React.Node} children - Contenido del modal (el formulario).
 */
const Modal = ({ isOpen, onClose, title, size = "max-w-lg", children }) => {
  if (!isOpen) return null;

  return (
    // Overlay oscuro y centrado fijo
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      {/* Contenedor principal del modal */}
      <div
        className={`relative bg-white rounded-lg shadow-xl w-full ${size} transform transition-all sm:my-8 sm:align-middle sm:w-full`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-6">
          {/* Cabecera del modal */}
          <div className="flex justify-between items-start pb-3 border-b border-gray-200">
            <h3
              id="modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              {title}
            </h3>

            {/* Botón de Cerrar */}
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              onClick={onClose}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>

          {/* Cuerpo del modal (donde va el formulario) */}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
