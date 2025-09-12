import express from "express";
import cors from "cors";
import spaceInvadersRoutes from "./routes/spaceInvaders.js";
import game1942Routes from "./routes/game1942.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/spaceInvaders", spaceInvadersRoutes);
app.use("/game1942", game1942Routes);

app.get("/", (req, res) => {
  res.send("Hola");
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
