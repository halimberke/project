const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const sequelize = new Sequelize('kelimeler', 'quiz', 'halimo3232', {
  dialect: 'mssql',
  host: 'HALIMO',
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
  port: 1433,
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true
});

const Word = sequelize.define('Word', {
  english: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  turkish: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sentences: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true
});

const UserWord = sequelize.define('UserWord', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  wordId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Word,
      key: 'id'
    }
  },
  correctCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastTested: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // 0: not learned, 1: learning, 2: learned
  }
}, {
  timestamps: true
});

// İlişkilendirmeleri ayarla
User.belongsToMany(Word, { through: UserWord, foreignKey: 'userId' });
Word.belongsToMany(User, { through: UserWord, foreignKey: 'wordId' });

UserWord.belongsTo(User, { foreignKey: 'userId' });
UserWord.belongsTo(Word, { foreignKey: 'wordId' });

const initializeDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('Veritabanı senkronizasyonu tamamlandı');
  } catch (error) {
    console.error('Veritabanına bağlanırken hata oluştu:', error);
  }
};

initializeDatabase();

app.get('/', (req, res) => {
  res.send('Backend çalışıyor');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = await User.create({
      username,
      password,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    res.status(201).json(newUser);
    console.log('Kullanıcı başarıyla kaydedildi:', newUser.toJSON());
  } catch (error) {
    console.error('Kullanıcı kaydedilemedi:', error.message);
    res.status(400).json({ error: 'Kullanıcı kaydedilemedi', details: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (user && user.password === password) {
      res.status(200).json({ message: 'Giriş başarılı', user });
    } else {
      res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu', details: error.message });
  }
});



app.get('/daily-quiz/:userId', async (req, res) => {
  const { userId } = req.params;
  const additionalWordsCount = parseInt(req.query.additionalWordsCount) || 10; // Default to 10 if not provided

  try {
    // Öğrenilme aşamasında olan kelimeleri bul
    const learningWords = await UserWord.findAll({
      where: { userId, status: 1 },
      include: [{ model: Word }]
    });

    // Öğrenilme aşamasındaki kelimeleri ekle
    let dailyWords = learningWords.map(userWord => userWord.Word);

    // Geriye kalan kelimeleri rastgele ekle
    const additionalWords = await Word.findAll({
      where: {
        id: { [Sequelize.Op.notIn]: dailyWords.map(word => word.id) }
      }
    });
    const additionalWordsSample = additionalWords.sort(() => 0.5 - Math.random()).slice(0, additionalWordsCount);

    dailyWords = dailyWords.concat(additionalWordsSample);

    res.status(200).json(dailyWords);
  } catch (error) {
    console.error('Günlük quiz kelimeleri alınamadı:', error.message);
    res.status(500).json({ error: 'Günlük quiz kelimeleri alınamadı', details: error.message });
  }
});



app.post('/quiz', async (req, res) => {
  const { userId, wordId, isCorrect } = req.body;
  try {
    const userWord = await UserWord.findOne({ where: { userId, wordId } });
    if (userWord) {
      userWord.correctCount = isCorrect ? userWord.correctCount + 1 : 0;
      userWord.status = userWord.correctCount >= 6 ? 2 : (isCorrect ? 1 : 0); // Durum güncelleme
      userWord.lastTested = new Date();
      await userWord.save();
    } else {
      await UserWord.create({
        userId,
        wordId,
        correctCount: isCorrect ? 1 : 0,
        lastTested: new Date(),
        status: isCorrect ? 1 : 0
      });
    }
    res.status(200).json({ message: 'Quiz sonucu kaydedildi' });
  } catch (error) {
    console.error('Quiz sonucu kaydedilemedi:', error.message);
    res.status(500).json({ error: 'Quiz sonucu kaydedilemedi', details: error.message });
  }
});

app.post('/add-word', async (req, res) => {
  const { english, turkish, sentences, image } = req.body;
  try {
    const newWord = await Word.create({ english, turkish, sentences, image });
    res.status(201).json(newWord);
  } catch (error) {
    console.error('Kelime eklenemedi:', error.message);
    res.status(400).json({ error: 'Kelime eklenemedi', details: error.message });
  }
});





app.get('/report/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const totalWords = await UserWord.count({ where: { userId } });
    const learnedWords = await UserWord.count({ where: { userId, status: 2 } });
    const learningWords = await UserWord.count({ where: { userId, status: 1 } });
    const notLearnedWords = await UserWord.count({ where: { userId, status: 0 } });

    const learnedPercentage = (learnedWords / totalWords) * 100 || 0;
    const learningPercentage = (learningWords / totalWords) * 100 || 0;
    const notLearnedPercentage = (notLearnedWords / totalWords) * 100 || 0;

    const report = {
      totalWords,
      learnedWords,
      learningWords,
      notLearnedWords,
      learnedPercentage,
      learningPercentage,
      notLearnedPercentage
    };

    res.status(200).json(report);
  } catch (error) {
    console.error('Rapor alınamadı:', error.message);
    res.status(500).json({ error: 'Rapor alınamadı', details: error.message });
  }
});






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
