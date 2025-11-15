import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import lottie from 'lottie-web';

/**
 * PlantLottie - Habit growth animation
 * Usage: <PlantLottie ref={plantRef} animationPath="/data/habit-plant.json" />
 * Call plantRef.current.setStreak(dayCount) to show growth based on habit streak
 * Growth duration: 30 days = fully grown plant
 */
const MAX_GROWTH_DAYS = 30; // Full plant at 30-day streak

const PlantLottie = forwardRef(({ animationPath = '/data/habit-plant.json', className = '' }, ref) => {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const totalFramesRef = useRef(0);
  const currentFrameRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    el.dataset.status = 'loading';
    console.log('[PlantLottie] mounting, path=', animationPath);

    // Pre-fetch JSON to detect emptiness before handing to Lottie
    fetch(animationPath)
      .then(r => r.json())
      .then(json => {
        const hasShapes = Array.isArray(json.layers) && json.layers.some(l => Array.isArray(l.shapes) ? l.shapes.length > 0 : (l.it && l.it.length > 0));
        if (!hasShapes) {
          console.warn('[PlantLottie] JSON has no visible shapes; using SVG fallback');
          el.innerHTML = fallbackSVG;
          el.dataset.status = 'fallback';
          return; // Skip lottie init
        }

        animRef.current = lottie.loadAnimation({
          container: el,
          renderer: 'svg',
          loop: false,
          autoplay: false,
          animationData: json
        });

        animRef.current.addEventListener('DOMLoaded', () => {
          el.dataset.status = 'ready';
          totalFramesRef.current = animRef.current.totalFrames;
          console.log('[PlantLottie] Animation loaded. Total frames:', totalFramesRef.current);
          // Start at frame 0 (seed stage)
          animRef.current.goToAndStop(0, true);
        });
        animRef.current.addEventListener('data_failed', () => {
          el.dataset.status = 'error';
          console.error('[PlantLottie] Failed to load animation JSON');
          el.innerHTML = fallbackSVG;
        });
      })
      .catch(err => {
        console.error('[PlantLottie] fetch error', err);
        el.innerHTML = fallbackSVG;
        el.dataset.status = 'error';
      });

    return () => {
      if (animRef.current) {
        console.log('[PlantLottie] destroying');
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [animationPath]);

  useImperativeHandle(ref, () => ({
    /**
     * STEP 3 & 4: Map streak → frame and show growth stage
     * @param {number} streakDays - User's current habit streak (0-30+)
     * @param {boolean} smooth - If true, animate smoothly to new frame
     */
    setStreak(streakDays = 0, smooth = false) {
      if (!animRef.current || !totalFramesRef.current) {
        console.warn('[PlantLottie] setStreak ignored: animation not ready');
        return;
      }

      // Cap at MAX_GROWTH_DAYS for full plant
      const cappedDay = Math.min(streakDays, MAX_GROWTH_DAYS);
      const targetFrame = Math.floor((cappedDay / MAX_GROWTH_DAYS) * totalFramesRef.current);
      const boundedFrame = Math.min(totalFramesRef.current - 1, Math.max(0, targetFrame));

      console.log(`[PlantLottie] Streak: ${streakDays} days → Frame ${boundedFrame}/${totalFramesRef.current}`);

      if (smooth && currentFrameRef.current !== boundedFrame) {
        // OPTIONAL: Smooth growth animation
        animRef.current.playSegments([currentFrameRef.current, boundedFrame], true);
      } else {
        // Jump directly to growth stage
        animRef.current.goToAndStop(boundedFrame, true);
      }

      currentFrameRef.current = boundedFrame;
      const statusEl = document.getElementById('plant-status');
      if (statusEl) statusEl.textContent = `Day ${streakDays} Growth`;
    },

    /**
     * Update opacity of specific layers by name (useful for milestones)
     * layers: { layerName: opacity }
     */
    setLayerOpacity(layers = {}) {
      if (!animRef.current || !animRef.current.renderer) return;
      // access all SVG nodes and toggle opacity by data-name or id
      const svg = animRef.current.renderer.svgElement;
      if (!svg) return;

      Object.entries(layers).forEach(([name, opacity]) => {
        // Many Lottie SVG exports use `data-name` attributes. We'll attempt both
        const elements = svg.querySelectorAll(`[data-name="${name}"] , #${name}`);
        elements.forEach((el) => {
          el.style.opacity = opacity;
        });
      });
    }
  }));

  return <div ref={containerRef} className={className} style={{ width: '300px', height: '300px', margin: '0 auto' }} />;
});

// Simple static SVG fallback (will show if JSON lacks shapes or fails to load)
const fallbackSVG = `<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Growth placeholder">
<rect x="0" y="0" width="300" height="300" rx="24" fill="url(#bgGrad)" />
<defs>
<linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#d1fae5" /><stop offset="100%" stop-color="#ecfdf5" />
</linearGradient>
<linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#10b981" /><stop offset="100%" stop-color="#059669" />
</linearGradient>
</defs>
<rect x="139" y="150" width="22" height="90" rx="5" fill="#8b5a2b" />
<circle cx="150" cy="135" r="55" fill="url(#leafGrad)" />
<circle cx="115" cy="145" r="35" fill="url(#leafGrad)" />
<circle cx="185" cy="145" r="35" fill="url(#leafGrad)" />
<circle cx="150" cy="95" r="32" fill="url(#leafGrad)" />
<circle cx="190" cy="90" r="10" fill="#fbbf24" stroke="#b45309" stroke-width="2" />
</svg>`;

export default PlantLottie;
