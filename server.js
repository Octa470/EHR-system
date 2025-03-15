require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

fs.readdirSync(path.join(__dirname, "routes")).forEach((file) => {
  if (file.endsWith(".js")) {
    const route = `/api/${file.replace(".js", "")}`;
    app.use(route, require(`./routes/${file}`));
    console.log(`Loaded route: ${route}`);
  }
});

app.get("/", (req, res) => res.send("EHR API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
