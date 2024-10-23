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
    // It is possible 2 people may try to change the status of the same kid at the same time. We need to protect agains race conditions.
    // We will do this with serialization and transactions.
    db.serialize(() => {
      db.run('BEGIN TRANSACTION;', (err) => {
        if (err) {
          console.error('Error when beginning transaction.', err.message);
          return res.status(500).json({ error: 'An error occurred when beginning the transaction.' })
        }

        // We need to find the kids current status. 
        db.get('SELECT status FROM logs WHERE kid_id = ? AND timestamp = (SELECT MAX(timestamp) FROM logs WHERE kid_id = ?)', [kid_id, kid_id], (err, row) => {
          if (err) {
            console.error('Error finding kid\'s current status.', err.message);
            return res.status(500).json({ error: 'An error occurred when retreiving the kid\'s current status.' });
          }
          // Lets make sure we retreived a kid. If not, the kid may not exist, or this could be their first time being logged.
          if (!row) {
            db.get('SELECT kid_id FROM kids WHERE kid_id = ?', [kid_id], (err, kid_row) => {
              if (err) {
                console.error('Error occurred when searching for kid ID.', err.message);
                return res.status(500).json({ error: 'An error occurred when searching for kid ID.' });
              }

              if (!kid_row) {
                console.log('Kid ID does not exist.');
                return res.status(400).json({ error: 'The provided kid ID does not exist.' });
              }

              // The first time we are changing the kids status, they should be logged as 'In'. (I.e. with no status the kid is considered 'Out').
              change_kid_status(kid_id, 'In', res);
            });
          }
          else {
            // We want to swap the status to the opposite of the current one.
            const newStatus = row.status === 'In' ? 'Out' : 'In';

            // Now lets add the new log with the updated status. The time will be logged by the database.
            change_kid_status(kid_id, newStatus, res);
          }
        });
      });
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
  const { kid_id, first_name, last_name } = req.query;

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
  // When thinking about what the client should be able to update, I'm thinking the timestamp and kid ID should be updatable.
  const { log_id, kid_id, timestamp } = req.query;

  let sqlQuery = 'UPDATE logs SET ';
  const fields = [];
  const params = [];

  if (!log_id) {
    console.log('No log ID provided. Cannot update.')
    return res.status(400).json({ error: 'No log ID provided. Cannot update.' });
  }

  if (kid_id) {
    fields.push('kid_id = ?');
    params.push(kid_id);
  }

  if (timestamp) {
    fields.push('timestamp = ?');
    params.push(timestamp);
  }

  if (fields.length === 0) {
    console.log('No field to update.');
    return res.status(400).json({ error: 'No field to update provided.' });
  }

  sqlQuery += fields;
  sqlQuery += ' WHERE log_id = ?'
  params.push(log_id)

  // We need to verify that the log id exists. If so, we can edit it.
  db.get('SELECT log_id FROM logs WHERE log_id = ?', [log_id], (err, row) => {
    if (err) {
      console.error('Error occurred getting log.', err.message);
      return res.status(500).json({ error: 'An error occurred when getting log.' });
    }
    if (!row) {
      return res.status(400).json({ error: 'An error occurred when getting log. Log ID does not exist in database.' })
    }
    else {
      // The log exists, we can begin editing it.
      // Since 2 people may try to update the same log at the same time, we should protect against race conditions (Maybe? Doesn't hurt at this scale).
      db.serialize(() => {
        db.run('BEGIN TRANSACTION;', (err) => {
          if (err) {
            console.error('Error when beginning transaction.', err.message);
            return res.status(500).json({ error: 'An error occurred when beginning the transaction.' });
          }
          else {
            db.run(sqlQuery, params, (err) => {
              if (err) {
                console.error('Error occurred updating log.', err.message);
                db.run('ROLLBACK;', (rollbackErr) => {
                  if (rollbackErr) console.error('Error during rollback.', rollbackErr.message);
                });
                return res.status(500).json({ error: 'An error occurred while updating log.' });
              }
              else {
                db.run('COMMIT;', (err) => {
                  if (err) {
                    console.error('Error during commit.', err.message);
                    db.run('ROLLBACK;', (rollbackErr) => {
                      if (rollbackErr) console.error('Error during rollback.', rollbackErr.message);
                    });
                    return res.status(500).json('An error occurred during the commit.');
                  }
                  return res.json({ success: 'Log successfully updated.' });
                });
              }
            });
          }
        });
      });
    }
  });
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
          // If the rollback has failed, log it.
          if (rollbackErr) console.error('Error rolling back transaction:', rollbackErr.message);
        });
      }
      res.status(500).json({ error: 'An error occured while inserting data into the database.' })
    }
    else {
      // If the call came from the '/add_gaurdian' path and haven't passed a specific guardian_id, we have begun a transcation to combat race conditions.
      // We will need to commit the transaction.
      if (is_locked) {
        db.run('COMMIT;', (commitErr) => {
          if (commitErr) {
            console.error('Error committing transaction:', commitErr.message);
            db.run('ROLLBACK;', rollbackErr => {
              // If the rollback has failed, log it.
              if (rollbackErr) {
                console.error('Error during rollback: ', rollbackErr.message);
              }
            });
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

// Moved this part out of the path function, we it will make things more convenient.
// Can only be called from within a transaction.
function change_kid_status(kid_id, newStatus, res) {
  // Now lets add the new log with the updated status. The time will be logged by the database.
  db.run('INSERT INTO logs(kid_id, status) VALUES (?, ?)', [kid_id, newStatus], (err) => {
    if (err) {
      console.error('Error when creating new log.', err.message);
      // If an error occurred during rollback, log it.
      db.run('ROLLBACK;', (rollbackErr) => {
        if (rollbackErr) console.error('An error occurred during rollback:', rollbackErr.message);
      });
      return res.status(500).json({ error: 'An error occurred when adding the new log.' });
    }
    else {
      db.run('COMMIT;', (err) => {
        if (err) {
          console.error('Error when commiting transaction:', err.message);
          db.run('ROLLBACK;', (rollbackErr) => {
            // If an error occurs during rollback, log it.
            if (rollbackErr) console.error('Error occurred during rollback:', rollbackErr.message);
            return res.status(500).json({ error: 'An error occurred during rollback.' })
          });
          return res.status(500).json({ error: 'An error occurred during commit.' })
        }
      });
      // The status change has been completed and logged. Report this to the client.
      return res.json({ success: 'Kid status change successfully logged.' });
    }
  });
}
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