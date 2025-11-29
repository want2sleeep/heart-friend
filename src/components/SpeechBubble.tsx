import React from 'react';
import './SpeechBubble.css';

interface SpeechBubbleProps {
  text: string;
  visible: boolean;
}

/**
 * SpeechBubble component displays a speech bubble with mood text above an animal.
 * Features fade-in/fade-out animations and a rounded design with a tail pointing down.
 * 
 * Requirements: 3.4 (fade animation), 5.3 (rounded appearance with tail)
 */
const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, visible }) => {
  if (!visible && !text) {
    return null;
  }

  return (
    <div className={`speech-bubble ${visible ? 'speech-bubble--visible' : 'speech-bubble--hidden'}`}>
      <div className="speech-bubble__content">
        {text}
      </div>
      <div className="speech-bubble__tail" />
    </div>
  );
};

export default SpeechBubble;
