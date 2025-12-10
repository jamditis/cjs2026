import React, { useState, Children, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import './Stepper.css';

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = false,
  renderStepIndicator,
  indicatorPosition = 'top', // 'top' or 'bottom'
  indicatorSize = 'default', // 'default' or 'small'
  ...rest
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = newStep => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  // Keyboard navigation - Enter to advance
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !isCompleted) {
      e.preventDefault();
      if (isLastStep) {
        handleComplete();
      } else {
        handleNext();
      }
    }
  }, [isCompleted, isLastStep]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const indicatorRow = (
    <div className={`stepper-indicator-row ${indicatorSize === 'small' ? 'stepper-indicator-row-small' : ''} ${stepContainerClassName}`}>
      {stepsArray.map((_, index) => {
        const stepNumber = index + 1;
        const isNotLastStep = index < totalSteps - 1;
        return (
          <React.Fragment key={stepNumber}>
            {renderStepIndicator ? (
              renderStepIndicator({
                step: stepNumber,
                currentStep,
                onStepClick: clicked => {
                  setDirection(clicked > currentStep ? 1 : -1);
                  updateStep(clicked);
                }
              })
            ) : (
              <StepIndicator
                step={stepNumber}
                disableStepIndicators={disableStepIndicators}
                currentStep={currentStep}
                size={indicatorSize}
                onClickStep={clicked => {
                  setDirection(clicked > currentStep ? 1 : -1);
                  updateStep(clicked);
                }}
              />
            )}
            {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} size={indicatorSize} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="stepper-outer-container" {...rest}>
      <div className={`stepper-circle-container ${stepCircleContainerClassName}`}>
        {indicatorPosition === 'top' && indicatorRow}

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`stepper-content-default ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={`stepper-footer-container ${footerClassName}`}>
            {indicatorPosition === 'bottom' && indicatorRow}
            <div className={`stepper-footer-nav ${currentStep !== 1 ? 'spread' : 'end'}`}>
              {currentStep !== 1 && (
                <button
                  onClick={handleBack}
                  className={`stepper-back-button ${currentStep === 1 ? 'inactive' : ''}`}
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button onClick={isLastStep ? handleComplete : handleNext} className="stepper-next-button" {...nextButtonProps}>
                {isLastStep ? 'Complete' : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className }) {
  const [parentHeight, setParentHeight] = useState(0);

  return (
    <motion.div
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={h => setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({ children, direction, onHeightReady }) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight);
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants = {
  enter: dir => ({
    x: dir >= 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: '0%',
    opacity: 1
  },
  exit: dir => ({
    x: dir >= 0 ? '-50%' : '50%',
    opacity: 0
  })
};

export function Step({ children }) {
  return <div className="stepper-step-default">{children}</div>;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators, size = 'default' }) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';
  const isSmall = size === 'small';

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) onClickStep(step);
  };

  return (
    <motion.div onClick={handleClick} className={`stepper-indicator ${isSmall ? 'stepper-indicator-small' : ''}`} animate={status} initial={false}>
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: '#e5e7eb', color: '#6b7280' },
          active: { scale: 1, backgroundColor: '#2A9D8F', color: '#2A9D8F' },
          complete: { scale: 1, backgroundColor: '#2A9D8F', color: '#2A9D8F' }
        }}
        transition={{ duration: 0.3 }}
        className={`stepper-indicator-inner ${isSmall ? 'stepper-indicator-inner-small' : ''}`}
      >
        {status === 'complete' ? (
          <CheckIcon className={`stepper-check-icon ${isSmall ? 'stepper-check-icon-small' : ''}`} />
        ) : status === 'active' ? (
          <div className={`stepper-active-dot ${isSmall ? 'stepper-active-dot-small' : ''}`} />
        ) : (
          isSmall ? null : <span className="stepper-step-number">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete, size = 'default' }) {
  const isSmall = size === 'small';
  const lineVariants = {
    incomplete: { width: 0, backgroundColor: 'transparent' },
    complete: { width: '100%', backgroundColor: '#2A9D8F' }
  };

  return (
    <div className={`stepper-connector ${isSmall ? 'stepper-connector-small' : ''}`}>
      <motion.div
        className="stepper-connector-inner"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

function CheckIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
