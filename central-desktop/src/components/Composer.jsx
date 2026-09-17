import { useEffect, useRef } from "react";
export default function Composer({ title, open, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (open) ref.current.showModal();
    else ref.current.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="composer"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="composer-heading">
        <h2>{title}</h2>
        <button
          className="close-button"
          aria-label="Fechar formulário"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}
