DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS tasks;

PRAGMA foreign_keys = on;

CREATE TABLE projects (
  pid INTEGER PRIMARY KEY,
  name TEXT,
  descr TEXT
);
CREATE TABLE tasks (
  tid INTEGER PRIMARY KEY,
  pid INTEGER,
  descr TEXT,
  complete TINYINT,
  FOREIGN KEY (pid) REFERENCES projects(pid)
);
INSERT INTO projects (pid, name, descr) VALUES (
  25,
  "Writing a Book on Web Dev Tools",
  "Tasks required to write a book on the tools required to develop a web application"
), (
  34,
  "Cook a Spanish omelette",
  "Steps to cook a Spanish omelette or 'tortilla'"
);
INSERT INTO tasks (tid, pid, descr, complete) VALUES (
  1,
  25,
  "Figure out what kind of application to develop",
  1
), (
  2,
  25,
  "Decide what tools to use",
  0
), (
  3,
  25,
  "Create repositories for text and samples",
  0
), (
  4,
  34,
  "Peel and dice the potatoes",
  1
), (
  5,
  34,
  "Fry the potatoes",
  1
), (
  6,
  34,
  "Peel and chop the onions",
  0
), (
  7,
  34,
  "Saute the onions",
  0
), (
  8,
  34,
  "Beat the eggs",
  0
), (
  9,
  34,
  "Mix everything and fry",
  0
)
