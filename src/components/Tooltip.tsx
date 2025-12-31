import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  enabled?: boolean;
  delay?: number;
  open?: boolean;
}

const Tooltip = ({
  children,
  content = "",
  enabled = true,
  delay = 200,
  open = false,
}: TooltipProps) => {
  const [hoverVisible, setHoverVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const [isPositioned, setIsPositioned] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVisible = (hoverVisible || open) && enabled && content.trim() !== "";

  const updatePosition = () => {
    const target = triggerRef.current?.firstElementChild;

    if (target) {
      const rect = target.getBoundingClientRect();
      const tooltipHeight = 40;
      const gap = 12;

      const canFitTop = rect.top > tooltipHeight + gap;
      const newPlacement = canFitTop ? "top" : "bottom";

      setPlacement(newPlacement);
      setCoords({
        top: canFitTop
          ? rect.top + window.scrollY - gap
          : rect.bottom + window.scrollY + gap,
        left: rect.left + window.scrollX + rect.width / 2,
      });

      setIsPositioned(true);
    }
  };

  const handleMouseEnter = () => {
    if (open) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setHoverVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setHoverVisible(false);
    setIsPositioned(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      setIsPositioned(false);
    };
  }, [isVisible]);

  if (!enabled || !content || content.trim() === "") {
    return <>{children}</>;
  }

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="contents"
    >
      {children}

      {isVisible &&
        createPortal(
          <div
            className={`fixed z-[9999] -translate-x-1/2 pointer-events-none transition-opacity duration-200 
              ${isPositioned ? "opacity-100" : "opacity-0"} 
              ${placement === "top" ? "-translate-y-full" : "translate-y-0"}`}
            style={{
              top: coords.top,
              left: coords.left,
              transitionProperty: "opacity",
            }}
          >
            <div className="relative bg-[#212121] text-white text-xs leading-tight px-3 py-1.5 rounded-sm shadow-lg border-none animate-in fade-in zoom-in-95 duration-200">
              {content}
              <div
                className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent 
                ${
                  placement === "top"
                    ? "top-full border-t-4 border-t-[#212121]"
                    : "bottom-full border-b-4 border-b-[#212121]"
                }`}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Tooltip;
