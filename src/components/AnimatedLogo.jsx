import React from 'react';
import { motion } from 'framer-motion';

const AnimatedLogo = ({ className = "w-24 h-24" }) => {
  // SVG Path for a "Gear" icon approximation, simplified for drawing animation
  const gearPath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 10h2v2h-2zm-5-5h2v2H6zm10 0h2v2h-2zm-1.9-3.9l1.4-1.4 1.4 1.4-1.4 1.4zm-7.2 7.2l1.4-1.4 1.4 1.4-1.4 1.4zm0-7.2l1.4 1.4-1.4 1.4-1.4-1.4zm7.2 7.2l1.4 1.4-1.4 1.4-1.4-1.4z";

  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full text-brand-teal"
        initial="hidden"
        animate="visible"
      >
        {/* Draw the gear outline */}
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { 
              pathLength: 1, 
              opacity: 1, 
              transition: { 
                pathLength: { duration: 1.5, ease: "easeInOut" },
                opacity: { duration: 0.5 }
              } 
            },
          }}
        />
        
        {/* Draw inner details - simulated complex path */}
        <motion.path
          d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { 
              pathLength: 1, 
              opacity: 1, 
              transition: { 
                pathLength: { duration: 1, ease: "easeInOut", delay: 0.5 },
                opacity: { duration: 0.5, delay: 0.5 }
              } 
            },
          }}
        />
        
        {/* Rotating dash for activity */}
        <motion.g
           animate={{ rotate: 360 }}
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           style={{ originX: "12px", originY: "12px" }}
        >
           <motion.path
             d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
             variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: {
                    pathLength: 1,
                    opacity: 0.5,
                    transition: { duration: 1, delay: 1 }
                }
             }}
           />
        </motion.g>
      </motion.svg>
    </div>
  );
};

export default AnimatedLogo;