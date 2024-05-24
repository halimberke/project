import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginForm.css';
import logo from './AppLogo.png';
import { Modal, Button } from 'react-bootstrap';
import settingsIcon from './settings-icon-logo.png';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // React Router'dan navigate hook'u kullanın
  const [showSettings, setShowSettings] = useState(false); // Modal kontrolü için state
  const [additionalWordsCount, setAdditionalWordsCount] = useState(10);





  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        alert('Giriş başarılı!');
        localStorage.setItem('userId', data.user.id); // userId'yi localStorage'a kaydedin
        navigate('/home'); // Başarılı girişten sonra /home sayfasına yönlendirin
      } else {
        alert(`Giriş başarısız: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Giriş sırasında hata oluştu');
    }
  };



  const handleSettingsChange = (e) => {
    e.preventDefault();
    localStorage.setItem('additionalWordsCount', additionalWordsCount); // Save the setting to localStorage
    setShowSettings(false); // Close the modal
  };
  



  return (
    <div className="login-page">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <h1>Kelime Quiz Uygulaması</h1>
        <button className="settings-button" onClick={() => setShowSettings(true)}>
          <img src={settingsIcon} alt="Ayarlar" />
        </button>
      </header>
      <div className="login-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kullanıcı Adı:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Şifre:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="button-container">
            <button type="submit" className="form-button">Giriş Yap</button>
          </div>
          <div className="form-links">
            <Link to="/forgot-password" className="form-link">Şifremi Unuttum</Link>
            <Link to="/register" className="form-link">Kaydol</Link>
            <Link to="/add-word" className="form-link">Kelime Ekle</Link>
          </div>
        </form>
      </div>

      <Modal show={showSettings} onHide={() => setShowSettings(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ayarlar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSettingsChange}>
            <label htmlFor="additionalWordsCount">Ek kelime sayısı:</label>
            <input
              type="number"
              id="additionalWordsCount"
              value={additionalWordsCount}
              onChange={(e) => setAdditionalWordsCount(parseInt(e.target.value))}
            />
            <Button type="submit" variant="primary">Ayarları Kaydet</Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LoginForm;
