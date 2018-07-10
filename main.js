const express = require('express');
const plaid = require('plaid');
var bodyParser = require('body-parser');
const envvar = require('envvar');
var db = require('./models');
var serviceroutes = require('./app/routes/serviceroutes.js');

//db.sequelize.sync();

/*
** Environment variables for Plaid API utlization.
** These environment variables listed need to be set in
** the server before starting the service.
*/
var APP_PORT = envvar.number('APP_PORT', 8000);
var PLAID_CLIENT_ID = envvar.string('PLAID_CLIENT_ID');
var PLAID_SECRET = envvar.string('PLAID_SECRET');
var PLAID_PUBLIC_KEY = envvar.string('PLAID_PUBLIC_KEY');
var PLAID_ENV = envvar.string('PLAID_ENV', 'sandbox');

var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;
var INSTITUTION_ID = null;

/*
** Plaid client initialization:
*/
var client = new plaid.Client(
    PLAID_CLIENT_ID,
    PLAID_SECRET,
    PLAID_PUBLIC_KEY,
    plaid.environments[PLAID_ENV]
);

var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

serviceroutes(app, db, client);

var server = app.listen(APP_PORT, function() {
    console.log('plaid-walkthrough server listening on port ' + APP_PORT);
});