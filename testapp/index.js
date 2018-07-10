'use strict';

var envvar = require('envvar');
var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var plaid = require('plaid');
var Req = require('request');

var APP_PORT = envvar.number('APP_PORT', 8000);
var PLAID_CLIENT_ID = envvar.string('PLAID_CLIENT_ID');
var PLAID_SECRET = envvar.string('PLAID_SECRET');
var PLAID_PUBLIC_KEY = envvar.string('PLAID_PUBLIC_KEY');
var PLAID_ENV = envvar.string('PLAID_ENV', 'sandbox');

// We store the access_token in memory - in production, store it in a secure
// persistent data store
var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;

// Initialize the Plaid client
var client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV]
);

var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.disable('x-powered-by');
app.use(bodyParser.json());

app.get('/', function(request, response, next) {
  response.render('index.ejs', {
    PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
    PLAID_ENV: PLAID_ENV,
  });
});

app.post('/get_access_token', function(request, response, next) {
  PUBLIC_TOKEN = request.body.public_token;
  /*
  ** ONLY FOR TESTING PURPOSES, you can change userid to
  ** any of the users available in the database.
  */
 console.log("sending request");
  Req.post(
    'http://localhost:8000/createaccounts',
    { json: { public_token: PUBLIC_TOKEN, userid: 2}},
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      }
      else {
      console.log("User Account succesfully processed in database")
      }
    }
  );
  
});

app.get('/accounts', function(request, response, next) {
  // Retrieve high-level account information and account and routing numbers
  // for each account associated with the Item.
  client.getAuth(ACCESS_TOKEN, function(error, authResponse) {
    if (error != null) {
      var msg = 'Unable to pull accounts from the Plaid API.';
      console.log(msg + '\n' + JSON.stringify(error));
      return response.json({
        error: msg
      });
    }

    console.log(authResponse.accounts);
    response.json({
      error: false,
      accounts: authResponse.accounts,
      numbers: authResponse.numbers,
    });
  });
});


app.post('/transactions', function(request, response, next) {
  // Pull transactions for the Item for the last 30 days
  var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  var endDate = moment().format('YYYY-MM-DD');
  client.getTransactions(ACCESS_TOKEN, startDate, endDate, {
    count: 250,
    offset: 0,
  }, function(error, transactionsResponse) {
    if (error != null) {
      console.log(JSON.stringify(error));
      return response.json({
        error: error
      });
    }
    console.log('pulled ' + transactionsResponse.transactions.length + ' transactions');
    response.json(transactionsResponse);
  });
});

var server = app.listen(3000, function() {
  console.log('plaid-walkthrough server listening on port 3000');
});
