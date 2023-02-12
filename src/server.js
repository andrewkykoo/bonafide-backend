import fs from 'fs';
import admin from 'firebase-admin';
import express from 'express';
import { db, connectToDb } from './db.js';

const credentials = JSON.parse(fs.readFileSync('./credentials.json'));

admin.initializeApp({ credential: admin.credential.cert(credentials) });

const app = express();
app.use(express.json());

app.use(async (req, res, next) => {
  const { authtoken } = req.headers;

  if (authtoken) {
    try {
      req.user = await admin.auth().verifyIdToken(authtoken);
    } catch (error) {
      return res.sendStatus(400);
    }
  }

  req.user = req.user || {};

  next();
});

app.get('/api/facts/:title', async (req, res) => {
  let { title } = req.params;
  const { uid } = req.user;

  title = title
    .split('')
    .map((c) => (c === ' ' ? '%20' : c))
    .join('');

  const fact = await db.collection('facts').findOne({ title });

  if (fact) {
    const upvoteIds = fact.upvoteIds || [];
    fact.canUpvote = uid && !upvoteIds.includes(uid);
    res.json(fact);
  } else {
    res.sendStatus(404);
  }
});

app.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
});

app.put('/api/facts/:title/upvote', async (req, res) => {
  let { title } = req.params;
  const { uid } = req.user;

  title = title
    .split('')
    .map((c) => (c === ' ' ? '%20' : c))
    .join('');

  const fact = await db.collection('facts').findOne({ title });

  if (fact) {
    const upvoteIds = fact.upvoteIds || [];
    const canUpvote = uid && !upvoteIds.includes(uid);

    if (canUpvote) {
      await db.collection('facts').updateOne(
        { title },
        {
          $inc: { upvotes: 1 },
          $push: { upvoteIds: uid },
        }
      );
    }
    const updatedFact = await db.collection('facts').findOne({ title });
    res.send(updatedFact);
  } else {
    res.send('article does not exist');
  }
});

app.post('/api/facts/:title/comments', async (req, res) => {
  let { title } = req.params;
  const { text } = req.body;
  const { email } = req.user;

  title = title
    .split('')
    .map((c) => (c === ' ' ? '%20' : c))
    .join('');

  await db
    .collection('facts')
    .updateOne({ title }, { $push: { comments: { email, text } } });

  const fact = await db.collection('facts').findOne({ title });

  if (fact) {
    res.json(fact);
  } else {
    res.send("the article doesn't exist");
  }
});

connectToDb(() => {
  console.log('successfully connected to database');
  app.listen(8000, () => {
    console.log('server listening on port 8000');
  });
});
