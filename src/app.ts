import express, { type Application, type Request, type Response } from "express";
import { pool } from "./db";
import { userRoute } from "./modules/user/user.route";
const app: Application = express();

app.use(express.json());

app.use('/api/users', userRoute);

app.get('/', (req: Request, res: Response) => {
  //   res.send('Hello World!');
  res.status(200).json({
    message: "Express Server",
    author: "Sabit"
  })
 }
);

export default app;