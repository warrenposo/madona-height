import { useEffect, useRef } from "react";

const GradientWave = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let time = 0;

    const drawWave = (yOffset: number, amplitude: number, frequency: number, speed: number, color: string) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2 + yOffset);

      for (let x = 0; x < canvas.width; x += 2) {
        const y = canvas.height / 2 + yOffset + Math.sin((x * frequency + time * speed) * 0.01) * amplitude;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Multiple animated waves with different properties
      drawWave(0, 40, 0.02, 0.5, "rgba(59, 130, 246, 0.08)");
      drawWave(20, 50, 0.015, 0.3, "rgba(147, 51, 234, 0.08)");
      drawWave(-20, 35, 0.025, 0.4, "rgba(236, 72, 153, 0.08)");
      drawWave(10, 45, 0.018, 0.35, "rgba(251, 146, 60, 0.06)");

      time += 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default GradientWave;

