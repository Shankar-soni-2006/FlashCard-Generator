import { useState, useEffect } from 'react';

const Quiz = ({ topic, flashcards, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    const generateQuestionsFromFlashcards = () => {
      setLoadingQuestions(true);
      const quizQuestions = [];
      
      // Generate 8 questions from flashcards
      const shuffledCards = [...flashcards].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < Math.min(8, shuffledCards.length); i++) {
        const card = shuffledCards[i];
        const questionType = ['mcq', 'fill', 'boolean'][i % 3];
        
        if (questionType === 'mcq') {
          // Create MCQ from flashcard
          const wrongAnswers = shuffledCards
            .filter(c => c.id !== card.id)
            .slice(0, 3)
            .map(c => c.answer.split(' ').slice(0, 4).join(' '));
          
          quizQuestions.push({
            id: i + 1,
            type: 'mcq',
            question: card.question,
            options: [card.answer.split(' ').slice(0, 4).join(' '), ...wrongAnswers],
            correct: 0
          });
        } else if (questionType === 'fill') {
          // Create fill-in-the-blank from flashcard
          const answerWords = card.answer.split(' ');
          const keyWord = answerWords.find(word => word.length > 4) || answerWords[0];
          const wrongWord = shuffledCards
            .filter(c => c.id !== card.id)[0]
            ?.answer.split(' ').find(word => word.length > 4) || 'incorrect';
          
          quizQuestions.push({
            id: i + 1,
            type: 'fill',
            question: card.question.replace(/\?$/, '') + ` involves _____?`,
            correct: keyWord.replace(/[.,!?]/g, ''),
            options: [keyWord.replace(/[.,!?]/g, ''), wrongWord.replace(/[.,!?]/g, '')]
          });
        } else {
          // Create true/false from flashcard
          const isTrue = Math.random() > 0.5;
          const statement = isTrue ? 
            card.answer.split('.')[0] :
            card.answer.split('.')[0].replace(/is|are|can|will/, 'cannot');
          
          quizQuestions.push({
            id: i + 1,
            type: 'boolean',
            question: statement + '.',
            correct: isTrue
          });
        }
      }
      
      setQuestions(quizQuestions);
      setLoadingQuestions(false);
    };
    
    if (flashcards && flashcards.length > 0) {
      generateQuestionsFromFlashcards();
    }
  }, [flashcards, topic]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (q.type === 'mcq' && userAnswer === q.correct) correct++;
      if (q.type === 'boolean' && userAnswer === q.correct) correct++;
      if (q.type === 'fill' && userAnswer?.toLowerCase().trim() === q.correct.toLowerCase()) correct++;
    });
    setScore(correct);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz-container">
        <div className="quiz-results">
          <h2>Quiz Results</h2>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-text">{percentage}%</span>
            </div>
            <p>You scored {score} out of {questions.length}</p>
          </div>
          <div className="grade">
            {percentage >= 80 ? '🎉 Excellent!' : 
             percentage >= 60 ? '👍 Good Job!' : 
             '📚 Keep Studying!'}
          </div>
          <div className="results-breakdown">
            <h3>Question Breakdown:</h3>
            {questions.map((q, index) => {
              const userAnswer = answers[index];
              const isCorrect = q.type === 'mcq' ? userAnswer === q.correct :
                               q.type === 'boolean' ? userAnswer === q.correct :
                               userAnswer?.toLowerCase().trim() === q.correct.toLowerCase();
              return (
                <div key={q.id} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <span>Q{index + 1}: {isCorrect ? '✓' : '✗'}</span>
                </div>
              );
            })}
          </div>
          <div className="quiz-actions">
            <button onClick={resetQuiz} className="quiz-btn">Retake Quiz</button>
            <button onClick={onBack} className="quiz-btn secondary">Back to Flashcards</button>
            <div className="performance-note">
              <small>
                {percentage >= 90 ? 'Outstanding! You have mastered this topic.' :
                 percentage >= 80 ? 'Great work! You have a solid understanding.' :
                 percentage >= 70 ? 'Good job! Review the missed concepts.' :
                 percentage >= 60 ? 'Fair performance. More study recommended.' :
                 'Keep studying! Focus on the fundamentals.'}
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingQuestions || questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="loading">
          Generating quiz questions from flashcards...
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const userAnswer = answers[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Quiz: {topic}</h2>
        <div className="progress">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>

      <div className="question-card">
        <h3>{question.question}</h3>

        {question.type === 'mcq' && (
          <div className="options">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option ${userAnswer === index ? 'selected' : ''}`}
                onClick={() => handleAnswer(index)}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === 'fill' && (
          <div className="drag-drop-container">
            <div className="drag-options">
              {question.options?.map((option, index) => (
                <div
                  key={index}
                  className="drag-option"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', option)}
                >
                  {option}
                </div>
              ))}
            </div>
            <div className="drop-zone-container">
              <div className="question-with-blank">
                {question.question.split('_____').map((part, index) => (
                  <span key={index}>
                    {part}
                    {index < question.question.split('_____').length - 1 && (
                      <div
                        className={`drop-zone ${userAnswer ? 'filled' : ''}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const droppedText = e.dataTransfer.getData('text/plain');
                          handleAnswer(droppedText);
                        }}
                      >
                        {userAnswer || 'Drop here'}
                      </div>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {question.type === 'boolean' && (
          <div className="boolean-options">
            <button
              className={`boolean-btn ${userAnswer === true ? 'selected' : ''}`}
              onClick={() => handleAnswer(true)}
            >
              True
            </button>
            <button
              className={`boolean-btn ${userAnswer === false ? 'selected' : ''}`}
              onClick={() => handleAnswer(false)}
            >
              False
            </button>
          </div>
        )}

        <div className="quiz-navigation">
          <button 
            onClick={nextQuestion}
            disabled={userAnswer === undefined || userAnswer === ''}
            className="next-btn"
          >
            {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;