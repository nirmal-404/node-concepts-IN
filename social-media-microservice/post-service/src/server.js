require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const { rateLimit } = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const cors = require("cors");
const helmet = require("helmet");
const postRoutes = require("./routes/post-routes");
const errorHandler = require("./middleware//errorHandler");
const logger = require("./utils/logger");


const app = express();
const PORT = process.env.PORT || 3002;

//connect to mongodb
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => logger.info("Connected to mongodb"))
    .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());


// app.use((req, res, next) => {
//     logger.info(`Received ${req.method} request to ${req.url}`);
//     logger.info(`Request body, ${req.body}`);
//     next();
// });

const createPostLimiter = rateLimit({
    windowMs: 1* 60 * 1000,
    limit: 10, // 10 requests in 1 min
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`create-post endpoint rate limit exceeded for IP ${req.ip}`);
        res.status(429).send({ success: false, message: 'Too many requests for create-post' });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
})

// Apply the rate limiting middleware
app.use('/api/posts/create-post', createPostLimiter);

// routes -> pass redisclient to routes
app.use(
    "/api/posts",
    (req, res, next) => {
      req.redisClient = redisClient;
      next();
    },
    postRoutes
  );
  
  app.use(errorHandler);

  
app.listen(PORT, () => {
    logger.info(`Post service is running on port ${PORT}`)
})
  
  //unhandled promise rejection
  
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
  });