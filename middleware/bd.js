const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to Mongo Database');
  })
  .catch(error => {
    console.log('Error connected to Mongo');
  });
