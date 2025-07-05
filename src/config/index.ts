const ENV = process.env

const config = (key:string, _default:any=null) => (ENV[key] ?? _default)

export default {
    port: config("PORT", '3000'),
    nodeEnv: config("NODE_ENV", 'development'),

    appId: config("appId", "STORAGE_DEV"),
    storagePath: config("STORAGE_PATH", "."),
    db: {
        mongoUrl: config("MONGO_URL", "http://127.0.0.1:2015/dev/api/v1/mongo"),
        mongoToken: config("MONGO_TOKEN", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.wv7sVaBu5q4mCYxslk3iT9jFTz13Qa_L5kceUGskP9k"),
        manageUrl: config("MANAGE_URL", "http://127.0.0.1:2015/dev/api/v1/manage"),
        manageToken: config("MANAGE_TOKEN", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.wv7sVaBu5q4mCYxslk3iT9jFTz13Qa_L5kceUGskP9k"),
    }
}; 