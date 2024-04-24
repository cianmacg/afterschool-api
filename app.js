var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { spawn } = require('child_process');
const math_py = 'scripts/math-stuff.py'
const sheets_py = 'scripts/sheets.py'

const sheets_path = __dirname + '\\public\\sheets\\';

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// This path is used to add a new child to the database. It must be provided with a Name
app.put('/add', (req, res) => {
  if(req.query.name == "" || req.query.name == null){
    res.sendStatus(422);
  }
  else {
    add_new_kid(spawn('python', [sheets_py, "add_kid", sheets_path.concat("kids.xlsx"), req.query.name]), (err, kid) => {
      if (err) {
          return res.status(500).send("Error retrieving data");
      }
      res.sendStatus(201);
    });
  }
});

//This path is used to remove a child from the database. It must be provided with an ID
app.put('/delete', (req, res) => {
  if(req.query.id == "" || req.query.id == null){
    res.sendStatus(422);
  }
  else {
    delete_kid(spawn('python', [sheets_py, "delete_kid", sheets_path.concat("kids.xlsx"), req.query.id]), (err, kid) => {
      if (err) {
          return res.status(500).send("Error retrieving data");
      }
      res.sendStatus(201);
    });
  }
});

// This path is used to change the status of a child to In or Out (opposite of current status). It must be provided with an ID
app.put('/change', (req, res) => { 
  if(req.query.id == "" || req.query.id == null){
    res.sendStatus(422);
  }
  else {
    change_status(spawn('python', [sheets_py, "change_status", sheets_path.concat("kids.xlsx"), req.query.id]), (err, kid) =>{
      if (err) {
          return res.status(500).send("Error retrieving data");
      }
      res.sendStatus(201);
    });
  }
});

// This path is used to get a list of all children and their current statuses. 
app.get('/get_kids', (req, res) => {
  var data = {
    'title' : 'Express',
    'kids' : ''
  }
  get_kids(spawn('python', [sheets_py, "get_kids", sheets_path.concat("kids.xlsx")]), (err, kids) => {
    if (err) {
        return res.status(500).send("Error retrieving data");
    }
    data.kids = kids;
    res.json(data);
  });
});

// This path is used to get a list of all status change logs. 
app.get('/get_log', (req, res) => {
  var data = {
    'title' : 'Express',
    'kids' : ''
  }
  get_log(spawn('python', [sheets_py, "get_log", sheets_path.concat("kids.xlsx")]), (err, log) => {
    if (err) {
        return res.status(500).send("Error retrieving data");
    }
    data.log = log;
    res.json(data);
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send a JSON response
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// We use this function to add a new child to the database.
function add_new_kid(kid, cb) {

  kid.stdout.on('data', (data) => {
    // Assuming the Python script returns JSON
    const result = JSON.parse(data);
    console.log(result);
    return cb(null, result)
  });
  
  kid.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    return cb(true, null)
  });
  
  kid.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

function delete_kid(kid, cb){
  kid.stdout.on('data', (data) => {
    // Assuming the Python script returns JSON
    const result = JSON.parse(data);
    console.log(result);
    return cb(null, result)
  });
  
  kid.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    return cb(true, null)
  });
  
  kid.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

// We use this function to change the status of a child to In or Out (the opposite of current status).
function change_status(kid, cb) {

  kid.stdout.on('data', (data) => {
    // Assuming the Python script returns JSON
    const result = JSON.parse(data);
    console.log(result);
    return cb(null, result);
  });
  
  kid.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    return cb(true, null);
  });
  
  kid.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

// We use this function to get the full list of children and their statuses.
function get_kids(kid, cb) {
  kid.stdout.on('data', (data) => {
    // Assuming the Python script returns JSON
    const result = JSON.parse(data);
    return cb(null, result);
  });
  
  kid.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    return { "result" : "Error.", "ID" : "", "Name" : "", "Status" : "" };
  });
  
  kid.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

function get_log(logs, cb) {
  logs.stdout.on('data', (data) => {
    // Assuming the Python script returns JSON
    const result = JSON.parse(data);
    return cb(null, result);
  });
  
  logs.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    return { "result" : "Error.", "ID" : "", "Name" : "", "Status" : "", "Timestamp" : "" };
  });
  
  logs.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

module.exports = app;
