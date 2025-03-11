const cors = require('cors')

const configureCors = ()=> {
    return cors({
        //  origin -> this will tell that which origins you want user can access your api
        orign : (origin, callback)=>{
            const allowedOrigins = [
                'http://localhost:3000', // localdev
                'https:mydomain.com' // production domain
            ]

            if(!origin || allowedOrigins.indexOf(origin) !== -1){
                callback(null, true) // giving permission so that request can be allowed
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        }, 
        methods : ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders : [
            'Content-Type',
            'Authorization',
            'Accept-Version'
        ],
        exposedHeaders : ['X-Total-Count', 'Content-Range'],
        credentials : true, // enable suport for cookies
        preflightContinue : false,
        maxAge: 600, // cache pre flight responses for 10 mins (600s). -> avoid sending otions reqquests multiple times 
        optionsSuccessStatus : 204
    })
}

module.exports ={configureCors}