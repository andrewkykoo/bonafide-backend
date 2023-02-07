import express from 'express';
import { db, connectToDb } from './db.js';

const app = express();
app.use(express.json());

app.get('/api/facts/:title', async (req, res) => {
  const { title } = req.params;

  const fact = await db.collection('facts').findOne({ title });

  if (fact) {
    res.json(fact);
  } else {
    res.sendStatus(404);
  }
});

app.put('/api/facts/:title/upvote', async (req, res) => {
  const { title } = req.params;

  await db.collection('facts').updateOne(
    { title },
    {
      $inc: { upvotes: 1 },
    }
  );

  const fact = await db.collection('facts').findOne({ title });

  if (fact) {
    res.send(`The fact "${fact.title}" now has ${fact.upvotes} upvotes!`);
  } else {
    res.send("the article doesn't exist");
  }
});

app.post('/api/facts/:title/comments', async (req, res) => {
  const { title } = req.params;
  const { postedBy, text } = req.body;

  await db
    .collection('facts')
    .updateOne({ title }, { $push: { comments: { postedBy, text } } });

  const fact = await db.collection('facts').findOne({ title });

  if (fact) {
    res.send(fact.comments);
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
