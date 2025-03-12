const redis = require('redis');

const client = redis.createClient({
    host: 'localhost',
    port: 6379
});

client.on('error', (err) => {
    console.log('Redis client error ' + err);
});

async function testAdditionalFeatures() {
    try {
        await client.connect();

        console.log("-------------Ultimate Performance Test-------------");

        console.time("Without pipelining")
            for(let i=0; i<1000;i++){
                await client.set(`user${i}`, `user_values${i}`)
            }
        console.timeEnd("Without pipelining")



        console.time("With pipelining");
            const bigPipeline = client.multi();
            for(let i=0; i<1000;i++){
                bigPipeline.set(`user${i}`, `user_values${i}`)
            }
            await bigPipeline.exec()
        
        console.timeEnd("With pipelining")
    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.quit();
    }
}

testAdditionalFeatures();