//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// JSON形式で文字列を返す
app.get('/hello', function(req, res, next) {
  var param = {"result":"Hello World !"};
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});
// [POST]JSON形式で文字列を返す
app.post('/ewt2/:place', function(req, res, next) {
  //var param = {"ewt":req.params.place};
  var param = {"fulfillmentMessages": {"text": {"text": "待ち時間は17秒です。"}}};
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});
// [POST]JSON形式で文字列を返す
app.post('/ewt/:place', function(req, res, next) {
  //var param = {"followupEventInput": {"name": "LOCAL_WEBHOOK_RECEIVED","parameters": {"ewtrec": "54","queuesrec": "order skill"}}};
  //var param = {"followupEventInput": {"name": "LOCAL_WEBHOOK_RECEIVED","parameters": {"ewtrec": "54","queuesrec": req.body.queryResult.parameters['queues']}}};
  //待ち時間を乱数で取得
  var sEWT = Math.floor( Math.random() * (30 - 0 + 1) ) + 0;
  //PureCloudからEWTを取得
  var oauth_login_url = 'https://login.salesforce.com';
  var oauth_client_id = '*****';
  var oauth_client_username = '*****';
  var oauth_client_secret = '*****';
  var oauth_client_authenticate_password = '*****';
  
  
  //Responseを生成、送信
  var param = {"followupEventInput": {"name": "LOCAL_WEBHOOK_RECEIVED","parameters": {"ewtrec": sEWT,"queuesrec": req.body.queryResult.parameters['queues']}}};
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});



// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
