module.exports = {
    mysql_connections_pool: process.env.MYSQL_CONNECTIONS_POOL,
    oss: {
        credentials: {
            accessKeyId: process.env.ACC_KEY_ID,
            secretAccessKey: process.env.SCR_ACC_KEY
        },
        region: process.env.OSS_REGION,
        endpoint: process.env.OSS_ENDPOINT
    },
    secret: process.env.SECRET
};