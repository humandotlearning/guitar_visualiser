import React, { useState, useEffect } from 'react';
import './OrientationPrompt.css';

const OrientationPrompt = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkIfMobile = () => {
      const userAgent = 
        typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
      const mobile = Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      );
      setIsMobile(mobile);
    };

    // Check orientation
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsPortrait(window.innerHeight > window.innerWidth);
      }
    };

    // Check initial conditions
    checkIfMobile();
    checkOrientation();

    // Set up event listener for orientation changes
    const handleResize = () => {
      checkOrientation();
    };

    window.addEventListener('resize', handleResize);
    
    // Try to use Screen Orientation API if available
    if (typeof window !== 'undefined' && window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (typeof window !== 'undefined' && window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleResize);
      }
    };
  }, []);

  const dismissPrompt = () => {
    setDismissed(true);
    // Save to localStorage to remember user's preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('orientationPromptDismissed', 'true');
    }
  };

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wasDismissed = localStorage.getItem('orientationPromptDismissed') === 'true';
      setDismissed(wasDismissed);
    }
  }, []);

  // Only show on mobile and in portrait mode, and if not dismissed
  if (!isMobile || !isPortrait || dismissed) {
    return null;
  }

  return (
    <div className="orientation-prompt">
      <div className="orientation-prompt-content">
        <div className="rotate-icon"></div>
        <h3>Rotate Your Device</h3>
        <p>For the best experience viewing the fretboard, please rotate your device to landscape mode.</p>
        <button onClick={dismissPrompt} className="dismiss-button">
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default OrientationPrompt;
