"use client";

import { ReactNode, useState } from "react";

interface TouchFeedbackProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  feedbackScale?: number;
  feedbackOpacity?: number;
}

export function TouchFeedback({
  children,
  className = "",
  onClick,
  disabled = false,
  feedbackScale = 0.95,
  feedbackOpacity = 0.7,
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (onClick && !disabled) {
      onClick();
    }
  };

  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const style = isPressed
    ? {
        transform: `scale(${feedbackScale})`,
        opacity: feedbackOpacity,
        transition: "all 0.1s ease-out",
      }
    : {
        transform: "scale(1)",
        opacity: 1,
        transition: "all 0.15s ease-out",
      };

  return (
    <div
      className={`${className} ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } select-none`}
      style={style}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

export function RippleEffect({
  children,
  className = "",
  onClick,
  disabled = false,
}: TouchFeedbackProps) {
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const createRipple = (event: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    let x, y;
    if ("touches" in event) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);

    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`relative overflow-hidden ${className} ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      onMouseDown={createRipple}
      onTouchStart={createRipple}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 25,
            top: ripple.y - 25,
            width: 50,
            height: 50,
            animation: "ripple 0.6s linear",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
