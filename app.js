const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbName = 'data.db';
const dbPath = path.join(__dirname, dbName); // using this to verify the db file exists before proceeding.
//Unused, as we are currently migrating away from using the python scripts.
// const { spawn } = require('child_process');
// const math_py = 'scripts/math-stuff.py';
// const sheets_py = 'scripts/sheets.py';

// const sheets_path = __dirname + '/public/sheets/';

var app = express();

// We should first check if the database is present. If not, we should inform the user to run the 'scripts/dbSetup.py' before running this.
if (!fs.existsSync(dbPath)) {
  console.log('The database doesn\'t exist. Please run \'script/dbSetup.py\' before proceeding.');
  process.exit(1);
}

// We need to connect to our database.
const db = new sqlite3.Database('data.db', (err) => {
  if (err) console.error('Error connecting to database: ', err.message);
  else {
    console.log('Connected to database:', dbName);
  }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: 'http://localhost:4173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// When we want to get all Kids data, we use this path.
app.get('/get_kids', (req, res) => {
  db.all('SELECT * FROM kids', [], (err, rows) => {
    if (err) {
      console.error('Error fetching data from Database: Kids.', err.message);
      res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get all Logs data, we use this path.
app.get('/get_logs', (req, res) => {
  db.all('SELECT * FROM logs', [], (err, rows) => {
    if (err) {
      console.error('Error fetching data from Logs.', err.message);
      res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get all Guardians data, we use this path.
app.get('/get_guardians', (req, res) => {
  db.all('SELECT * FROM guardians', [], (err, rows) => {
    if (err) {
      console.error('Error fetching the data from Guardians.', err.message);
      res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get A SPECIFIC KID'S data, we use this path. It requires the ID of the kid.
app.get('/get_kid_by_id', (req, res) => {
  // Using '?' here and passing the ID value in later (in the db.all function) should help protect against SQL Injection attacks later.
  db.all('SELECT * FROM kids WHERE kid_id = ?', [req.query.id], (err, rows) => {
    if (err) {
      // If an error occurs, print to console and inform the user.
      console.error('Error fetching data of Kid ID: ' + req.query.id, err.message);
      res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get A SPECIFIC kids LOGS data, we use this path. It requires the ID of the kid.
app.get('/get_logs_by_kid_id', (req, res) => {
  db.all('SELECT * FROM logs WHERE kid_id = ?', [req.query.id], (err, rows) => {
    if (err) {
      console.error('Error fetching log data for kid id: ' + req.query.id, err.message);
      res.status(500).json({ error: 'An error occured while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get A SPECIFIC kids GUARDIANS data, we use this path. It requires the ID of the kid.
app.get('/get_guardians_by_kid_id', (req, res) => {
  db.all('SELECT * FROM guardians WHERE kid_id = ?', [req.query.id], (err, rows) => {
    if (err) {
      console.error('Error fetching guardian data for kid id: ' + req.query.id, err.message);
      res.status(500).json({ error: 'An error occured while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get A SPECIFIC LOG'S data, we use this path. It requires the ID of the log.
app.get('/get_log_by_id', (req, res) => {
  db.all('SELECT * FROM logs WHERE log_id = ?', [req.query.id], (err, rows) => {
    if (err) {
      console.error('Error fetching log data for log id: ' + req.query.id, err.message);
      res.status(500).json({ error: 'An error occured while fetching data.' })
    }
    else res.json(rows);
  });
});

// When we want to get A SPECIFIC GUARDIAN'S data, we use this path. It requires the ID of the guardian.
app.get('/get_guardian_by_id', (req, res) => {
  db.all('SELECT * FROM guardians WHERE guardian_id = ?', [req.query.id], (err, rows) => {
    if (err) {
      console.error('Error fetching gaurdian data for guardian id: ' + req.query.id, err.message);
      res.status(500).json({ error: 'An error occured while fetching data.' })
    }
    else res.json(rows);
  });
});


/*
*   This stuff is no longer used, as we are migrating away from the python scripts. 
*   I want to start fresh.
*/

// // This path is used to add a new child to the database. It must be provided with a Name
// app.put('/add', (req, res) => {
//   if(req.query.name == "" || req.query.name == null){
//     res.sendStatus(422);
//   }
//   else {
//     add_new_kid(spawn('python', [sheets_py, "add_kid", sheets_path.concat("kids.xlsx"), req.query.name]), (err, kid) => {
//       if (err) {
//           return res.status(500).send("Error retrieving data");
//       }
//       res.sendStatus(201);
//     });
//   }
// });

// //This path is used to remove a child from the database. It must be provided with an ID
// app.put('/delete', (req, res) => {
//   if(req.query.id == "" || req.query.id == null){
//     res.sendStatus(422);
//   }
//   else {
//     delete_kid(spawn('python', [sheets_py, "delete_kid", sheets_path.concat("kids.xlsx"), req.query.id]), (err, kid) => {
//       if (err) {
//           return res.status(500).send("Error retrieving data");
//       }
//       res.sendStatus(201);
//     });
//   }
// });

// // This path is used to change the status of a child to In or Out (opposite of current status). It must be provided with an ID
// app.put('/change', (req, res) => { 
//   if(req.query.id == "" || req.query.id == null){
//     res.sendStatus(422);
//   }
//   else {
//     change_status(spawn('python', [sheets_py, "change_status", sheets_path.concat("kids.xlsx"), req.query.id]), (err, kid) =>{
//       if (err) {
//           return res.status(500).send("Error retrieving data");
//       }
//       res.sendStatus(201);
//     });
//   }
// });

// // This path is used to get a list of all children and their current statuses. 
// app.get('/get_kids', (req, res) => {
//   var data = {
//     'kids' : ''
//   }
//   get_kids(spawn('python', [sheets_py, "get_kids", sheets_path.concat("kids.xlsx")]), (err, kids) => {
//     if (err) {
//         return res.status(500).send("Error retrieving data");
//     }
//     data.kids = kids;
//     res.json(data);
//   });
// });

// // This path is used to get a list of all status change logs. 
// app.get('/get_logs', (req, res) => {
//   var data = {
//     'log' : ''
//   }
//   get_log(spawn('python', [sheets_py, "get_log", sheets_path.concat("kids.xlsx")]), (err, log) => {
//     if (err) {
//         return res.status(500).send("Error retrieving data");
//     }
//     data.log = log;
//     res.json(data);
//   });
// });


// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // send a JSON response
//   res.status(err.status || 500);
//   res.json({ error: err.message });
// });

// // We use this function to add a new child to the database.
// function add_new_kid(kid, cb) {

//   kid.stdout.on('data', (data) => {
//     // Assuming the Python script returns JSON
//     const result = JSON.parse(data);
//     console.log(result);
//     return cb(null, result)
//   });

//   kid.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//     return cb(true, null)
//   });

//   kid.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
// };

// function delete_kid(kid, cb){
//   kid.stdout.on('data', (data) => {
//     // Assuming the Python script returns JSON
//     const result = JSON.parse(data);
//     console.log(result);
//     return cb(null, result)
//   });

//   kid.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//     return cb(true, null)
//   });

//   kid.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
// };

// // We use this function to change the status of a child to In or Out (the opposite of current status).
// function change_status(kid, cb) {

//   kid.stdout.on('data', (data) => {
//     // Assuming the Python script returns JSON
//     const result = JSON.parse(data);
//     console.log(result);
//     return cb(null, result);
//   });

//   kid.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//     return cb(true, null);
//   });

//   kid.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
// };

// // We use this function to get the full list of children and their statuses.
// function get_kids(kid, cb) {
//   kid.stdout.on('data', (data) => {
//     // Assuming the Python script returns JSON
//     const result = JSON.parse(data);
//     return cb(null, result);
//   });

//   kid.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//     return { "result" : "Error.", "ID" : "", "Name" : "", "Status" : "" };
//   });

//   kid.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
// };

// function get_log(logs, cb) {
//   logs.stdout.on('data', (data) => {
//     // Assuming the Python script returns JSON
//     const result = JSON.parse(data);
//     return cb(null, result);
//   });

//   logs.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//     return { "result" : "Error.", "ID" : "", "Name" : "", "Status" : "", "Timestamp" : "" };
//   });

//   logs.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
// };

module.exports = app;