var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once("open", function() {
  console.log("DB connected!");
});
db.on("error", function(err) {
  console.log("DB error :", err);
});

var dataSchema = mongoose.Schema({
  name:String,
  count:Number
});
//모델을 담는 변수는 첫글자가 대문자(Data)
//첫번째 인자는 문자열로 데이터베이스에 연결될 collection 의 단수(singular) 이름이고,
//두번째 인자는 mongoose.Schema() 함수로 생성된 스키마변수입니다
var Data = mongoose.model('data', dataSchema);
Data.findOne({name:"myData"}, function(err, data) {
  if(err) return console.log("Data Error:", err);
  if(!data) {
    Data.create({name:"myData", count:0}, function(err, data) {
      if(err) return console.log("Data error:", err);
      console.log("Counter initialized :", data);
    });
  }
});

// express에게 ejs를 view engine으로 사용함을 알림
app.set("view engine", 'ejs');
app.use(express.static(path.join(__dirname + '/public')));

app.get('/', function(req, res) {
  Data.findOne({name:"myData"}, function(err, data) {
    if(err) return console.log("Data Error:", err);
    data.count++;
    data.save(function(err) {
      if(err) return console.log("Data error:", err);
        res.render('my_first_ejs', data);
      });
    });
});
app.get('/reset', function(req, res) {
  setCounter(res, 0);
});
//http://localhost:8080/set/count?count=39
app.get('/set/count', function(req, res) {
  if(req.query.count) setCounter(res, req.query.count);
  else getCounter(res);
});
//http://localhost:8080/set/3
app.get('/set/:num', function(req, res) {
  if(req.params.num) setCounter(res, req.params.num);
  else getCounter(res);
});

function setCounter(res, num) {
  console.log("setCounter");
  Data.findOne({name:"myData"}, function(err, data) {
    if(err) return console.log("Data error:", err);
    data.count = num;
    data.save(function (err) {
      if(err) return console.log("Data error:", err);
      res.render('my_first_ejs', data);
    });
  });
}
function getCounter(res) {
  console.log("getCounter");
  Data.findOne({name:"myData"}, function(err, data) {
    if(err) return console.log("Data error:", err);
    res.render('my_first_ejs', data);
  });
}

app.listen(8080, function() {
  console.log('Server On!');
});
