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

async function redisDataStructures() {
    try {
        await client.connect();
        console.log('1. Connected to Redis');

        // STRINGS -> 
                // SET, 
                // GET, 
                // MSET (can set multiple key value pairs), 
                // MGET
                // INCR - Increments a number
                // DECR - Decrements a number

        await client.set("user:name", "Nirmal Perera")
        const name = await client.get("user:name")
        console.log("2. ", name)

        await client.mSet(["user:email", "nirmal@gmail.com", "user:age", "23", "user:country", "Sri Lanka"])

        const [email, age, country] = await client.mGet(["user:email", "user:age", "user:country"])
        console.log("3. ", email, age, country)

        // delete
        await client.del("user:name")
        await client.del("user:email")
        await client.del("user:age")
        await client.del("user:country")

        // LISTS -> 
                // LPUSH - (ath the begining)
                // RPUSH - (at the end), 
                // LRANGE - (retrieves els in a given range), 
                // LPOP - (first el)
                // RPOP - (last el (right))



        await client.lPush('notes', ['note 1', 'note 2', 'note 3']);
        const extractAllNotes = await client.lRange('notes', 0, -1)
        console.log("4. ", extractAllNotes)

        const firstNote = await client.lPop("notes")

        const remainingNotes = await client.lRange('notes', 0, -1)
        console.log("5. ", remainingNotes)

        // delete
        await client.del("notes")


        // SETS -> 
                // ZADD → Adds members with scores
                // ZRANGE → Returns members in ascending order
                // ZREVRANGE → Returns members in descending order
                // ZRANK → Returns rank of a member (ascending)
                // ZREVRANK → Returns rank of a member (descending)
                // ZSCORE → Returns score of a member
                // ZREM → Removes one or more members


        await client.sAdd("user:nickName", ["aaa", "bbb", "ccc"])
        const extractUserNickNames = await client.sMembers("user:nickName")
        console.log("6. ", extractUserNickNames)

        const isAAAinNickNames = await client.sIsMember("user:nickName" , "aaa")
        console.log("7. ", isAAAinNickNames)
        
        await client.sRem("user:nickName", "aaa")
        const updatedNickNames = await client.sMembers("user:nickName");
        console.log("8. ", updatedNickNames)

        //  delete 
        await client.del("user:nickName")

        // SORTED SETS ->
                // ZADD - adds one or more members
                // ZRANGE - returns all the members list
                // ZRANK - returns the rank of the member in the sorted set
                // ZREM - removes one or more members
                // ZREVRANGE - returns all the members list in reverse order
                // ZCARD - returns the number of members in the sorted set
                // ZCOUNT - returns the number of members with a score within the given range
                // ZSCORE - returns the score associated with the given member
                // ZREVRANK - returns the reverse rank of the member in the sorted set
                // ZINTERSTORE - returns the intersection of the multiple sorted sets
                // ZUNIONSTORE - returns the union of the multiple sorted sets

        await client.zAdd('cart', [
                { score: 100, value: 'item1' },
                { score: 50, value: 'item2' },
                { score: 10, value: 'item3' },
            ]
        );
        
        const getTopCartItems = await client.zRange('cart', 0, -1)
        console.log("9. ", getTopCartItems)

        const extractAllCartItemsWithScore = await client.zRangeWithScores('cart', 0, -1)
        console.log("10. ", extractAllCartItemsWithScore);

        const cartTwoRank = await client.zRank('cart', 'item1');
        console.log("11. ", cartTwoRank)

        // delete
        await client.del('cart')

        // HASHES ->
                // HSET - sets the field to the given value
                // HGET - returns the value of the field
                // HGETALL - returns all the fields and their values
                // HDEL - deletes the field
                // HINCRBY - increments the integer value of the field by the given number
                // HINCRBYFLOAT - increments the float value of the field by the given number

        await client.hSet('product:1', {
            name: "product 1",
            description: "product one description",
            rating : '5'
        });

        const getProductRating = await client.hGet('product:1', 'rating')
        console.log("12. ", getProductRating);

        const getProductDetails = await client.hGetAll('product:1')
        console.log("13. ", getProductDetails);

        await client.hDel('product:1' , "rating")
        const updatedProductDetails = await client.hGetAll('product:1')
        console.log("14. ", updatedProductDetails);

        // delete
        await client.del('product:1')


    } catch (error) {
        console.error(error);
    } finally {
        client.quit()
    }

}
redisDataStructures();