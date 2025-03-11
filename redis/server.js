// creating a redis connection

const redis = require('redis');

const client = redis.createClient({
    host: 'localhost',
    port: 6379
});
// TODO
// event listener
client.on('error', (err) => {
    console.log('Redis client error ' + err);
});

async function testRedisConnection() {
    try {
        await client.connect();
        console.log('Connected to Redis');

        // set
        await client.set("name", "nirmal")

        // get
        const extractValue = await client.get("name");
        console.log(extractValue);

        // delete
        const deleteCount = await client.del("name")
        console.log(deleteCount)

        // set
        await client.set("count", 100);

        // increment
        const incr = await client.incr("count");
        console.log(incr)

        // decrement
        const decr = await client.decr("count");
        console.log(decr)

        // delete
        await client.del("count")
        
        console.log(await client.get("count"))

    } catch (error) {
        console.log('Error connecting to Redis: ' + error);
    } finally {
        await client.quit()
    }
}

testRedisConnection();