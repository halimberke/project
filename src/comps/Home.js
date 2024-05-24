import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import { Link } from 'react-router-dom';


const Home = ({ userId }) => {
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [feedback, setFeedback] = useState('');
  const additionalWordsCount = localStorage.getItem('additionalWordsCount') || 10; // Default to 10 if not set

  const fetchWords = async (userId, additionalWordsCount) => {
    try {
      const response = await axios.get(`http://localhost:5000/daily-quiz/${userId}`, {
        params: { additionalWordsCount }
      });

      setWords(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Kelime listesi alınamadı:', error);
      setError('Kelime listesi alınamadı');
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    const userId = localStorage.getItem('userId');
    const currentWord = words[currentWordIndex];
    const isCorrect = answer.toLowerCase() === currentWord.turkish.toLowerCase();

    try {
      await axios.post('http://localhost:5000/quiz', {
        userId,
        wordId: currentWord.id,
        isCorrect
      });

      setFeedback(isCorrect ? 'Doğru!' : `Yanlış! Doğru cevap: ${currentWord.turkish}`);

      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setAnswer('');
          setFeedback('');
        } else {
          setQuizFinished(true);
        }
      }, 2000);
    } catch (error) {
      console.error('Cevap kaydedilemedi:', error);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchWords(userId, additionalWordsCount);
    } else {
      setError('Kullanıcı ID bulunamadı');
      setLoading(false);
    }
  }, [userId, additionalWordsCount]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (quizFinished) {
    return <div>Bugünkü test bitti!</div>;
  }

  const currentWord = words[currentWordIndex];

  return (
    <div className="home-container">
      <h1>Bugünkü Kelimeleriniz</h1>
      <div className="word-container">
        <h2>{currentWord.english}</h2>
        <img src={currentWord.image} alt={currentWord.english} className="word-image" />
        <div className="answer-form">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Türkçe karşılık"
          />
          <button onClick={handleAnswerSubmit}>Cevapla</button>
        </div>
        {feedback && <div className="feedback">{feedback}</div>}
      </div>
      <Link to="/report" className="report-link">Rapor Al</Link>
    </div>
  );
};

export default Home;
