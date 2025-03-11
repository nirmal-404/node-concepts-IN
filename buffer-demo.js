//  objects -> handle binary data

//  use cases -> file system operations, cryptography, image processing

const bufferOne = Buffer.alloc(10) // allocate a buffer of 10 bytes -> zeros
console.log(bufferOne)

const bufferFromString = Buffer.from("Hello")
console.log(bufferFromString)

const bufferFromArrayOfIntegers = Buffer.from([1,2,3,4,5])
console.log(bufferFromArrayOfIntegers)

bufferOne.write("nirmal")
console.log("After writing nirmal to bufferone", bufferOne.toString()) // convert buffer to string

console.log(bufferFromString[0]);

console.log(bufferFromString.slice(0,3));


const concatBuffers = Buffer.concat([bufferOne, bufferFromString])
console.log(concatBuffers)

console.log(concatBuffers.toJSON())
