// streams -> helps tp read write data to a file
//  Readable -> used for read
//  Writable -> used for write
//  Duplex -> can be used for both read and write  (TCP socket)
//  Transform -> zlib etreams
//  (+) -> tieme and memory efficient


const fs = require("fs")
const zlib = require("zlib")
const crypto = require("crypto")
const { Transform } = require("stream");
const { pid } = require("process");
const { log } = require("console");

class EncryptStream extends Transform{
    constructor(key, vector) {
        super();
        this.key = key;
        this.vector = vector;
    }

    _transform(chunk, encoding, callback){
        const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.vector)
        const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]) // encrypt the chunk data
        this.push(encrypted)
        callback()
    }
}

const key = crypto.randomBytes(32)
const vector = crypto.randomBytes(16)

const readableStream = fs.createReadStream('input.txt')

// new gzip object to compress the data
const gzipStream = zlib.createGzip()

const encryptStream = new EncryptStream(key,vector)

const writableStream = fs.createWriteStream('output.txt.gz.enc')

// read -. compress -> encrypt -> write

readableStream.pipe(gzipStream).pipe(encryptStream).pipe(writableStream)

console.log('Streaming -> compressing -> Writing')