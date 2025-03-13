require('dotenv').config()
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis')
const helmet = require('helmet')
const { rateLimit } = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const logger = require('./utils/logger')
const proxy = require('express-http-proxy')
const errorHandler = require('./middleware/errorHandler')

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL)

app.use(helmet())
app.use(cors())
app.use(express.json())

// rate limiting

const ratelimitOptions = rateLimit({
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

app.use(ratelimitOptions);

app.use((req, res, next) => {
    logger.info(`Received ${req.method} reqest to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next()
})

// create a proxy
const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error: ${err.message}`)
        res.status(500).json({
            message: "Internal sever error", error : err.message
        })
    }
}

// setting up proxy for identity-service
app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json";
        console.log(`Proxy Request Headers:`, proxyReqOpts.headers);
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        console.log(`Response from Identity Service: ${proxyRes.statusCode}`);
        return proxyResData;
    }
}));

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`API Gateway is running on port ${PORT}`)
    logger.info(`Identity Service is running on port ${process.env.IDENTITY_SERVICE_URL}`)
    logger.info(`Redis url ${process.env.REDIS_URL}`)
})