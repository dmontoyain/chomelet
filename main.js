const request = require('request');
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

//temporary storage in memory of accesstoken, need to be stored in database
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

//apiroutes(app, db, client);

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

// db.sequelize.query("SELECT id FROM `institutions` WHERE institutionid = '" + "instr.institution.institution_id" + "'", {type: db.sequelize.QueryTypes.SELECT})
//   .then(institute => {
//     console.log(institute[0].id);
//   })

serviceroutes(app, db, client);
  
//   app.get('/accounts', function(request, response, next) {
//     // Retrieve high-level account information and account and routing numbers
//     // for each account associated with the Item.
//     client.getAuth(ACCESS_TOKEN, function(error, authResponse) {
//       if (error != null) {
//         var msg = 'Unable to pull accounts from the Plaid API.';
//         console.log(msg + '\n' + JSON.stringify(error));
//         return response.json({
//           error: msg
//         });
//       }
  
//       console.log(authResponse.accounts);
//       response.json({
//         error: false,
//         accounts: authResponse.accounts,
//         numbers: authResponse.numbers,
//       });
//     });
//   });
  
//   app.post('/transactions', function(request, response, next) {
//     // Pull transactions for the Item for the last 30 days
//     var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
//     var endDate = moment().format('YYYY-MM-DD');
//     client.getTransactions(ACCESS_TOKEN, startDate, endDate, {
//       count: 250,
//       offset: 0,
//     }, function(error, transactionsResponse) {
//       if (error != null) {
//         console.log(JSON.stringify(error));
//         return response.json({
//           error: error
//         });
//       }
//       console.log('pulled ' + transactionsResponse.transactions.length + ' transactions');
//       response.json(transactionsResponse);
//     });
// });

var server = app.listen(APP_PORT, function() {
    console.log('plaid-walkthrough server listening on port ' + APP_PORT);
});