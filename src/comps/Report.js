import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Report.css';

const Report = () => {
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId'); // Kullanıcı ID'sini localStorage'dan al

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/report/${userId}`);
        setReportData(response.data);
      } catch (error) {
        console.error('Rapor alınamadı:', error);
        setError('Rapor alınamadı');
      }
    };

    if (userId) {
      fetchReportData();
    } else {
      setError('Kullanıcı ID bulunamadı');
    }
  }, [userId]);


  const handlePrint = () => {
    window.print();
  };

  

  if (error) {
    return <div>{error}</div>;
  }

  if (!reportData) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="report-container">
      <h1>Öğrenme Raporu</h1>
      <p>Toplam Kelime Sayısı: {reportData.totalWords}</p>
      <p>Öğrenilen Kelimeler: {reportData.learnedWords} ({reportData.learnedPercentage.toFixed(2)}%)</p>
      <p>Öğrenme Aşamasındaki Kelimeler: {reportData.learningWords} ({reportData.learningPercentage.toFixed(2)}%)</p>
      <p>Öğrenilmemiş Kelimeler: {reportData.notLearnedWords} ({reportData.notLearnedPercentage.toFixed(2)}%)</p>
      <button onClick={handlePrint} className="print-button">Raporu Yazdır</button>
    </div>
  );
};

export default Report;
