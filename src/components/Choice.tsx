import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

type Option = { value: string; label: string; description?: string };
/** Hand-built ARIA select-only combobox: one tab stop, arrows/Home/End, typeahead,
 *  active-descendant, Escape, outside dismissal and native pointer selection. */
export function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", time: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 300,
  });
  const current = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  function show() {
    setActive(current);
    setOpen(true);
  }
  function choose(index: number) {
    onChange(options[index].value);
    setOpen(false);
    trigger.current?.focus();
  }
  useEffect(() => {
    if (!open) return;
    function place() {
      const r = trigger.current!.getBoundingClientRect();
      const height = Math.min(340, innerHeight - 130, options.length * 68 + 16);
      const above = r.top > height + 20 || innerHeight - r.bottom < height;
      setPlacement({
        left: Math.max(12, Math.min(r.left, innerWidth - r.width - 12)),
        top: above ? Math.max(12, r.top - height - 8) : r.bottom + 8,
        width: r.width,
        height,
      });
    }
    function outside(e: PointerEvent) {
      if (
        !trigger.current?.contains(e.target as Node) &&
        !list.current?.contains(e.target as Node)
      )
        setOpen(false);
    }
    place();
    window.addEventListener("resize", place);
    document.addEventListener("pointerdown", outside, { passive: true });
    return () => {
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open, options.length]);
  useEffect(() => {
    if (open)
      document
        .getElementById(`${id}-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, open, id]);
  return (
    <div className="choice-field">
      <span id={`${id}-label`} className="field-label">
        {label}
      </span>
      <button
        ref={trigger}
        className="choice-trigger"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            if (!open) show();
            else
              setActive(
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? options.length - 1
                    : (active +
                        (e.key === "ArrowDown" ? 1 : -1) +
                        options.length) %
                      options.length,
              );
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (open) choose(active);
            else show();
          } else if (e.key === "Escape") {
            e.stopPropagation();
            setOpen(false);
          } else if (e.key === "Tab") setOpen(false);
          else if (
            e.key.length === 1 &&
            !e.altKey &&
            !e.ctrlKey &&
            !e.metaKey
          ) {
            const now = performance.now();
            typed.current.text =
              (now - typed.current.time < 700 ? typed.current.text : "") +
              e.key.toLowerCase();
            typed.current.time = now;
            const found = options.findIndex((o) =>
              o.label.toLowerCase().startsWith(typed.current.text),
            );
            if (found >= 0) {
              if (!open) setOpen(true);
              setActive(found);
            }
          }
        }}
      >
        <span id={`${id}-value`}>{options[current].label}</span>
        <ChevronDown size={16} />
      </button>
      {open &&
        createPortal(
          <ul
            ref={list}
            id={`${id}-list`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="choice-popover"
            style={{
              left: placement.left,
              top: placement.top,
              width: placement.width,
              maxHeight: placement.height,
            }}
          >
            {options.map((o, i) => (
              <li
                key={o.value}
                id={`${id}-${i}`}
                role="option"
                aria-selected={value === o.value}
                data-active={i === active}
                onPointerMove={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
              >
                <span>
                  {o.label}
                  {o.description && <small>{o.description}</small>}
                </span>
                {value === o.value && <Check size={16} />}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}
