require "csv"

namespace :import do
  desc "Import data from spreadsheets into the database"
  task csv: :environment do
    import_csv = ->(filename, table) do
      path = File.join Rails.root, filename
      csv = CSV.open(path)
      headers = csv.shift

      puts "Importing data from #{filename}..."
      n_records = 0
      csv.each do |row|
        entity = table.create_or_find_by(id: row[0])
        headers[1..].zip(row[1..]).each do |header, cell|
          entity[header] = cell
        end
        entity.save!
        n_records+=1
      end
      puts "Imported #{n_records} records."
    end

    import_csv.call("locations.csv", Location)
    import_csv.call("technicians.csv", Technician)
    import_csv.call("work_orders.csv", WorkOrder)
  end
end
