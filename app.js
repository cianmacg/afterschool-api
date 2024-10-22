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

// Might not need to use cross-ogirin stuff. Commented out for now.
// app.use(cors({
//   origin: 'http://localhost:4173',
//   methods: ['GET', 'POST', 'PUT', 'DELETE']
// }));

/*
*
*   GETTER PATHS
*
*/

// When we want to get all Kids data, we use this path.
app.get('/get_kids', (req, res) => {
  db.all('SELECT * FROM kids', [], (err, rows) => {
    if (err) {
      console.error('Error fetching data from Database: Kids.', err.message);
      return res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get all Logs data, we use this path.
app.get('/get_logs', (req, res) => {
  db.all('SELECT * FROM logs', [], (err, rows) => {
    if (err) {
      console.error('Error fetching data from Logs.', err.message);
      return res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get all Guardians data, we use this path.
app.get('/get_guardians', (req, res) => {
  db.all('SELECT * FROM guardians', [], (err, rows) => {
    if (err) {
      console.error('Error fetching the data from Guardians.', err.message);
      return res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get A SPECIFIC KID'S data, we use this path. It requires the ID of the kid.
app.get('/get_kid_by_id', (req, res) => {
  const { kid_id } = req.query;
  // Using '?' here and passing the ID value in later (in the db.all function) should help protect against SQL Injection attacks later.
  db.all('SELECT * FROM kids WHERE kid_id = ?', [kid_id], (err, rows) => {
    if (err) {
      // If an error occurs, print to console and inform the user.
      console.error('Error fetching data of Kid ID: ' + kid_id, err.message);
      return res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get A SPECIFIC kids LOGS data, we use this path. It requires the ID of the kid.
app.get('/get_logs_by_kid_id', (req, res) => {
  db.all('SELECT * FROM logs WHERE kid_id = ?', [req.query.id], (err, rows) => {
    if (err) {
      console.error('Error fetching log data for kid id: ' + req.query.id, err.message);
      return res.status(500).json({ error: 'An error occured while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get A SPECIFIC kids GUARDIANS data, we use this path. It requires the ID of the kid.
app.get('/get_guardians_by_kid_id', (req, res) => {
  db.all('SELECT * FROM guardians WHERE kid_id = ?', [req.query.id], (err, rows) => {
    if (err) {
      console.error('Error fetching guardian data for kid id: ' + req.query.id, err.message);
      return res.status(500).json({ error: 'An error occured while fetching data.' });
    }
    else res.json(rows);
  });
});

// When we want to get A SPECIFIC LOG'S data, we use this path. It requires the ID of the log.
app.get('/get_log_by_id', (req, res) => {
  db.all('SELECT * FROM logs WHERE log_id = ?', [req.query.id], (err, rows) => {
    if (err) {
      console.error('Error fetching log data for log id: ' + req.query.id, err.message);
      return res.status(500).json({ error: 'An error occured while fetching data.' })
    }
    else res.json(rows);
  });
});

// When we want to get A SPECIFIC GUARDIAN'S data, we use this path. It requires the ID of the guardian.
app.get('/get_guardian_by_id', (req, res) => {
  db.all('SELECT * FROM guardians WHERE guardian_id = ?', [req.query.id], (err, rows) => {
    if (err) {
      console.error('Error fetching gaurdian data for guardian id: ' + req.query.id, err.message);
      return res.status(500).json({ error: 'An error occured while fetching data.' })
    }
    else res.json(rows);
  });
});

/*
*
*   INSERTER PATHS
*
*/

// When we want to add a new kid, we use this path. Required - first name, last name. Optionally, we can include a guardian at this stage. <--- LAST PART NEEDS TO BE ADDED.
app.post('/add_kid', (req, res) => {
  const { first_name, last_name, dob } = req.query;

  if (!first_name || !last_name || !dob) {
    console.log('Insufficient data to create new kid. First name,Last name, and/or Date of Birth is missing.');
    return res.status(400).json({ error: 'Missing data. First name,Last name, and/or Date of Birth is missing.' });
  }
  else {
    db.run('INSERT INTO kids (first_name, last_name, dob) VALUES (?, ?, ?)', [first_name, last_name, dob], (err) => {
      if (err) {
        console.error('Error inserting data to kids.', err.message);
        return res.status(500).json({ error: 'An error occured when trying to insert the data to the database.' });
      }
      else {
        res.json({ success: 'Kid successfully added to the database.' })
      }
    })
  }
});

// When we want to change the status of a kid (create a NEW LOG), we use this path. It requires the kid ID.
app.post('/change_kid_status', (req, res) => {
  const { kid_id } = req.query;
  // We need a kid ID to change the status of. End here if no kid ID.
  if (!kid_id) {
    console.log('Error: No kid ID received.')
    return res.status(400).json({ error: 'Missing kid ID. Cannot change status.' });
  }
  else {
    // We need to find the kids current status. 
    db.get('SELECT status FROM logs WHERE kid_id = ? AND timestamp = (SELECT MAX(timestamp) FROM logs WHERE kid_id = ?)', [kid_id, kid_id], (err, row) => {
      if (err) {
        console.error('Error finding kid\'s current status.', err.message);
        return res.status(500).json({ error: 'An error occurred when retreiving the kid\'s current status.' });
      }
      // Lets make sure we retreived a kid, otherwise the kid might not exist in the database.
      if (!row) {
        console.log('Error: No row returned. Kid ID doesn\'t exist');
        return res.status(400).json({ error: 'An error occurred. The provided kid ID doesn\'t exist in the database.' })
      }
      // This never runs, as there are currently no log entries in the database TO DO TO DO TO DO TO DO TO DO TO DO TO DO TO DOTO DO TO DOTO DO TO DO 
      console.log(row)
      // We want to swap the status to the opposite of the current one.
      const newStatus = row.status === 'In' ? 'Out' : 'In';

      // Now lets add the new log with the updated status
      // db.run('INSERT INTO logs(kid_id, status) VALUES ?, ?', [kid_id, newStatus], (err) => {
      //   if (err) {
      //     console.error('Error when creating new log.', err.message);
      //     return res.status(500).json({ error: 'An error occurred when adding the new log.' });
      //   }
      //   else {
      //     // If we successfully added the new log, we need to update the status of the kid in the kids table.
      //     db.run('UPDATE kids SET status = ? WHERE kid_id = ?', [newStatus, kid_id], (err) => {
      //       if (err) {
      //         console.error('Error when updating status of kid.', err.message);
      //         return res.status(500).json({ error: 'An error occurred when updating the status of ' })
      //       }
      //     });
      //   }
      // });
    });
  }
});

// When we want to add a new guardian, we use this path. It requires the associated kid id, name, phone number, email address, home address, and relationship to the kid.
// Optionally, if the guardian already exists (i.e. already the guardian of another kid), we can include the guardian ID also.
app.post('/add_guardian', (req, res) => {
  const { guardian_id, kid_id, name, phone, email, address, relationship } = req.query;

  if (!kid_id || !name || !phone || !email || !address || !relationship) {
    return res.status(500).json({ error: 'Insufficient data provided. Please include kid ID, name, phone number, email address, home address, and relationship.' })
  }
  else {
    if (guardian_id) {
      add_guardian([guardian_id, kid_id, name, phone, email, address, relationship], res, false);
    }
    // If we aren't given an ID for the guardian, we need to find one for them. To do this, we find the current highest guardian ID, and add 1.
    else {
      // We need to use locking/serialization to avoid race conditions. It is possible that 2 guardians could be made at the same time, and be given the same ID otherwise.
      db.serialize(() => {
        db.run('BEGIN TRANSACTION;', (err) => {
          if (err) {
            console.error('Error beginning transaction:', err.message);
            return res.status(500).json({ error: 'An error occurred when beginning the transaction with the database.' });
          }

          db.get('SELECT MAX(guardian_id) AS maxGuardianId FROM guardians', [], (err, row) => {
            if (err) {
              console.error('Error fetching MAX guardian id.', err.message);
              db.run('ROLLBACK;', (rollbackErr) => {
                if (rollbackErr) console.error('Error rolling back transaction:', rollbackErr.message);
              });
              return res.status(500).json({ error: 'An error occurred when obtaining the new guardian ID.' })
            }
            else {
              let newGuardianId = row.maxGuardianId + 1;
              add_guardian([newGuardianId, kid_id, name, phone, email, address, relationship], res, true);
            }
          });
        });
      });
    }
  }
});

/*
*
*   UPDATER PATHS
*
*/

// When we want to update the details of a kid, we use this path.
app.patch('/update_kid', (req, res) => {
  const { kid_id, first_name, last_name, status } = req.query;

  // We need a kid id to perform this task. If none is provided, end here.
  if (!kid_id) {
    console.log('Error Updating. No kid ID provided.');
    return res.status(400).json({ error: 'Error updating kid. No kid ID received.' })
  }

  // The query should look like 'UPDATE kids SET [fields = params] WHERE kid_id = [kid_id]'
  let sqlQuery = 'UPDATE kids SET '
  const fields = [];
  const params = [];

  // We first need to determine which fields are going to be updated. Only fields which were given to us in the request should be included.
  if (first_name) {
    params.push(first_name);
    fields.push('first_name = ?');
  }

  if (last_name) {
    params.push(last_name);
    fields.push('last_name = ?');
  }

  if (status) {
    params.push(status);
    fields.push('status = ?')
  }

  // If there are no fields which we are going to update, end here.
  if (fields.length === 0) {
    console.log('Error updating kid. No values to update.')
    return res.status(400).json({ error: 'Error updating kid. No valid fields received.' })
  }

  sqlQuery += fields.join(', ');
  sqlQuery += ' WHERE kid_id = ?';
  params.push(kid_id);

  console.log(sqlQuery);
  console.log(params);

  // Time to run the query. 
  // It is possible 2 people may try to update the same kid at the same time. We need to be ready for this.
  // Using serialize and transactions should protect us from this.
  db.serialize(() => {
    // Begin the transaction
    db.run('BEGIN TRANSACTION;', (err) => {
      if (err) {
        console.error('Error beginning transaction.', err.message);
        return res.status(500).json({ error: 'An error occurred when beginning the transaction.' });
      }

      // Perform the update here.
      db.run(sqlQuery, params, function (err) {
        if (err) {
          console.error('Error updating kid information in database.', err.message);
          // If an error happened while we tried to update the information, we need to perform a rollback.
          db.run('ROLLBACK;', rollbackErr => {
            // If the rollback has failed, log it.
            if (rollbackErr) {
              console.error('Error during rollback: ', rollbackErr.message);
            }
          });
          return res.status(500).json({ error: 'Error updating kids information on database.' })
        }

        // We need to commit the transaction.
        db.run('COMMIT;', (commitErr) => {
          if (commitErr) {
            console.error('Error committing transaction: ', commitErr.message);
            return res.status(500).json({ error: 'Error committing transaction.' });
          }

          // Check the changes parameter of the returned object to make sure a row was updated.
          if (this.changes > 0) {
            return res.json({ success: 'Kid information successfully updated.' })
          }
          else {
            return res.status(404).json({ error: 'No record found matching provided kid ID.' })
          }
        });
      });
    });
  });
});

// When we want to update the details of a log, we use this path. I don't see this being used much, but just in case...
app.patch('/update_log', (req, res) => {

});

// When we want to update the details of a guardian, we use this path.
app.patch('/update_guadian', (req, res) => {

});

/*
*
*   DELETER PATHS
*
*/

// When we want to remove a kid from the database, we use this path.
app.delete('/remove_kid', (req, res) => {

});

// When we want to remove a log from the database, we use this path.
app.delete('/remove_log', (req, res) => {

});

// When we want to remove a guardian from the database, we use this path.
app.delete('/remove_guardian', (req, res) => {

});

// Since we can add a guardian from multiple paths ('/add_kid' and '/add_guardian' x2), it is easier to create a function here to be used by them.
// We should have handled any issues with the request BEFORE calling this function.
// When we are dealing with a new guardian ID, we need to use locks to prevent 2 race conditions. is_locked is set to true when using a new guardian ID.
function add_guardian(params, res, is_locked) {
  db.run('INSERT INTO guardians(guardian_id, kid_id, name, phone, email, address, relationship) VALUES (?, ?, ?, ?, ?, ?, ?)', params, (err) => {
    if (err) {
      console.error('Error inserting data to database.', err.message);
      if (is_locked) {
        db.run('ROLLBACK;', (rollbackErr) => {
          if (rollbackErr) console.error('Error rolling back transaction:', rollbackErr.message);
        });
      }
      res.status(500).json({ error: 'An error occured while inserting data into the database.' })
    }
    else {
      if (is_locked) {
        db.run('COMMIT;', (commitErr) => {
          if (commitErr) {
            console.error('Error committing transaction:', commitErr.message);
            res.status(500).json({ error: 'An error occurred while commiting the transaction.' })
          }
          else res.json({ success: 'Guardian successfully added to the database.' })
        });
      }
      else {
        res.json({ success: 'Guardian successfully added to the database.' })
      }
    }
  });
}


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
//
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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send a JSON response
  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;