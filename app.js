require('dotenv').config();
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const {asyncLocalStorage, integrationGenerateContext} = require('./config/context');
const {integrationAttachResponseBody, integrationAttachContext, httpLogger} = require('./config/httpLogger');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({
    type: 'application/json',
    limit: '50mb',
    extended: true
}));

let corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
app.use(cors(corsOptions));
app.options('*', cors(corsOptions))

app.use(integrationAttachResponseBody);
app.use(integrationGenerateContext);
app.use(integrationAttachContext);

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.json({
            message: "request not permitted",
            error: true,
        });
    }
    next();
});

module.exports = app;