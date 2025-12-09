import { useRef, useEffect, useState } from 'react';
import { useSpring, useTransform, motion } from 'framer-motion';

export const BlurText = ({
  text,
  delay = 200,
  className = '',
  animateBy = 'words', // 'words' or 'letters'
  direction = 'top', // 'top' or 'bottom'
  threshold = 0.1,
  rootMargin = '-50px',
  animationFrom,
  animationTo,
  easing = 'easeOut',
  onAnimationComplete,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef();
  const animatedCount = useRef(0);

  // Default animations based on direction
  const defaultFrom =
    direction === 'top'
      ? { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,-50px,0)' }
      : { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,50px,0)' };

  const defaultTo = [
    {
      filter: 'blur(5px)',
      opacity: 0.5,
      transform: direction === 'top' ? 'translate3d(0,5px,0)' : 'translate3d(0,-5px,0)',
    },
    { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0,0)' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const springs = elements.map(() =>
    useSpring(0, {
      stiffness: 70, // Softer stiffness for a "paper/ink" feel
      damping: 20,   // Higher damping for less bounce, more "settling"
      mass: 1,
    })
  );

  return (
    <p ref={ref} className={`blur-text ${className} flex flex-wrap`}>
      {elements.map((element, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            marginRight: animateBy === 'words' ? '0.25em' : '0',
            position: 'relative',
          }}
        >
          {/* React Bits Logic with Framer Motion */}
          <motion.span
            initial={animationFrom || defaultFrom}
            animate={inView ? (animationTo || defaultTo) : (animationFrom || defaultFrom)}
            transition={{
              duration: 0.8,
              delay: index * 0.05 + delay / 1000,
              ease: [0.25, 0.4, 0.25, 1], // Cubic bezier for "ink flow" feel
            }}
            onAnimationComplete={() => {
              animatedCount.current += 1;
              if (animatedCount.current === elements.length && onAnimationComplete) {
                onAnimationComplete();
              }
            }}
            className="inline-block"
          >
            {element === ' ' ? '\u00A0' : element}
          </motion.span>
        </span>
      ))}
    </p>
  );
};

export default BlurText;