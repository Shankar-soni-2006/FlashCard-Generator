import { useState } from 'react';

const Flashcard = ({ flashcard, topic }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setIsFlipped(!isFlipped);
    
    // Remove clicked class after animation
    setTimeout(() => {
      setIsClicked(false);
    }, 600);
  };

  const getTopicEmoji = (topic, cardId) => {
    const topicLower = topic.toLowerCase();
    const emojis = {
      react: ['⚛️', '🔄', '🎯', '🚀', '💡', '🔧', '📱', '🎨', '⭐', '🔥', '💻', '🌟', '🎪', '🎭', '🎨'],
      javascript: ['🟨', '⚡', '🔥', '💻', '🚀', '🎯', '⭐', '🌟', '💡', '🔧', '📱', '🎨', '🎪', '🎭', '🎨'],
      database: ['🗄️', '📊', '🔍', '🔐', '📈', '💾', '🗂️', '📋', '🔗', '📝', '🎯', '⚡', '🔧', '💡', '📱'],
      python: ['🐍', '📊', '🤖', '🔬', '📈', '💻', '🚀', '⚡', '🎯', '💡', '🔧', '📱', '🌟', '🎨', '🔥'],
      css: ['🎨', '💄', '🌈', '✨', '🎭', '🖌️', '🎪', '🌟', '💫', '🎯', '🔥', '💻', '📱', '🚀', '💡'],
      html: ['🏗️', '📄', '🌐', '🔗', '📝', '🎯', '💻', '🚀', '⚡', '🌟', '💡', '🔧', '📱', '🎨', '🔥'],
      node: ['🟢', '⚡', '🚀', '🔧', '💻', '🌐', '📡', '🎯', '🔥', '💡', '🌟', '📱', '🎨', '⭐', '🎪'],
      api: ['🔌', '🌐', '📡', '🔗', '⚡', '🚀', '🎯', '💻', '🔧', '💡', '🌟', '📱', '🎨', '🔥', '⭐'],
      default: ['💡', '🎯', '🚀', '⚡', '🌟', '🔥', '💻', '🔧', '📱', '🎨', '⭐', '🎪', '🎭', '💫', '✨']
    };
    
    let selectedEmojis = emojis.default;
    for (const [key, value] of Object.entries(emojis)) {
      if (topicLower.includes(key)) {
        selectedEmojis = value;
        break;
      }
    }
    
    return selectedEmojis[cardId % selectedEmojis.length];
  };

  return (
    <div 
      className={`flashcard ${isFlipped ? 'flipped' : ''} ${isClicked ? 'clicked' : ''}`}
      onClick={handleClick}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="flashcard-emoji">
            {getTopicEmoji(topic, flashcard.id)}
          </div>
          <div className="flashcard-content">
            {flashcard.question}
          </div>
        </div>
        <div className="flashcard-back">
          <div className="flashcard-emoji">
            {getTopicEmoji(topic, flashcard.id)}
          </div>
          <div className="flashcard-content">
            {flashcard.answer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;