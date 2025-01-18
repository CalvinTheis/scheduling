require "time"

class ScheduleController < ApplicationController
  helper ScheduleHelper

  # Constants that define the beginning and end of the period shown on the schedule.
  START_TIME = Time.parse("5:00").seconds_since_midnight
  END_TIME = Time.parse("17:00").seconds_since_midnight

  def index
    @start_time = START_TIME
    @end_time = END_TIME
    @orders_by_name = {}
    Technician.select("name").each do |technician|
      @orders_by_name[technician.name] = get_work_orders_for_technician technician.name
    end
  end

  private
  def get_work_orders_for_technician(technician_name)
    WorkOrder
      .joins(:technician, :location)
      .where("technicians.name = ?", technician_name)
      .select(
        "locations.name AS location_name",
        "city",
        "time",
        "duration",
        "price",
        "id",
        "technicians.name AS technician"
      )
  end
end
