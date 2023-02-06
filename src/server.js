import express from 'express';

const app = express();
app.use(express.json());

app.post('/', (req, res) => {
  res.send(`hi ${req.body.name}`);
});

app.listen(8000, () => {
  console.log('server listening on port 8000');
});
