// import modules
var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// connect database
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once("open", function() {
  console.log("DB connected!");
});
db.on("error", function(err) {
  console.log("DB error :", err);
});

// model setting
var postSchema = mongoose.Schema({
  title: {type:String, required:true},
  body: {type:String, required:true},
  createdAt: {type:Date, default:Date.now},
  updatedAt: Date
});
//모델을 담는 변수는 첫글자가 대문자(Data)
//첫번째 인자는 문자열로 데이터베이스에 연결될 collection 의 단수(singular) 이름이고,
//두번째 인자는 mongoose.Schema() 함수로 생성된 스키마변수입니다
var Post = mongoose.model('post', postSchema);

// view setting
app.set("view engine", 'ejs');

// set middlewares
app.use(express.static(path.join(__dirname, 'public')));
//다른 프로그램이 JSON으로 데이터 전송을 할 경우 받는 body parser
app.use(bodyParser.json()); // 모든 서버에 도착하는 신호들의 body를 JSON으로 분석
//웹사이트가 JSON으로 데이터를 전송 할 경우 받는 body parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

// set routes
app.get('/posts', function(req, res) {
  console.log("index");
  // 데이터를 sort하고 exec함수로 수정
  // -createdAt 으로 늦게 적은게 가장 위로 오게끔 함
  Post.find({}).sort('-createdAt').exec(function (err, posts) {
    if(err) return res.json({success:false, message:err});
    // view setting을 ejs로 해서 확장자 안적어도 됨
    res.render("posts/index", {data:posts});
  });
});// index
app.get('/posts/new', function(req, res) {
  console.log("new");
  res.render('posts/new');
});// new
app.post('/posts', function(req, res) {
  console.log("create");
  Post.create(req.body.post, function(err, post) {
    if(err) return res.json({success:false, message:err});
    //res.json({success:true, data:post});
    res.redirect('/posts');// call index
  });
});// create
app.get('/posts/:id', function(req, res) {
  console.log("show");
  Post.findById(req.params.id, function(err, post) {
    if(err) return res.json({success:false, message:err});
    res.render("posts/show", {data:post});
  });
});// show
app.get('/posts/:id/edit', function(req, res) {
  console.log("edit");
  Post.findById(req.params.id, function(err, post) {
    if(err) return res.json({success:false, message:err});
    res.render("posts/edit", {data:post});
  });
});// edit
app.put('/posts/:id', function(req, res) {
  console.log("update");
  req.body.post.updatedAt = Date.now();
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post) {
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts/' + req.params.id);
  });
});// update
app.delete('/posts/:id', function(req, res) {
  console.log("destroy");
  Post.findByIdAndRemove(req.params.id, function(err, post) {
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts');
  });
});// destroy

// start Server
app.listen(8080, function() {
  console.log('Server On!');
});
