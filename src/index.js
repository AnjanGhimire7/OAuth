import { app } from "./app.js";
import connectDB from "./database/db.js";
import cluster from "node:cluster";
import os from "node:os";
import http from "http";

import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
const totalCpu = os.cpus().length;
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is runnning`);
  //fork the workers
  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
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
  console.log(`Worker ${process.pid} is running`);
}
