// const express = require('express');
// var router = express.Router();
// var models = require('../models');
module.exports = function (app, db, client) {
    router.post('/retrieve_accountsdata', function(request, response, next) {
    
        PUBLIC_TOKEN = request.body.public_token;
        
        client.exchangePublicToken(PUBLIC_TOKEN, function(error, tokenResponse) {
            if (error != null) {
                var msg = 'Error: exchanging Plaid service public_token';
                console.log(msg + '\n' + JSON.stringify(error));
                return response.json({
                    error: msg
                });
            }

            ACCESS_TOKEN = tokenResponse.access_token;
            ITEM_ID = tokenResponse.item_id;
            console.log('Access Token: ' + ACCESS_TOKEN);
            console.log('Item ID: ' + ITEM_ID);
            response.json({
                'error': false
            });
        });
    });
};

