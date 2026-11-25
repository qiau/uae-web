import { useEffect, useImperativeHandle, useRef, type Ref, type RefObject } from "react";

export type FlowFieldHandle = {
  /** One brief acceleration (about 700 ms). No-op when reduced motion is set. */
  accelerate: () => void;
};

const FRAME_MS = 1000 / 30; // cap at roughly 30 fps
const STEP = 7; // streamline step length in CSS pixels
const STEPS = 80; // steps per streamline
const OBSTACLE_MARGIN = 28; // breathing room around the form panel
const OBSTACLE_REACH = 140; // distance at which lines start to bend away
const BOOST_MS = 700;

type Seed = {
  x: number;
  y: number;
};

/** Smooth, slowly changing direction field. Mostly left to right. */
function fieldAngle(x: number, y: number, t: number) {
  return (
    Math.sin(y * 0.0042 + t * 0.15) * 0.55 +
    Math.cos(x * 0.0031 - t * 0.11) * 0.45 +
    Math.sin((x + y) * 0.0016 + t * 0.07) * 0.3
  );
}

function makeSeeds(width: number, height: number): Seed[] {
  // Scale the line count to the viewport area.
  const count = Math.round(Math.min(110, Math.max(28, (width * height) / 15000)));
  return Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width - STEP * STEPS * 0.5,
    // Spread evenly in y with jitter so lines do not clump.
    y: ((index + Math.random() * 0.8) / count) * height,
  }));
}

/**
 * Decorative background for the auth pages: low-contrast streamlines of a
 * flow field that bend around the form panel. Static under reduced motion,
 * paused while the tab is hidden, and hidden from assistive technology.
 */
export function FlowField({
  obstacleRef,
  ref,
}: {
  obstacleRef: RefObject<HTMLElement | null>;
  ref?: Ref<FlowFieldHandle>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boostUntil = useRef(0);
  const reducedMotion = useRef(false);

  useImperativeHandle(ref, () => ({
    accelerate() {
      if (!reducedMotion.current) boostUntil.current = performance.now() + BOOST_MS;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return; // No canvas support: the plain background is the fallback.

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = motionQuery.matches;

    let width = 0;
    let height = 0;
    let seeds: Seed[] = [];
    let color = "";
    let time = 0;
    let frame = 0;
    let lastFrame = 0;

    const readColor = () => {
      color = getComputedStyle(document.documentElement).getPropertyValue("--flow-line").trim();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      seeds = makeSeeds(width, height);
    };

    const obstacle = () => {
      const element = obstacleRef.current;
      if (!element) return null;
      const box = element.getBoundingClientRect();
      const origin = canvas.getBoundingClientRect();
      return {
        left: box.left - origin.left - OBSTACLE_MARGIN,
        top: box.top - origin.top - OBSTACLE_MARGIN,
        right: box.right - origin.left + OBSTACLE_MARGIN,
        bottom: box.bottom - origin.top + OBSTACLE_MARGIN,
      };
    };

    const draw = () => {
      const box = obstacle();
      context.clearRect(0, 0, width, height);
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.lineCap = "round";
      context.beginPath();

      for (const seed of seeds) {
        let x = seed.x;
        let y = seed.y;
        context.moveTo(x, y);
        for (let step = 0; step < STEPS; step += 1) {
          const angle = fieldAngle(x, y, time);
          let vx = Math.cos(angle);
          let vy = Math.sin(angle) * 0.6;

          if (box) {
            // Nearest point on the panel rectangle; bend away from it.
            const nx = Math.max(box.left, Math.min(x, box.right));
            const ny = Math.max(box.top, Math.min(y, box.bottom));
            let dx = x - nx;
            let dy = y - ny;
            let distance = Math.hypot(dx, dy);
            if (distance === 0) break; // inside the panel: stop this line
            if (distance < OBSTACLE_REACH) {
              dx /= distance;
              dy /= distance;
              const influence = (1 - distance / OBSTACLE_REACH) ** 2;
              const inward = vx * dx + vy * dy;
              if (inward < 0) {
                vx -= dx * inward * Math.min(1, influence * 2.2);
                vy -= dy * inward * Math.min(1, influence * 2.2);
              }
              vx += dx * influence * 0.35;
              vy += dy * influence * 0.35;
              distance = Math.hypot(vx, vy) || 1;
              vx /= distance;
              vy /= distance;
            }
          }

          x += vx * STEP;
          y += vy * STEP;
          if (x > width + STEP || y < -STEP * 4 || y > height + STEP * 4) break;
          context.lineTo(x, y);
        }
      }
      context.stroke();
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const elapsed = now - lastFrame;
      if (elapsed < FRAME_MS) return;
      lastFrame = now;

      const dt = Math.min(elapsed, 100) / 1000;
      const boosting = now < boostUntil.current;
      const speed = boosting ? 9 : 1;
      time += dt * speed;
      const drift = dt * 10 * speed; // slow rightward drift of every line
      for (const seed of seeds) {
        seed.x += drift;
        if (seed.x > width) seed.x = -STEP * STEPS * 0.5;
      }
      draw();
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (reducedMotion.current || document.hidden) {
        draw(); // static frame
        return;
      }
      lastFrame = 0;
      frame = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else start();
    };
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion.current = event.matches;
      start();
    };
    const onResize = () => {
      resize();
      draw();
    };

    readColor();
    resize();
    start();

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas);
    // Re-read the line color when the theme class on <html> changes.
    const themeObserver = new MutationObserver(() => {
      readColor();
      draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [obstacleRef]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}
