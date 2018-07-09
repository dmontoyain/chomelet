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
                        if (foundinstitution.length == 0) {
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

                                    pullMoreData(request.body.userid);
                                });
                            });
                        } 
                        else {
                            INSTITUTION_ID = foundinstitution[0].id;
                            db.item.create({
                                itemid: ITEM_ID,
                                access_token: ACCESS_TOKEN,
                                user: request.body.userid,
                                institution: institute[0].id
                            });

                            pullMoreData(request.body.userid);
                        }
                    });
                });
            });
        });
    });
};

function pullTransactions() {

    var startDate = Moment().subtract(30, 'days').format('YYYY-MM-DD');
    var endDate = Moment().format('YYYY-MM-DD');
    
    client.getTransactions(ACCESS_TOKEN, startDate, endDate, {
        count: 250,
        offset: 0,
    },
    function(error, transactionsResponse) {
        if (error != null) {
            console.log(JSON.stringify(error));
            return response.json({
                error: error
            });
        }

        var arrayTransactions = transactionsResponse.transactions;

        for (var i = 0; i < arrayTransactions.length; i++) {
            db.sequelize.query("SELECT id FROM accounts WHERE accountid = '" + arrayTransactions[i].account_id + "'", {type: db.sequelize.QueryTypes.SELECT})
            .then((account) => {
                db.transaction.create({
                    transaction: arrayTransactions[i].transaction_id,
                    place: arrayTransactions[i].name,
                    total: arrayTransactions[i].total,
                    account: account[0].id
                });
            });
        }
    });
//    console.log('pulled ' + transactionsResponse.transactions.length + ' transactions');
//    response.json(transactionsResponse);   
}

function pullAuth(userid) {
    
    client.getAuth(ACCESS_TOKEN, (err, results) => {
        for (var i = 0; i < results.length; i++) {
            db.account.create({
                accountno: results[0].account,
                institution: INSTITUTION_ID,
                user: userid
            });
        }
    });
}

function pullMoreData(userid) {
    pullAuth(userid);

    pullTransactions();
}

