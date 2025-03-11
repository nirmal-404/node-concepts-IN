// major releases -> API -> v1, v2....


require('dotenv').config();
const express = require('express');
const { configureCors } = require('./config/corsConfig');
const {
    requestLogger,
    addTimeStamp
} = require('./middleware/customMiddleware');
const { globalErrorHandler } = require('./middleware/errorHandler');
const { urlVersioning } = require('./middleware/apiVersioning');
const { createBasicRateLimiter } = require('./middleware/rateLimiting.js')
const itemRoutes = require('./routes/item-routes.js')

const app = express();
const PORT = process.env.PORT


// express json middleware
app.use(requestLogger);
app.use(addTimeStamp);

app.use(configureCors());
app.use(createBasicRateLimiter(100, 15*60*1000));
app.use(express.json());

app.use(urlVersioning('v1'))
app.use('/api/v1', itemRoutes)

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
