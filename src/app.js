import express from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import morganMiddleware from "./logger/morgan.logger.js";
import { DB_NAME } from "./constant.js";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// required for passport
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    
    cookie: {
      maxAge: 60 * 1000,
       //expires after 60 second
    },
    store: MongoStore.create({
      //it is used to store session on database
      mongoUrl: process.env.MONGO_DB_URI,
      collectionName: "mysession",
      dbName: DB_NAME,
    }),
  })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(morganMiddleware);
//import routes

import userRouter from "./routes/user.route.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

//declaration of the route
app.use("/api/v1", userRouter);
app.use(errorHandler);
// common error handling middleware

export { app };
