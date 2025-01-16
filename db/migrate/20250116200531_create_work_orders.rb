class CreateWorkOrders < ActiveRecord::Migration[8.0]
  def change
    create_table :work_orders do |t|
      t.references :technician, null: false, foreign_key: true
      t.references :location, null: false, foreign_key: true
      t.datetime :time
      t.integer :duration
      t.integer :price

      t.timestamps
    end
  end
end
