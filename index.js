var pg = require('pg');
var express = require('express');
var app = express();
var parser = require('body-parser');
var path = ('path');
var parseConnectionString = require('pg-connection-string');
var sharp = require('sharp');
var multer  = require('multer');
var passport = require ('passport');
var query = require('./query');

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/public',express.static(__dirname + '/public'));

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

app.set('view engine', 'ejs');

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
//   return new Promise(function(resolve, reject){
//     query('select * from posts order by id desc', [], function(err, result) {
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

function edit(){
  return new Promise(function(resolve, reject){
    query('update posts set (img_link, description, tags) values ($1, $2, $3) where Id = ($4)', [req.query.imgLink, req.query.description, req.query.tags, req.query.id], function(err, result) {
      if(err){
        reject(err);
      }
      // console.log(result.rows);
      resolve(result.rows);
    });
  });
}
// function delete(){
//   return new Promise(function(resolve, reject){
//     query('DELETE FROM posts WHERE Id = $1', [req.query.Id], function(err, result) {
//       if(err){
//         reject(err);
//       }
//       // console.log(result.rows);
//       resolve(result.rows);
//     });
//   });
// }

app.get('/', function(req, res){
  //get_home_posts().then(function(all_posts){
    res.render('index',{
      blogposts: all_posts,
      title:"Home"
    });
  //});
});

app.get('/upload', function(req, res){
  res.render('upload',{
    title:"Upload"
  });
});

app.get('/add-post', function(req, res){
  query('select body from tags where body=$1', [req.query.body] ,function(err, res){
    var tagsarray=[];
    if(res.length  > 0){
      res.send({message:"exist"});
      return tags[i].id;
    }
    else{
      query('insert into tags (body) values($1)', [req.query.body], function(err, result){
        if(err){
          console.log(err);
          // return done (client);
          return;
        }
        console.log('tag inserted.');
        return tags[i].id;
      });
    }
    for (var i = 0; i < tags.length; i++){
      console.log(tags[i].id, tags[i].body);
      tagsarray.push({id: tags[i].id});
    }
  })

  // query('insert into posts (img_link, description, tags) values ($1, $2, $3)', [req.query.imgLink, req.query.description, req.query.tags], function(err, result) {
  //   if(err){
  //     console.log(err);
  //     // return done (client);
  //     return;
  //   }
  //   console.log('Blog posted.');
  // });
  // return res.redirect('/');
});


app.get('/explore', function(req, res){
  get_all_posts().then(function(all_posts){
    res.render('explore',{
      blogposts: all_posts,
      title:"Explore"
    });
  });
  edit().then(function(){
    res.render('explore',{
      blogposts: this_post
    });
  });
  // delete().then(function(){
  //   res.render('explore',{
  //     blogposts: all_posts,
  //     title:"Explore"
  //   });
  // });
});

app.get('/profile', function(req, res){
  //get_all_posts().then(function(all_posts){
    res.render('profile',{
      //blogposts: all_posts,
      title:"Profile"
    });
  //});
});

// ------------------------------------------------------------------------------------------

app.get('*', function(req, res) {
    res.status(404).send('<h1>Page not found!</h1>');
});

var PORT = process.env.PORT || 3333;

app.listen(PORT, function () {
    console.log('Example app listening on port 3333!');
});
