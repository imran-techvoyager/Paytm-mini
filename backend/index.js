const express = require('express');

const cors = require('cors');

app.use(cors());
app.use(express.json()); //this is body parser that lets you parse json objects from the request body
const mainRouter = require('./routes/index');

const app = express();

app.use("/api/v1", mainRouter);
app.listen(3000, () => {
    console.log(`Server is running on port 3000 at http://localhost:3000`);
})