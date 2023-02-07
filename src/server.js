import express from 'express';
import { MongoClient } from 'mongodb';

let factsInfo = [
  {
    title: 'fact1',
    upvotes: 0,
    comments: [],
  },
  {
    title: 'fact2',
    upvotes: 0,
    comments: [],
  },
  {
    title: 'fact3',
    upvotes: 0,
    comments: [],
  },
];

const app = express();
app.use(express.json());

app.get('/api/facts/:title', async (req, res) => {
  const { title } = req.params;
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();

  const db = client.db('bonafide-db');

  const fact = await db.collection('facts').findOne({ title });

  if (fact) {
    res.json(fact);
  } else {
    res.sendStatus(404);
  }
});

app.put('/api/facts/:title/upvote', async (req, res) => {
  const { title } = req.params;

  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();

  const db = client.db('bonafide-db');
  await db.collection('facts').updateOne(
    { title },
    {
      $inc: { upvotes: 1 },
    }
  );

  const fact = await db.collection('facts').findOne({ title });

  if (fact) {
    fact.upvotes += 1;
    res.send(`The fact "${fact.title}" now has ${fact.upvotes} upvotes!`);
  } else {
    res.send("the article doesn't exist");
  }
});

app.post('/api/facts/:title/comments', (req, res) => {
  const { title } = req.params;
  const { postedBy, text } = req.body;

  const fact = factsInfo.find((fact) => fact.title === title);

  if (fact) {
    fact.comments.push({ postedBy, text });
    res.send(fact.comments);
  } else {
    res.send("the article doesn't exist");
  }
});

app.listen(8000, () => {
  console.log('server listening on port 8000');
});
