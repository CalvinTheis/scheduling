# Work Order Schedule Viewer

## Running

This project uses Ruby v3.3.5 and Rails v8.0.1, the latest version available
during development. It uses the default SQLite database, so no database setup
is required beyond running:

```shell
rails db:migrate
```

To run the server, run:

```shell
rails server
```

## Importing Data

To import data from the CSV files into the database, place the files into the
root directory of the project, and run:

```shell
rake import:csv
```

If this task is run after making changes to the CSV files, the corresponding
rows in the database will be updated with the new values, provided the ID has
not changed.

## Development Approach

Some of my design choices are listed below:

The frontend works like most calendar applications, where the blocks in each
column have the `position: absolute` style attribute, and are freely positioned
and sized within the column using additional CSS.

I designed the application so that the page does not have to fetch data from
the server once loaded. Therefore, data that is not immediately shown to the
user is embedded in HTML `data-*` attributes for retrieval by Stimulus
controllers.

Since all time values are all known to be within the same day, I represent
these values as seconds since midnight, and translate them into formatted time
representations by treating them as UNIX timestamps in the UTC time zone.

The largest challenge I faced while designing this application was handling
overlapping time blocks due to one technician having overlapping work orders.
To solve it, I had to ensure that each time block had its start and end times
embedded into it as `data-*` attributes. Each column then gets its own Stimulus
controller which creates a list of lists of overlapping blocks, then resizes
them horizontally until they no longer overlap.
