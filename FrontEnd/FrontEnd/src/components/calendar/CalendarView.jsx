import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

const CalendarView = ({ events, onDateClick, onEventClick }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const renderHeader = () => {
        return (
            <div className="calendar-view-header">
                <button className="month-nav-btn" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    ‹
                </button>
                <h2 className="current-month">
                    {format(currentMonth, 'MMMM yyyy', { locale: vi })}
                </h2>
                <button className="month-nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    ›
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return (
            <div className="calendar-days-header">
                {days.map((day, index) => (
                    <div key={index} className="calendar-day-name">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayEvents = events.filter(event => {
                    const eventDate = new Date(event.date);
                    return isSameDay(eventDate, cloneDay);
                });

                days.push(
                    <div
                        key={day}
                        className={`calendar-cell ${!isSameMonth(day, monthStart) ? 'disabled' : ''
                            } ${isSameDay(day, new Date()) ? 'today' : ''}`}
                        onClick={() => onDateClick && onDateClick(cloneDay)}
                    >
                        <div className="cell-number">{format(day, 'd')}</div>
                        {dayEvents.length > 0 && (
                            <div className="cell-events">
                                {dayEvents.slice(0, 2).map((event, idx) => (
                                    <div
                                        key={idx}
                                        className={`cell-event event-type-${event.eventType}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick && onEventClick(event);
                                        }}
                                        title={event.title}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                                {dayEvents.length > 2 && (
                                    <div className="cell-event-more">
                                        +{dayEvents.length - 2} khác
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="calendar-row" key={day}>
                    {days}
                </div>
            );
            days = [];
        }

        return <div className="calendar-body">{rows}</div>;
    };

    return (
        <div className="calendar-view">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};

export default CalendarView;
