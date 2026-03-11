import React, { useEffect, useRef } from 'react';

const ParticleSystem = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particleCount = 60;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random starting position
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      // Random size with more variation
      const size = Math.random() * 6 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      // Random animation duration and delay
      particle.style.animationDuration = (Math.random() * 25 + 15) + 's';
      particle.style.animationDelay = Math.random() * 25 + 's';
      
      // Random opacity with more variation
      particle.style.opacity = Math.random() * 0.6 + 0.2;
      
      // Random gradient color
      const gradients = [
        'linear-gradient(135deg, #6d28d9, #a78bfa)',
        'linear-gradient(135deg, #7c3aed, #c4b5fd)',
        'linear-gradient(135deg, #8b5cf6, #a78bfa)',
        'linear-gradient(135deg, #6d28d9, #8b5cf6)'
      ];
      particle.style.background = gradients[Math.floor(Math.random() * gradients.length)];
      
      // Add glow effect
      particle.style.boxShadow = `0 0 ${size}px rgba(139, 92, 246, 0.5)`;
      
      // Add subtle blur
      particle.style.filter = `blur(${Math.random() * 1.5}px)`;
      
      container.appendChild(particle);
      particles.push(particle);
    }

    // Create floating light orbs
    for (let i = 0; i < 8; i++) {
      const orb = document.createElement('div');
      orb.className = 'light-orb';
      
      // Random position
      orb.style.left = Math.random() * 100 + '%';
      orb.style.top = Math.random() * 100 + '%';
      
      // Larger size for orbs
      const orbSize = Math.random() * 20 + 10;
      orb.style.width = orbSize + 'px';
      orb.style.height = orbSize + 'px';
      
      // Orb styling
      orb.style.background = 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)';
      orb.style.borderRadius = '50%';
      orb.style.filter = 'blur(2px)';
      
      // Slower animation for orbs
      orb.style.animationDuration = (Math.random() * 40 + 30) + 's';
      orb.style.animationDelay = Math.random() * 40 + 's';
      orb.style.animation = `float ${orb.style.animationDuration} ease-in-out infinite, pulseGlow ${Math.random() * 10 + 5}s ease-in-out infinite`;
      
      container.appendChild(orb);
      particles.push(orb);
    }

    return () => {
      particles.forEach(particle => {
        if (container.contains(particle)) {
          container.removeChild(particle);
        }
      });
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="particles"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 1
      }}
    />
  );
};

export default ParticleSystem;
