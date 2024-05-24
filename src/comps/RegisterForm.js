import React, { useState } from 'react';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Success:', data);
        alert('Kayıt başarılı!');
        setUsername('');
        setPassword('');
      } else {
        alert(`Kayıt başarısız: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Kayıt sırasında hata oluştu');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
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
      <button type="submit" className="form-button">Kaydol</button>
    </form>
  );
};

export default RegisterForm;
