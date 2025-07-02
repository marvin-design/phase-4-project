import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/dogs/events`);
        const formattedEvents = response.data.map(event => ({
          title: `${event.dogName}: ${event.type}`,
          start: new Date(event.date),
          end: new Date(event.date),
          allDay: true,
          ...event
        }));
        setEvents(formattedEvents);
      } catch (err) {
        setError("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="calendar-page">
      <h2>Dog Events Calendar</h2>
      {error && <div className="error">{error}</div>}
      <div style={{ height: 700 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}

export default CalendarPage;