# Script to setup the sqlite database.
# Populates the 'kids' table with some sample data.

import sqlite3

connection = sqlite3.connect('../data.db')
cursor = connection.cursor()

cursor.execute("DROP TABLE kids")
# cursor.execute("DROP TABLE guardians")
# cursor.execute("DROP TABLE logs")

createKids = """CREATE TABLE IF NOT EXISTS
kids(kid_id INTEGER UNIQUE PRIMARY KEY NOT NULL, first_name TEXT, last_name TEXT, dob TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"""

createGuardians = """CREATE TABLE IF NOT EXISTS
guardians(guardian_id INTEGER NOT NULL, kid_id INTEGER NOT NULL, name TEXT, phone TEXT, email TEXT, address TEXT, relationship TEXT, FOREIGN KEY(kid_id) REFERENCES kids(kid_id), CONSTRAINT PK_guardian PRIMARY KEY (guardian_id, kid_id) )"""

createLogs = """CREATE TABLE IF NOT EXISTS
logs(log_id INTEGER UNIQUE PRIMARY KEY NOT NULL, kid_id INTEGER, status TEXT, timestamp TIMESTAMP DEFUALT CURRENT_TIMESTAMP, FOREIGN KEY(kid_id) REFERENCES kids(kid_id))"""

cursor.execute(createKids)
# cursor.execute(createGuardians)
# cursor.execute(createLogs)

# cursor.execute("INSERT INTO kids(first_name, last_name, dob) VALUES ('Cian', 'Smith', '25-01-1994')")
# cursor.execute("INSERT INTO kids(first_name, last_name, dob) VALUES ('Aoibhinn', 'Smith', '14-12-1996')")
# cursor.execute("INSERT INTO kids(first_name, last_name, dob) VALUES ('Oisin', 'Smith', '31-08-2000')")
# cursor.execute("INSERT INTO kids(first_name, last_name, dob) VALUES ('Mark', 'Wallace', '4-5-1985')")
# cursor.execute("INSERT INTO kids(first_name, last_name, dob) VALUES ('Marcus', 'Yamamoto', '25-09-1997')")

# print(cursor.execute("SELECT * FROM kids").fetchall())

# cursor.execute("INSERT INTO guardians(guardian_id, kid_id, name, phone, email, address, relationship) VALUES (1, 1,'Noeleen Smith', '08981736487', 'noeleensmith@example.com', 'Somewhere, Someplace, Ireland', 'Parent')")
# cursor.execute("INSERT INTO guardians(guardian_id, kid_id, name, phone, email, address, relationship) VALUES (1, 2,'Noeleen Smith', '08981736487', 'noeleensmith@example.com', 'Somewhere, Someplace, Ireland', 'Parent')")
# cursor.execute("INSERT INTO guardians(guardian_id, kid_id, name, phone, email, address, relationship) VALUES (1, 3,'Noeleen Smith', '08981736487', 'noeleensmith@example.com', 'Somewhere, Someplace, Ireland', 'Parent')")
# cursor.execute("INSERT INTO guardians(guardian_id, kid_id, name, phone, email, address, relationship) VALUES (2, 1,'Paul Smith', '0918374562', 'paulsmith@example.com', 'Somewhere, Someplace, Ireland', 'Parent')")
# cursor.execute("INSERT INTO guardians(guardian_id, kid_id, name, phone, email, address, relationship) VALUES (2, 2,'Paul Smith', '0918374562', 'paulsmith@example.com', 'Somewhere, Someplace, Ireland', 'Parent')")
# cursor.execute("INSERT INTO guardians(guardian_id, kid_id, name, phone, email, address, relationship) VALUES (2, 3,'Paul Smith', '0918374562', 'paulsmith@example.com', 'Somewhere, Someplace, Ireland', 'Parent')")

cursor.close()
connection.commit()