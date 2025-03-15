require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mediaRoutes = require("./routes/media-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const Redis = require("ioredis");
const { rateLimit } = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis');
const { consumeEvent, connectToRabbitMQ } = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./eventHandlers/media-event-handlers");

const app = express();
const PORT = process.env.PORT || 3003;

//connect to mongodb
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => logger.info("Connected to mongodb"))
    .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "2mb" })); 
app.use(express.urlencoded({ limit: "2mb", extended: true })); 

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
});

const uploadImageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 50, // 50 requests in 15 min
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`create-post endpoint rate limit exceeded for IP ${req.ip}`);
        res.status(429).send({ success: false, message: 'Too many requests for upload-image' });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
})

// Apply the rate limiting middleware
app.use('/api/media/upload', uploadImageLimiter);

app.use("/api/media", mediaRoutes);

app.use(errorHandler);


async function startServer() {
    try {
      await connectToRabbitMQ();
  
      //consume all the events
      await consumeEvent("post.deleted", handlePostDeleted);
  
      app.listen(PORT, () => {
        logger.info(`Media service running on port ${PORT}`);
      });
    } catch (error) {
      logger.error("Failed to connect to server", error);
      process.exit(1);
    }
  }
  
  startServer();
//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
});