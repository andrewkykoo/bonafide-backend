import express from 'express';

let factsInfo = [
  {
    username: 'user1',
    number: '1',
    upvotes: 0,
  },
  {
    username: 'user1',
    number: 2,
    upvotes: 0,
  },
  {
    username: 'user2',
    number: 1,
    upvotes: 0,
  },
];

const app = express();
app.use(express.json());

app.put('/api/facts/:usernameAndnumber/upvote', (req, res) => {
  const { usernameAndnumber } = req.params;

  const fact = factsInfo.find(
    (fact) => `${fact.username}&${fact.number}` === usernameAndnumber
  );
  if (fact) {
    fact.upvotes += 1;
    res.send(
      `${fact.username}'s number ${fact.number} article now has ${fact.upvotes} upvotes`
    );
  } else {
    res.send("the article doesn't exist");
  }
});

// app.get('/hello/:name', (req, res) => {
//   const { name } = req.params;
//   res.send(`hello ${name}`);
// });

// app.post('/', (req, res) => {
//   res.send(`hi ${req.body.name}`);
// });

app.listen(8000, () => {
  console.log('server listening on port 8000');
});
