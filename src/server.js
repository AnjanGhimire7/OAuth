import { app } from "./app.js";
import connectDB from "./database/db.js";
import cluster from "node:cluster";
import os from "node:os";
import http from "http";

import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    const createServer = http.createServer(app);
    createServer.listen(process.env.PORT || 5000, () => {
      console.log(`server is running on the port:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongodb connection failed!!!", error);
  });
