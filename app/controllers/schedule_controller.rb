require "time"

# Controller-local helpers
module ScheduleHelper
  # Calculates the height of a box with the given duration.
  # Used in the css "height" attribute for the block.
  def height_percent_for_time(duration)
    100 * (duration - @start_time) / (@end_time - @start_time)
  end

  # Calculates the offset from the top of the column for the given start time.
  # Used in the css "top" attribute for the block.
  def top_percent_for_time(time)
  time_of_day = time.seconds_since_midnight
    100 * (time_of_day - @start_time) / (@end_time - @start_time)
  end

  # Creates formatted time based on seconds since midnight.
  def format_time(seconds)
    Time.at(seconds+(60*60*6)).strftime("%H:%M")
  end
end

class ScheduleController < ApplicationController
  helper ScheduleHelper

  # Constants that define the beginning and end of the period shown on the schedule.
  START_TIME = Time.parse("5:00").seconds_since_midnight
  END_TIME = Time.parse("20:00").seconds_since_midnight

  def index
    @start_time = START_TIME
    @end_time = END_TIME
    @technicians = Technician.all()
  end
end
