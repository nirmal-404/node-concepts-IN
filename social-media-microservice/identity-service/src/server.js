require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./utils/logger')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const { RateLimiterRedis } = require('rate-limiter-flexible')
const Redis = require('ioredis')
const { rateLimit } = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const routes = require('./routes/identity-service')
const errorHandler = require('./middleware/errorHandler')


const app = express();
const PORT = process.env.PORT || 3001

// connect to mongodb
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => logger.info("Connected to mongoDB"))
    .catch((e) => logger.error("Monogdb conection error", e))

const redisClient = new Redis(process.env.REDIS_URL)
// middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    logger.info(`Received ${req.method} reqest to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next()
})

// DDos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1, // 10 requests in one sec
})

app.use((req, res, next) => {
    rateLimiter.consume(req.ip)
        .then(() => { next() })
        .catch(() => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).send({ success: false, message: 'Too many requests' });
        })
})

// IP based rate limitign for sensitive endpoints

const sensitiveEndpointsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes 
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP ${req.ip}`);
        res.status(429).send({ success: false, message: 'Too many requests' });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
})
// Apply the rate limiting middleware to sensitive endpoints
app.use('/api/auth/register', sensitiveEndpointsLimiter);

// Routes
app.use('/api/auth', routes)

// error handler
app.use(errorHandler)


app.listen(PORT, () => {
    logger.info(`Identity service is running on port ${PORT}`)
})

//  unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});