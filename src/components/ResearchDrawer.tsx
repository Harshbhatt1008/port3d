import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useExperience } from "../state";

/** Native dialog supplies the focus trap, inert background, Escape and focus return.
 *  Only this deliberately expanded surface scrolls, never a floating caption. */
export function ResearchDrawer({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = useExperience((s) => s.notesOpen);
  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="research-drawer"
      aria-labelledby="research-title"
      data-lenis-prevent
      onClose={() => useExperience.getState().set({ notesOpen: false })}
      onClick={(e) => {
        const r = ref.current!.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          ref.current?.close();
      }}
    >
      <header>
        <div>
          <h2 id="research-title">{title}</h2>
        </div>
        <button
          className="icon-control"
          aria-label="Close research notes"
          onClick={() => ref.current?.close()}
        >
          <X size={20} />
        </button>
      </header>
      <div className="drawer-body">{children}</div>
    </dialog>
  );
}
