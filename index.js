var express = require('express');
var app = express();
var parser = require('body-parser');
var pg = require('pg');
var path = ('path');
var parseConnectionString = require('pg-connection-string');
var PORT = process.env.PORT || 3333;
var models = require('./models');
var multer  = require('multer');
var sharp = require('sharp');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require ('passport');
var LocalStrategy = require('passport-local').Strategy;
var query = require('./query');


// var Users = new users(process.env.DATABASE_URL,'users');
// var Posts = new posts(process.env.DATABASE_URL,'posts');
// var Tags = new tags(process.env.DATABASE_URL,'tags');
// var Comments = new comments(process.env.DATABASE_URL,'comments');


app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
console.log('Public: ' + __dirname + '\\public');
app.use(express.static(__dirname + '\\public'));
// app.use('/public',express.static(__dirname + '/public'));

// multer setup
var storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './public/img');
    },
    filename: function(req, file, callback){
        callback(null, file.originalname);
    }
});

var upload = multer({storage: storage});


var bcrypt = require('bcrypt');
const saltRounds = 10;


app.set('view engine', 'ejs');

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(flash());

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});
// ------------------------------------------------------------------------------------------
function ensureAuthenticated(req, res, next){
  console.log(req.isAuthenticated());
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You must be logged in to view that page');
		res.redirect('/');
	}
}

//session storing infomation - required by passport
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    models.users.findById(id).then(function(user) {
        done(null, user);
    })
    .catch(err => done(err));
});

passport.use('local',new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
    // console.log(username, password);
   models.users.findOne({
     where:{
       'email': username
     }
   })
   .then(function(data,err){
    console.log(data.dataValues);
    var user = data.dataValues;
   	if(!user){
			//invalid username
      console.log('invalid user');
   		return done(null, false, {message: 'Unknown User'});
   	}
   	bcrypt.compare(password, user.password, function(err, result){
   		if (err)
        return err;
   		if(result){
				//succesful login
        console.log('login succesful');
   			return done(null, user);
     		} else {
  				//invalid password
          console.log('invalid pass');
     			return done(null, false, {message: 'Invalid password'});
   		}
   	});
    //done(null, user);
   })
   .catch(err => {
      console.error(err);
      done(err);
   });
}));

//LOGIN
app.get('/', function(req, res){
  res.render('login',{
    title:"login"
  });
});
//passport login
app.post('/', passport.authenticate('local', {
  successRedirect: '/index',
  failureRedirect: '/',
  failureFlash: true
  }),
  function(req, res) {
    // req.flash('success_msg','You are now logged in!')
    // res.redirect('/register');
  }
);
//success login
app.get('/success', function(req, res) {
    res.send('Login successful');
}); // router close
//fail to login
app.get('/fail', function(req, res) {
    req.flash('error_msg','Invalid username or password')
    res.render('login',{
      title:"login"
    });
});

//REGISTER
app.get('/register', function(req, res){
  res.render('register',{
    title:"register"
  });
});
//SENDS INFO TO DB CORRECTLY!!! -V
//registration user auth handler
app.post('/register', function(req, res) {
  	var email = req.body.email;
  	var password = req.body.password;
  	var password2 = req.body.password2;
  	// Validation
  	req.checkBody('email', 'Email is required').notEmpty();
  	req.checkBody('email', 'Email is not valid').isEmail();
  	req.checkBody('password', 'Password is required').notEmpty();
  	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    //Error Handling
  	var errors = req.validationErrors();
    if(errors){
      console.log(errors);
      res.render('/register', {errors: errors});
	} else {
    //bcrypt followed by input to DB
    console.log('plain string password: '+password);
    bcrypt.hash(password, saltRounds, function(err, hash) {
      console.log('This is the hashed password: '+hash);
      models.users.create({
        email: req.body.email,
        firstName:" ",
        lastName:" ",
        password:hash
      }, function(){
        console.log('Upload to DB succesful!');
      });
    });
		console.log('everything looks good');
    req.flash('success_msg', 'You are registered and can now login');
    res.redirect('/');
	}
});

// ------------------------------------------------------------------------------------------

var all_posts = [];
function get_all_posts(){
  return new Promise(function(resolve, reject){
    query('select * from posts order by id desc', [], function(err, result) {
    //query('select * from posts order by id desc; select * from comments where postId =(select Id from posts)',[], function(err, result) {
      if(err){
        reject(err);
      }
      // console.log(result.rows);
      resolve(result.rows);
    });
  });
}

// function get_home_posts(){
//   console.log(models.users.id);
//
//   return new Promise(function(resolve, reject){
//     query('select from posts where userId  === models.users.id', [], function(err, result) {
//       if(err){
//         reject(err);
//       }
//       // console.log(result.rows);
//       resolve(result.rows);
//     });
//   });
// }

// function get_comments(){
//   return new Promise(function(resolve, reject){
//     query('select * from comments where postId = (select Id from posts)', [], function(err, result) {
//       if(err){
//         reject(err);
//       }
//       // console.log(result.rows);
//       resolve(result.rows);
//     });
//   });
// }

var this_post = [];

app.post( '/edit', ensureAuthenticated, function (req, res, next) {
  //console.log(req.body);
  models.posts.findById(req.body.id).then(function(row){
      // models.posts.update({
      //   description: req.body.description,
      //   tags: req.body.tags
      // },
      // {
      //   where: {id:req.body.id}
      // }).then(function(){
      //   res.json({
      //     description: req.body.description,
      //     tags: req.body.tags
      //   });
      //   // res.render('explore',{
      //   //   blogposts: all_posts,
      //   //   title:"Explore",
      //   // });
      // });
      console.log(row);
      row.update({
        description: req.body.description,
            tags: req.body.tags
      });
  }).then(() => {
    res.redirect('/explore');
  });
});

app.post('/delete', ensureAuthenticated, function (req, res, next){
  console.log(req.body);
  models.posts.findById(req.body.id).then(function(row){
      // models.posts.destroy({
      //     where: {
      //       id: req.body.id
      //     }
      //   }).then(function(result){
      //        //res.send("deleted");
      //        console.log(result);
      //        res.render('index', {
      //          title:"Home"});
      //    });
      console.log(row);
      row.destroy();
  })
  .then(() => {
    res.redirect('/index');
  });
});

app.get('/index', ensureAuthenticated, function(req, res){
  get_all_posts().then(function(all_posts){
    res.render('index', {
      title:"Home",
      blogposts: all_posts,
      user: req.user.dataValues});
  });
});

app.get('/upload', ensureAuthenticated, function(req, res){
  res.render('upload',{
    title:"Upload"
  });
});

app.post('/add-post',function (req, res, next) {
  console.log(req.body);
  req.checkBody('imgLink', 'Image is required').notEmpty();
  req.checkBody('description', 'Image description is required').notEmpty();
  req.checkBody('tags', 'Tags is required').notEmpty();
  req.checkBody('description', 'A description that is not over 150 characters is required').isLength({ max: 150 });
  var errors = req.validationErrors();
  console.log(errors);

  if(errors){
    req.flash('error_msg','A description is required, and it must not be over 150 characters')
    res.redirect('upload');
    return;
  }

  if (!req.body.imgLink) {
    req.flash('error_msg','File required')
    res.redirect('upload');
    return;
  } else {
    console.log('imgLink:' + req.body.imgLink,
    'description:' + req.body.description,
    'tags:' + req.body.tags,
    'owner:' + req.user.id);
    var tagsArr = req.body.tags.split(',').map(function(item) {
       return item.trim();
     });
    models.posts.create({
      img_link: req.body.imgLink,
      description: req.body.description,
      tags: req.body.tags,
      userId: req.user.id
    }).then(function(){
      res.redirect('/index');
    });
  };
});

app.get('/explore', ensureAuthenticated, function(req, res){
  get_all_posts().then(function(all_posts){
    //console.log(req.user.dataValues);
    //console.log(all_posts.userId);
    res.render('explore',{
      blogposts: all_posts,
      title:"Explore",
      user: req.user.dataValues
    });
  });
});

app.get('/profile',ensureAuthenticated, function(req, res) {
  console.log(req.user.dataValues);
  res.render('profile',{
     title: 'Hello',
     user: req.user.dataValues
   });
});

// app.get('/profile', function(req, res){
//   //get_all_posts().then(function(all_posts){
//     res.render('profile',{
//       //blogposts: all_posts,
//       title:"Profile"
//     });
//   //});
// });

// ------------------------------------------------------------------------------------------

app.get('*', function(req, res) {
    res.status(404).send('<h1>Page not found!</h1>');
});

app.listen(PORT, function () {
    console.log('Example app listening on port 3333!');
});
