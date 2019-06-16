var assert = require('assert');
var os = require('os');
var fs = require('fs');
var mv = require('mv');
var path = require('path');
var express = require('express');
var busboy = require('express-busboy');
var mongo = require('./mongo');

const mediaPath = path.join(__dirname, '..', 'media');

const uploadHtml = fs.readFileSync(__dirname + '/html/upload.html');

var app = express();
busboy.extend(app, {
  upload: true,
  path: path.join(os.tmpdir(), 'media'),
  mimeTypeLimit: [
    'image/gif',
    'image/jpeg',
    'image/png'
  ]
});

mongo.connect('mongodb://' + process.env.MONGO_HOST, 'media');

app.get('/', (req, res) => {
  res.status(200).send('ok');
});

app.get('/upload', (req, res) => {
  res.header('content-type', 'text/html');
  res.status(200).send(uploadHtml);
});

app.get('/media/:title', (req, res) => {
  try {
    mongo.collection('images').findOne({ title: req.params.title })
      .then((doc) => {
        try {
          if ( ! doc)
            return res.status(404).send();

          var img = fs.readFileSync(path.join(mediaPath, doc.path));
          res.header('content-type', doc.mimetype);
          res.status(200);
          res.end(img, 'binary');
        } catch(err) {
          console.log(err);
          res.status(500).send();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send();
      });
  } catch(err) {
    res.status(500).send();
  }
});

app.post('/upload', (req, res) => {
  try {
    assert.notEqual(req.body.mediaTitle, undefined);
    assert.notEqual(req.files.mediaFile, undefined);

    const filePath = req.files.mediaFile.file;
    const filename = req.files.mediaFile.filename;
    
    const savePath = path.join(filename);
    const fullPath = path.join(mediaPath, savePath); 
    mv(filePath, fullPath, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send();
      }
      
      mongo.collection('images').insertOne({
        title: req.body.mediaTitle,
        path: savePath,
        mimetype: req.files.mediaFile.mimetype
      })
        .then(() => {
          res.status(200).send('ok');
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send();
        })
    });
  } catch(err) {
    console.error(err);
    res.status(500).send();
  }
});

const port = process.env.NODE_PORT;
app.listen(port, () => {
  console.log(`listening on port ${port}`)
});
