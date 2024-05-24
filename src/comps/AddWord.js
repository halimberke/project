import React, { useState } from 'react';

const AddWord = () => {
  const [english, setEnglish] = useState('');
  const [turkish, setTurkish] = useState('');
  const [sentences, setSentences] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/add-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ english, turkish, sentences, image }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);
        alert('Kelime başarıyla eklendi!');
        setEnglish('');
        setTurkish('');
        setSentences('');
        setImage('');
      } else {
        const data = await response.json();
        alert(`Kelime ekleme başarısız: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Kelime ekleme sırasında hata oluştu');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-word-form">
      <div className="form-group">
        <label>İngilizce Kelime:</label>
        <input
          type="text"
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Türkçe Karşılık:</label>
        <input
          type="text"
          value={turkish}
          onChange={(e) => setTurkish(e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Cümleler:</label>
        <textarea
          value={sentences}
          onChange={(e) => setSentences(e.target.value)}
          className="form-input"
        ></textarea>
      </div>
      <div className="form-group">
        <label>Resim URL'si:</label>
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="form-input"
        />
      </div>
      <button type="submit" className="form-button">Kelime Ekle</button>
    </form>
  );
};

export default AddWord;
