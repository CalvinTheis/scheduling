# README

## Running

This project uses Ruby v3.3.5 and Rails v8.0.1, the latest version available
during development. It uses the default SQLite database, so no additional
database setup is required.

## Importing Data

To import data from the CSV files into the database, place the files into the
root directory of the project, and run:

```shell
rake import:csv
```
