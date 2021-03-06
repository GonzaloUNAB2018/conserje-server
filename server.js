var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var methodOverride = require('method-override')
var cors = require('cors');

var app = express();
var admin = require('firebase-admin');
var serviceAccount = require("./app/conserje-cl-firebase-adminsdk.json");
var uidNewUser

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());
// route pages

app.use(express.static(__dirname + '/public/'));

app.listen('8080', function() {
  console.log('Servidor web escuchando en el puerto 8080');
  //listAllUsers();
});

function listAllUsers(nextPageToken) {
  // List batch of users, 1000 at a time.
  admin.auth().listUsers(1000, nextPageToken)
    .then(function(listUsersResult) {
      let users = [];
      listUsersResult.users.forEach(function(userRecord) {
        //console.log('user', userRecord.toJSON());
        users.push(userRecord.toJSON());
      });
      if (listUsersResult.pageToken) {
        // List next batch of users.
        listAllUsers(listUsersResult.pageToken);
      }else{
        console.log(users);
      }
    })
    .catch(function(error) {
      console.log('Error listing users:', error);
    });
}

app.post('/getAllUsers', function (req, res){
  let nextPageToken;
  var post=req.body;
  console.log(post.message);
  admin.auth().listUsers(1000, nextPageToken)
  .then(function(listUsersResult) {
    let users = [];
    listUsersResult.users.forEach(function(userRecord) {
      //console.log('user', userRecord.toJSON());
      users.push(userRecord.toJSON());
    });
    if (listUsersResult.pageToken) {
      // List next batch of users.
      listAllUsers(listUsersResult.pageToken);
    }else{
      console.log(users);
      res.json(users);
    }
  })
  .catch(function(error) {
    console.log('Error listing users:', error);
  });
})

app.post('/createuser', function (req, res) {
  var post=req.body;
  console.log(post.email, post.phoneNumber, post.password);
  admin.auth().createUser({
    displayName: post.displayName,
    email: post.email,
    emailVerified: true,
    phoneNumber: post.phoneNumber,
    password: post.password,
    disabled: post.disabled,
  })
  .then(function(userRecord){
    userRecord.uid;
    console.log('Usuario creado: '+userRecord.uid);
    res.json({
      displayName: post.displayName,
      email: post.email,
      phoneNumber: post.phoneNumber,
      password: post.password,
      disabled: post.disabled,
      uid:userRecord.uid
    });
    })
  .catch(function(error) {
    console.log('Error creating new user:', error);
  });
});

app.post('/contact', function (req, res) {
  var post=req.body;
  console.log(post.message);
  res.json({message: "Mensaje de servidor: Conectado!"});
});

app.get('/getallusers', function (req, res){
  var user;  
  admin.auth().listUsers(1000)
    .then(function(listUsersResult) {
      var users = []
      listUsersResult.users.forEach(function(userRecord) {
        user = userRecord.toJSON();
        users.push(user);
      });
      console.log(users);
      res.json(users);
    })
    .catch(function(error) {
      console.log('Error listing users:', error);
    });
})

app.post('/deleteuser', function(req, res){
  var post=req.body;
  admin.auth().deleteUser(post.uid)
  .then(function(userDeleted) {
    console.log('Successfully deleted user:', post.uid);
    res.json({
      message: post.uid+' Borrado'
    })
  })
  .catch(function(error) {
    console.log('Error deleting user:', error);
  });
});

app.post('/getpassword', function(req, res){
  var post=req.body;
  admin.auth().getUser(post.uid)
  .then(function(userRecord) {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully fetched user data:', userRecord.toJSON());
    res.json({
      message: userRecord.toJSON()
    })
  })
  .catch(function(error) {
    console.log('Error fetching user data:', error);
  });
})

//app.listen(process.env.PORT || 8080);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://conserje-cl.firebaseio.com"
  });

//console.log('Iniciando en: http://localhost:8080');


