import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { useExperience } from "../state";

/** DOM lettering projected from its real 3D anchor, never a text texture.
 * Defer disposal of the independent DOM root: synchronous root.unmount inside
 * the Three reconciler's commit produces a React 19 nested-root race warning.
 */
export function SceneLabel({
  position,
  children,
  active,
  className = "",
}: {
  position: [number, number, number];
  children: ReactNode;
  active: boolean;
  className?: string;
}) {
  const anchor = useRef<Group>(null),
    element = useRef<HTMLDivElement | null>(null);
  const { gl } = useThree();
  const projected = useMemo(() => new Vector3(), []);
  useEffect(() => {
    const node = document.createElement("div");
    node.style.cssText =
      "position:absolute;left:0;top:0;pointer-events:none;opacity:0;z-index:1;will-change:transform";
    node.setAttribute("aria-hidden", "true");
    gl.domElement.parentElement!.append(node);
    element.current = node;
    const root = createRoot(node);
    root.render(<span className={`scene-label ${className}`}>{children}</span>);
    return () => {
      element.current = null;
      node.remove();
      setTimeout(() => root.unmount(), 0);
    };
  }, [gl, children, className]);
  useFrame(({ camera, size }) => {
    if (!element.current || !anchor.current) return;
    const state = useExperience.getState();
    const visible = active && !state.introRunning && !state.flying;
    element.current.style.opacity = visible ? "1" : "0";
    if (!visible) return;
    anchor.current.getWorldPosition(projected);
    projected.project(camera);
    element.current.style.transform = `translate3d(${(projected.x * 0.5 + 0.5) * size.width}px,${(-projected.y * 0.5 + 0.5) * size.height}px,0) translate(-50%,-50%)`;
  });
  return <group ref={anchor} position={position} />;
}
