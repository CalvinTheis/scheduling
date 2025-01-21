# Work Order Schedule Viewer

## Running

This project uses Ruby v3.3.5 and Rails v8.0.1, the latest version available to
me on my system. It uses the default SQLite database, so no database setup is
required beyond running:

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

If this task is run after making changes to the CSV files, it will update the
rows with the corresponding ID in the database with the new values. It will add
rows with IDs that are not already present, but will _not_ delete records that
are not also in the CSV files.

## Development Approach

Some of my design choices are listed below:

The frontend works like most calendar applications, where the blocks in each
column have the `position: absolute` style attribute, and are freely positioned
and sized within the column using additional CSS.

I designed the application so that the page does not have to fetch data from
the server once loaded. Therefore, data that is not immediately shown to the
user are in the `data-*` attributes of the block and column components for use
by Stimulus controllers.

Since all time values are all known to be within the same day, I represent
these values as seconds since midnight, and translate them into formatted time
representations by treating them as UNIX timestamps in the UTC time zone.

The largest challenge I faced while designing this application was handling
overlapping time blocks due to one technician having overlapping work orders.
To solve it, I had to ensure that each time block had its start and end times
embedded into it as `data-*` attributes. Each column then gets its own Stimulus
controller which creates a list of sets of overlapping blocks, then resizes
them horizontally until they no longer overlap.

## Potential future improvements

- Allow for the `import:csv` to take custom file paths.
- Make the schedule UI look better (i.e. add horizontal rules and make the
  block contents more responsive).
- Add the ability to upload the CSV files from the frontend.
