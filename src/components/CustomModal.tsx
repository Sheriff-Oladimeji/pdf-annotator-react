import * as React from "react";

interface CustomModalProps {
  open: boolean;
  handleClose: () => void;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  handleClose,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden sm:rounded-md rounded-md bg-white p-6 shadow-xl transition-all">
          <button
            onClick={handleClose}
            className="absolute -right-5 -top-5 rounded-full border border-gray-100 bg-gray-100 p-1 text-gray-500 hover:border-gray-200 hover:bg-gray-200"
            aria-label="close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomModal; 