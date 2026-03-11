const { app } = require("./app");
require("dotenv").config();

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`PurrMatch backend listening on http://localhost:${port}`);
});

