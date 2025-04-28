const express = require('express')
const app = express()
// middleware --> parse incoming request bodies in middleware before your hadnlers.
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = "mongodb+srv://demo:demo@cluster0-q2ojb.mongodb.net/test?retryWrites=true";
const dbName = "demo";

app.listen(3000, () => {
  // Mongo client connect --> connects to  MongoDB using a url.
  // 
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});
// Allows the use of templates && we are using ejs for the template
app.set('view engine', 'ejs')

// to parse form data
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  // we go through the collection on our DB and find and object.
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
      // render the tempalte with the data being the result?
    res.render('index.ejs', {messages: result})
  })
})

app.post('/messages', (req, res) => {
  // Here we create one
  db.collection('messages').insertOne({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
  // After creating a new message we go back to the home to show the new updated page
    res.redirect('/')
  })
})

app.put('/messages', (req, res) => {
  // Here is to update the thumps up
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1,
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.put('/down', (req, res) => {
  // Here is to update the thumps up
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp - 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  // here we delete the messsage.
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
