module ScheduleHelper
  # Creates formatted time based on seconds since midnight.
  def format_time(seconds)
    Time.at(seconds+(60*60*6)).strftime("%H:%M")
  end
end
