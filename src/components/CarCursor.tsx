import { useEffect, useRef } from "react";
import { FaCarSide } from "react-icons/fa";

export default function CarCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const carPos = useRef({ x: 0, y: 0 });
  const rotation = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    
    let animationFrameId: number;
    const updateCar = () => {
      const dx = mousePos.current.x - carPos.current.x;
      const dy = mousePos.current.y - carPos.current.y;
      
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        rotation.current = Math.atan2(dy, dx) * (180 / Math.PI);
      }

      const speed = 0.08;
      carPos.current.x += dx * speed;
      carPos.current.y += dy * speed;

      if (cursorRef.current && innerRef.current) {
        cursorRef.current.style.transform = `translate3d(${carPos.current.x}px, ${carPos.current.y}px, 0) rotate(${rotation.current}deg)`;
        
        const isMovingLeft = Math.abs(rotation.current) > 90;
        innerRef.current.style.transform = `translate3d(-150%, -50%, 0) ${isMovingLeft ? 'scaleY(-1)' : 'scaleY(1)'}`;
      }

      animationFrameId = requestAnimationFrame(updateCar);
    };

    animationFrameId = requestAnimationFrame(updateCar);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 99999,
        color: "var(--accent-primary)",
        fontSize: "24px",
        willChange: "transform",
      }}
    >
      <div 
        ref={innerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FaCarSide />
      </div>
    </div>
  );
}
