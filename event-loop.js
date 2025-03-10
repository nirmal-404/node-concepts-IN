// timers -> it will execute callbacks schedule by setTimeout and setInterval

//  timers -> pending callbacks -> ideal -> prepare -> poll -> check -> close callback

const fs = require("fs")
const crypto = require("crypto")
const { log } = require("console")

console.log("1. script start")
setTimeout(
    ()=> {
        console.log("2. set timeout 0s callback (macrotask)")
    }, 0
)

setTimeout(
    ()=> {
        console.log("3. set timeout 0s callback (macrotask)")
    }, 0
)

setImmediate(()=> {
    console.log("4. setImmediate callback (check)")
})

Promise.resolve().then(() => {
    console.log("5. promise resolved (microtask)");
});


process.nextTick(()=> {
    console.log("6. process.nextTick callback (microtask)")
})

fs.readFile(__filename, ()=> {
    console.log("6. file read operation (I/O callback)")
})

crypto.pbkdf2('secret', 'salt', 10000, 64, 'sha512', (err, key)=> {
    if(err) throw err
    console.log('8. pbkdf2 operation completed (CPU intensive task)')
})

console.log("9. script ends")