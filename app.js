// import modules
var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

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
app.use(bodyParser.json()); // 모든 서버에 도착하는 신호들의 body를 JSON으로 분석


// set routes
app.get('/posts', function(req, res) {
  Post.find({}, function(err, posts) {
    if(err) return res.json({success:false, message:err});
    res.json({success:true, data:posts});
  });
});// index
app.post('/posts', function(req, res) {
  Post.create(req.body.post, function(err, post) {
    if(err) return res.json({success:false, message:err});
    res.json({success:true, data:post});
  });
});// create
app.get('/posts/:id', function(req, res) {
  Post.findById(req.params.id, function(err, post) {
    if(err) return res.json({success:false, message:err});
    res.json({success:true, data:post});
  });
});// show
app.put('/posts/:id', function(req, res) {
  req.body.post.updatedAt = Date.now();
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post) {
    if(err) res.json({success:false, message:err});
    res.json({success:true, message:post._id+" updated"});
  });
});// update
app.delete('/posts/:id', function(req, res) {
  Post.findByIdAndRemove(req.params.id, function(err, post) {
    if(err) res.json({success:false, message:err});
    res.json({success:true, message:post._id+" deleted"});
  });
})

// start Server
app.listen(8080, function() {
  console.log('Server On!');
});
