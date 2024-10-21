# Script to setup the sqlite database.
# Populates the 'kids' table with some sample data.

import sqlite3

connection = sqlite3.connect('../data.db')
cursor = connection.cursor()

# cursor.execute("DROP TABLE kids")
# cursor.execute("DROP TABLE guardians")
# cursor.execute("DROP TABLE logs")

createKids = """CREATE TABLE IF NOT EXISTS
kids(kid_id INTEGER UNIQUE PRIMARY KEY NOT NULL, first_name TEXT, last_name TEXT, status TEXT)"""

createGuardians = """CREATE TABLE IF NOT EXISTS
guardians(guardian_id INTEGER UNIQUE PRIMARY KEY NOT NULL, kid_id INTEGER, name TEXT, phone TEXT, email TEXT, address TEXT, relationship TEXT, FOREIGN KEY(kid_id) REFERENCES kids(kid_id))"""

createLogs = """CREATE TABLE IF NOT EXISTS
logs(log_id INTEGER UNIQUE PRIMARY KEY NOT NULL, kid_id INTEGER, status TEXT, timestamp TEXT, FOREIGN KEY(kid_id) REFERENCES kids(kid_id))"""

cursor.execute(createKids)
cursor.execute(createGuardians)
cursor.execute(createLogs)

cursor.execute("INSERT INTO kids(first_name, last_name, status) VALUES ('Cian', 'Smith', 'Out')")
cursor.execute("INSERT INTO kids(first_name, last_name, status) VALUES ('Aoibhinn', 'Smith', 'Out')")
cursor.execute("INSERT INTO kids(first_name, last_name, status) VALUES ('Oisin', 'Smith', 'Out')")
cursor.execute("INSERT INTO kids(first_name, last_name, status) VALUES ('Mark', 'Wallace', 'Out')")
cursor.execute("INSERT INTO kids(first_name, last_name, status) VALUES ('Marcus', 'Yamamoto', 'Out')")

print(cursor.execute("SELECT * FROM kids").fetchall())

cursor.close()
connection.commit()