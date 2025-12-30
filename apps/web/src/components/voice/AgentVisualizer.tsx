'use client';

import { useEffect, useRef } from 'react';
import type { VoiceAgentState } from '@/hooks/useVoiceAgent';

interface AgentVisualizerProps {
  state: VoiceAgentState;
  className?: string;
}

/**
 * Agent Visualizer Component
 * Visual feedback for voice agent state
 * - Idle: Gentle breathing animation
 * - Listening: Reactive audio visualization
 * - Thinking: Processing spinner
 * - Speaking: Gold pulse animation
 */
export function AgentVisualizer({ state, className = '' }: AgentVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 200;
    canvas.width = size * 2; // For retina
    canvas.height = size * 2;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(2, 2);

    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = 60;

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      phaseRef.current += 0.02;

      // Draw outer glow rings
      const glowCount = 3;
      for (let i = glowCount; i >= 0; i--) {
        const glowRadius = baseRadius + (i * 15) + Math.sin(phaseRef.current + i * 0.5) * 5;
        const opacity = 0.1 - (i * 0.025);

        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);

        let glowColor: string;
        switch (state) {
          case 'listening':
            glowColor = `rgba(103, 80, 164, ${opacity})`; // Primary purple
            break;
          case 'speaking':
            glowColor = `rgba(212, 175, 55, ${opacity})`; // Gold
            break;
          case 'thinking':
            glowColor = `rgba(103, 80, 164, ${opacity * 0.5})`; // Dimmed purple
            break;
          case 'error':
            glowColor = `rgba(186, 26, 26, ${opacity})`; // Error red
            break;
          default:
            glowColor = `rgba(255, 255, 255, ${opacity * 0.5})`; // Subtle white
        }

        ctx.fillStyle = glowColor;
        ctx.fill();
      }

      // Draw main orb
      const breathe = Math.sin(phaseRef.current) * 3;
      const orbRadius = baseRadius + breathe;

      // Gradient for main orb
      const gradient = ctx.createRadialGradient(
        centerX - 20, centerY - 20, 0,
        centerX, centerY, orbRadius
      );

      switch (state) {
        case 'listening':
          // Reactive visualization - simulate audio levels
          const audioLevel = Math.abs(Math.sin(phaseRef.current * 3)) * 0.3 + 0.7;
          gradient.addColorStop(0, `rgba(147, 112, 219, ${audioLevel})`);
          gradient.addColorStop(0.5, `rgba(103, 80, 164, ${audioLevel * 0.8})`);
          gradient.addColorStop(1, `rgba(75, 58, 120, ${audioLevel * 0.6})`);
          break;
        case 'speaking':
          gradient.addColorStop(0, 'rgba(255, 215, 100, 0.95)');
          gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.85)');
          gradient.addColorStop(1, 'rgba(180, 140, 40, 0.75)');
          break;
        case 'thinking':
          const pulseOpacity = Math.abs(Math.sin(phaseRef.current * 2)) * 0.4 + 0.4;
          gradient.addColorStop(0, `rgba(147, 112, 219, ${pulseOpacity})`);
          gradient.addColorStop(0.5, `rgba(103, 80, 164, ${pulseOpacity * 0.8})`);
          gradient.addColorStop(1, `rgba(75, 58, 120, ${pulseOpacity * 0.6})`);
          break;
        case 'error':
          gradient.addColorStop(0, 'rgba(220, 80, 80, 0.9)');
          gradient.addColorStop(0.5, 'rgba(186, 26, 26, 0.8)');
          gradient.addColorStop(1, 'rgba(150, 20, 20, 0.7)');
          break;
        default:
          gradient.addColorStop(0, 'rgba(80, 80, 90, 0.7)');
          gradient.addColorStop(0.5, 'rgba(50, 50, 60, 0.6)');
          gradient.addColorStop(1, 'rgba(30, 30, 40, 0.5)');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw inner highlight
      const highlightGradient = ctx.createRadialGradient(
        centerX - 15, centerY - 15, 0,
        centerX, centerY, orbRadius * 0.6
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = highlightGradient;
      ctx.fill();

      // Draw thinking spinner
      if (state === 'thinking') {
        const spinnerRadius = orbRadius + 15;
        const spinAngle = phaseRef.current * 2;
        const arcLength = Math.PI * 0.4;

        ctx.beginPath();
        ctx.arc(centerX, centerY, spinnerRadius, spinAngle, spinAngle + arcLength);
        ctx.strokeStyle = 'rgba(103, 80, 164, 0.8)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Second spinner arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, spinnerRadius, spinAngle + Math.PI, spinAngle + Math.PI + arcLength);
        ctx.stroke();
      }

      // Draw listening waveform bars
      if (state === 'listening') {
        const barCount = 5;
        const barWidth = 4;
        const barSpacing = 8;
        const totalWidth = (barCount * barWidth) + ((barCount - 1) * barSpacing);
        const startX = centerX - totalWidth / 2;

        for (let i = 0; i < barCount; i++) {
          const barHeight = 20 + Math.sin(phaseRef.current * 4 + i * 0.8) * 15;
          const x = startX + (i * (barWidth + barSpacing));
          const y = centerY + orbRadius + 25;

          ctx.fillStyle = 'rgba(103, 80, 164, 0.7)';
          ctx.fillRect(x, y - barHeight / 2, barWidth, barHeight);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [state]);

  const stateLabel = {
    idle: 'Ready',
    listening: 'Listening...',
    thinking: 'Processing...',
    speaking: 'Speaking...',
    error: 'Error',
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: '50%',
        }}
      />
      <span
        style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: state === 'error' 
            ? 'var(--md-sys-color-error)' 
            : 'var(--md-sys-color-on-surface-variant)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {stateLabel[state]}
      </span>
    </div>
  );
}
