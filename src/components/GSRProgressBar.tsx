import React from 'react';

interface GSRProgressBarProps {
  value: number;
  min?: number;
  max?: number;
}

export const GSRProgressBar: React.FC<GSRProgressBarProps> = ({
  value,
  min = 0,
  max = 1023
}) => {
  // Clamp value to valid range
  const clampedValue = Math.max(min, Math.min(max, value));
  
  // Calculate percentage
  const percentage = ((clampedValue - min) / (max - min)) * 100;
  
  return (
    <div className="gsr-progress-container">
      <span className="gsr-min-value">{min}</span>
      <div className="gsr-progress-bar" role="progressbar" aria-valuenow={clampedValue} aria-valuemin={min} aria-valuemax={max}>
        <div 
          className="gsr-progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="gsr-max-value">{max}</span>
    </div>
  );
};
