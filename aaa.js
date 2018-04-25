var request = require('request');

function handleTokenCallback(body){
    var options = {
      url: 'https://api.mypurecloud.com/api/v2/authorization/roles',
      headers: {
        'Authorization': body.token_type + " " + body.access_token
      }
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(JSON.stringify(JSON.parse(body), null, 2));
        }else{
            console.log(error)
        }
    });
}

// secret = process.env.purecloud_secret;
//id = process.env.purecloud_client_id;
secret = '9506f4e9-84dc-4f61-bfc1-658eee18a18a'
id = 'TnHoRB1BuqobHYZItlCQWk5B49PBKWONR2Nw_FpPooA'

request.post({url:'https://login.mypurecloud.com/oauth/token', form: {grant_type:'client_credentials'}}, function(err,httpResponse,body){
    if(err == null){
        handleTokenCallback(JSON.parse(body));
    }
}).auth(id,secret,true)
