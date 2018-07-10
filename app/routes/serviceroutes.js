var Moment = require('moment');

module.exports = function (app, db, client) {
    app.post('/createaccounts', function(request, response, next) {
        console.log("received request");
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
    
            client.getItem(ACCESS_TOKEN, (error, itemResponse) => {
                if (error != null) {
                    console.log(JSON.stringify(error));
                    return response.json({
                        error: error
                    });
                }

                client.getInstitutionById(itemResponse.item.institution_id, (err, instrRes) => {
                    if (err != null) {
                        var msg = 'Unable to pull institution information from the Plaid API.';
                        console.log(msg + '\n' + JSON.stringify(error));
                        return response.json({
                          error: msg
                        });
                    }

                    db.sequelize.query("SELECT id FROM `institutions` WHERE institutionid = '" + instrRes.institution.institution_id + "'", {type: db.sequelize.QueryTypes.SELECT})
                    .then(foundinstitution => {
//                        console.log(foundinstitution);
//                        console.log(foundinstitution.length);
                        if (foundinstitution.length == 0) {
                            console("institute not found");
                            db.institution.create({
                                name: instrRes.institution.name,
                                institutionid: instrRes.institution.institution_id
                            })
                            .then((result) => {
                                db.sequelize.query("SELECT id FROM `institutions` WHERE institutionid = '" + instrRes.institution.institution_id + "'", {type: db.sequelize.QueryTypes.SELECT})
                                .then(institute => {
                                    INSTITUTION_ID =  institute[0].id;
                                    db.item.create({
                                        itemid: ITEM_ID,
                                        access_token: ACCESS_TOKEN,
                                        user: request.body.userid,
                                        institution: institute[0].id
                                    });

                                    pullMoreData(request.body.userid, app, db, client);
                                });
                            });
                        } 
                        else {
                            console.log("institute found");
                            INSTITUTION_ID = foundinstitution[0].id;
                            db.item.create({
                                itemid: ITEM_ID,
                                access_token: ACCESS_TOKEN,
                                user: request.body.userid,
                                institution: foundinstitution[0].id
                            });

                            pullMoreData(request.body.userid, app, db, client);
                        }
                    });
                });
            });
        });
    });
};

function saveTransaction(db, transact) {
    db.sequelize.query("SELECT id FROM accounts WHERE accountid = '" + transact.account_id + "'", {type: db.sequelize.QueryTypes.SELECT})
    .then((account) => {
        db.transaction.create({
            transaction: transact.transaction_id,
            place: transact.name,
            total: transact.amount,
            date: transact.date,
            account: account[0].id,
        });
    });
}

function pullAuth(userid, app, db, client) {
    
    client.getAuth(ACCESS_TOKEN, (err, results) => {
        if (results.numbers.ach.length > 0) {
            db.sequelize.query("SELECT id FROM accounts WHERE user = " + userid + " AND accountno = '" + results.numbers.ach[0].account + "'", {type: db.sequelize.QueryTypes.SELECT})
            .then(account => {
                if (account.length == 0)
                {
                    for (var i = 0; i < results.accounts.length; i++) {

                        db.account.create({
                            accountno: results.numbers.ach[0].account,
                            institution: INSTITUTION_ID,
                            user: userid,
                            accountid: results.accounts[i].account_id,
                            type: results.accounts[i].type,
                            subtype: results.accounts[i].subtype,
                            currentbalance: results.accounts[i].balances.current,
                            availablebalance: results.accounts[i].balances.available,
                            limit: results.accounts[i].balances.limit,
                            name: results.accounts[i].name,
                            subname: results.accounts[i].official_name,
                            currencycode: results.accounts[i].balances.iso_currency_code
                        
                        })
                        .then(newaccount => {
                            var startDate = Moment().subtract(30, 'days').format('YYYY-MM-DD');
                            var endDate = Moment().format('YYYY-MM-DD');
                            
                            client.getTransactions(ACCESS_TOKEN, startDate, endDate, {
                                count: 20,
                                offset: 0,
                            },
                            function(error, transactionsResponse) {
                                if (error != null) {
                                    console.log(JSON.stringify(error));
                                    return response.json({
                                        error: error
                                    });
                                }

                                //console.log(transactionsResponse.transactions[0]);
                                for (var j = 0; j < 14; j++) {
                                    saveTransaction(db, transactionsResponse.transactions[j]);
                                }
                            });
                            //console.log(newaccount);
                        });
                    }
                }
            });   
        }
    });
}

function pullMoreData(userid, app, db, client) {
    pullAuth(userid, app, db, client);
}

