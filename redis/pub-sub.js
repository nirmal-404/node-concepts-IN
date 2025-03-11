//  pub - sub -> is a messaging pattern
//  pusblisher -> send messege to a chanel
//  subscriber -> consume

// creating a redis connection

const redis = require('redis');

const client = redis.createClient({
    host: 'localhost',
    port: 6379
});
// event listener
client.on('error', (err) => {
    console.log('Redis client error ' + err);
});

async function testAdditionalFeatures() {
    try {
        await client.connect();
        
        const subscriber = client.duplicate(); // create a new client -> shares the same conncetion
        await subscriber.connect(); // connect to redis server for the subscriber

        await subscriber.subscribe('dummy-channel', (message, channel)=>{
            console.log(`📩 New message received on '${channel}': ${message}`)
        })
        
        // publish messege to dummy-channel
        await client.publish('dummy-channel', 'Hello dummy');
        await client.publish('dummy-channel', 'I am publisher');
        await client.publish('dummy-channel', 'WYD');

        await new Promise((resolve)=>setTimeout(resolve, 3000))

        await subscriber.unsubscribe('dummy-channel')
        await subscriber.quit() // close the subsriber connction


    } catch (error) {
        console.error(error);
    } finally {
        client.quit()
    }

}
testAdditionalFeatures();