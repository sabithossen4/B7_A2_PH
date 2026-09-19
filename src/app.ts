import express, { type Application, type Request, type Response } from "express";
import { userRoute } from "./modules/user/user.route";
import { profileRoute } from "./modules/profile/profile.route";
import { authRouter } from "./auth/auth.route";
import logger from "./middleware/logger";
import CookieParser from "cookie-parser";
import cors from "cors";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express();

app.use(CookieParser());
app.use(express.json());
app.use(logger);
app.use('/api/users', userRoute);
app.use('/api/profile', profileRoute);
app.use('/api/auth',authRouter )
const corsOptions = {
  origin: 'http://localhost:3000'
}
app.use(cors(corsOptions));


app.get('/', (req: Request, res: Response) => {
  //   res.send('Hello World!');
  res.status(200).json({
    message: "Express Server",
    author: "Sabit"
  })
 }
);

// Global Error Handling Middleware
app.use(globalErrorHandler);

export default app;