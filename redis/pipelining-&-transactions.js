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

        // Transactions - Commands grouped together and executed atomically
        const transaction = client.multi();  // Used for transaction
        transaction.set('key-transaction1', 'value1');
        transaction.set('key-transaction2', 'value2');
        transaction.get('key-transaction1');
        transaction.get('key-transaction2');
        const transactionResults = await transaction.exec();
        console.log('Transaction Results:', transactionResults);

        // Pipelining - Sending commands in a batch for performance improvement
        const pipeline = client.multi();  // Used for pipelining
        pipeline.set('key-pipeline1', 'value1');
        pipeline.set('key-pipeline2', 'value2');
        pipeline.get('key-pipeline1');
        pipeline.get('key-pipeline2');
        const pipelineResults = await pipeline.exec();
        console.log('Pipeline Results:', pipelineResults);

        // Batch Data Operations - Sending multiple commands in a batch
        const batchPipeline = client.multi();  // Used for batch operation
        for (let i = 0; i < 1000; i++) {
            batchPipeline.set(`user:${i}:action`, `Action ${i}`);
        }
        await batchPipeline.exec();

        // Mixed Operations (Decrement and Increment) in a transaction
        const mixedOperations = client.multi();  // Mixed operations transaction
        mixedOperations.decrBy('account:1234:balance', 100); // Decrease balance
        mixedOperations.incrBy('account:0000:balance', 100); // Increase balance
        const finalResults = await mixedOperations.exec();
        console.log('Mixed Operations Results:', finalResults);


        const cartExample = client.multi();
        cartExample.hIncrBy('cart:1234', 'item_count', 1);
        cartExample.hIncrBy('cart:1234', 'total_price', 10);
        const cartExResults = await cartExample.exec();
        console.log(cartExResults)

    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.quit();
    }
}

testAdditionalFeatures();