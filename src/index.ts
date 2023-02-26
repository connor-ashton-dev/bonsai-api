import { PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();
const app = express();
const cors = require('cors');
app.use(express.json());

app.use(
  cors({
    origin: '*',
  })
);

app.get('/', (req, res) => {
  console.log('you found me');
  res.json({ message: 'ouch' });
});

app.post('/login', async (req, res) => {
  //check if user exists
  let username = req.body.username;
  const foundUser = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!foundUser) {
    try {
      const newUser = await prisma.user.create({
        data: {
          username: username,
        },
      });

      console.log('Created new user: ', newUser);
      res.json({ message: username });
    } catch (error) {
      res.json({ message: 'something bad happened' });
    }
  } else {
    res.json({ message: username });
  }
});

app.post('/retrievePictures', async (req, res) => {
  let username = req.body.username;
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (user) {
    let userId = user.id;
    console.log(userId);

    let picArray = await prisma.image.findMany({
      where: {
        userId: userId,
      },
    });

    if (picArray) {
      console.log(picArray);
      res.send(picArray);
    }
  }
});

app.post('/upload', async (req, res) => {
  let username = req.body.username;
  let image = req.body.data;
  //find user
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (user) {
    try {
      const newImage = await prisma.image.create({
        data: {
          url: image,
          userId: user.id,
        },
      });
      res.json(newImage);
    } catch (error) {
      res.json({ message: 'ERROR: something went wrong with image upload' });
    }
  }
});

app.listen(3001, () =>
  console.log('REST API server at: http://localhost:3001')
);
