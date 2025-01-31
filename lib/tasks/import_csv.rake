require "csv"
require "time"

namespace :import do
  desc "Import data from spreadsheets into the database"
  task csv: :environment do
    import_csv = ->(filename, table) do
      # Open CSV file
      path = File.join Rails.root, filename
      csv = CSV.open(path)

      # Get headers and skip.
      headers = csv.shift

      n_imported = 0
      n_updated = 0
      csv.each do |row|
        # Check if row already exists by id.
        if table.exists?(id: row[0]) then
          entity = table.find_by(id: row[0])
          n_updated += 1
        else
          entity = table.create()
          n_imported += 1
        end

        # Import or update the records.
        headers[1..].zip(row[1..]).each do |header, cell|
          if header == "time" then
            # Parse the file's custom time format.
            entity[header] = Time.strptime(cell + " UTC", "%d/%m/%y %H:%M %Z")
            puts "#{cell} becomes #{entity[header]}"
          else
            entity[header] = cell
          end
        end
        entity.save!
      end
      puts "Imported #{n_imported} records."
      puts "Updated #{n_updated} records."
    rescue Errno::ENOENT
      puts "Error importing file #{filename}: File does not exist."
    end

    filename_table_pairs = [
      [ "locations.csv", Location ],
      [ "technicians.csv", Technician ],
      [ "work_orders.csv", WorkOrder ]
    ]

    filename_table_pairs.each do |filename, table|
      import_csv.call(filename, table)
    end
  end
end
