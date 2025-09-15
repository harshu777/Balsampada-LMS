'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  BookOpenIcon,
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import toast from 'react-hot-toast';

interface ClassSchedule {
  id: string;
  subjectName: string;
  className: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  studentCount: number;
  isOnline: boolean;
  meetingLink?: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00'
];

export default function TeacherSchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [viewType, setViewType] = useState<'week' | 'list'>('week');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    const mockSchedules: ClassSchedule[] = [
      {
        id: '1',
        subjectName: 'Mathematics',
        className: 'Class 10-A',
        dayOfWeek: 'Monday',
        startTime: '10:00',
        endTime: '11:00',
        room: 'Room 201',
        studentCount: 25,
        isOnline: false
      },
      {
        id: '2',
        subjectName: 'Physics',
        className: 'Class 11-B',
        dayOfWeek: 'Tuesday',
        startTime: '14:00',
        endTime: '15:30',
        room: 'Lab 3',
        studentCount: 20,
        isOnline: false
      },
      {
        id: '3',
        subjectName: 'Chemistry',
        className: 'Class 12-A',
        dayOfWeek: 'Wednesday',
        startTime: '11:00',
        endTime: '12:30',
        room: 'Online',
        studentCount: 30,
        isOnline: true,
        meetingLink: 'https://meet.google.com/abc-defg-hij'
      },
      {
        id: '4',
        subjectName: 'Mathematics',
        className: 'Class 9-B',
        dayOfWeek: 'Thursday',
        startTime: '15:00',
        endTime: '16:00',
        room: 'Room 105',
        studentCount: 28,
        isOnline: false
      },
      {
        id: '5',
        subjectName: 'Physics',
        className: 'Class 10-C',
        dayOfWeek: 'Friday',
        startTime: '10:00',
        endTime: '11:30',
        room: 'Lab 2',
        studentCount: 22,
        isOnline: false
      }
    ];
    
    setSchedules(mockSchedules);
    setLoading(false);
  }, []);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 1 })
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(direction === 'prev' ? subWeeks(currentWeek, 1) : addWeeks(currentWeek, 1));
  };

  const getScheduleForDayAndTime = (day: string, time: string) => {
    return schedules.find(schedule => 
      schedule.dayOfWeek === day && 
      schedule.startTime === time
    );
  };

  const getScheduleHeight = (schedule: ClassSchedule) => {
    const start = TIME_SLOTS.indexOf(schedule.startTime);
    const end = TIME_SLOTS.indexOf(schedule.endTime);
    return (end - start) * 60; // 60px per 30-minute slot
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Class Schedule</h1>
          <p className="text-neutral-600 mt-1">Manage your teaching schedule and class timings</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('week')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewType === 'week' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewType === 'list' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              List View
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Class
          </button>
        </div>
      </div>

      {viewType === 'week' ? (
        <>
          {/* Week Navigation */}
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-neutral-900">
                  {format(weekDays[0], 'MMMM d')} - {format(weekDays[6], 'MMMM d, yyyy')}
                </h2>
                <button
                  onClick={() => setCurrentWeek(new Date())}
                  className="text-sm text-primary hover:underline mt-1"
                >
                  Today
                </button>
              </div>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Weekly Calendar Grid */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-8 border-b border-neutral-200">
              <div className="p-3 text-center text-sm font-medium text-neutral-600 border-r border-neutral-200">
                Time
              </div>
              {DAYS_OF_WEEK.map((day, index) => (
                <div key={day} className="p-3 text-center border-r border-neutral-200 last:border-r-0">
                  <div className="text-sm font-medium text-neutral-900">{day}</div>
                  <div className="text-xs text-neutral-500">
                    {format(weekDays[index], 'MMM d')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b border-neutral-100 last:border-b-0">
                  <div className="p-3 text-sm text-neutral-600 text-center border-r border-neutral-200">
                    {time}
                  </div>
                  {DAYS_OF_WEEK.map((day) => {
                    const schedule = getScheduleForDayAndTime(day, time);
                    return (
                      <div key={`${day}-${time}`} className="relative border-r border-neutral-100 last:border-r-0 h-[60px]">
                        {schedule && (
                          <div
                            className={`absolute inset-x-0 top-0 m-1 p-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                              schedule.isOnline 
                                ? 'bg-blue-100 border-l-4 border-blue-500' 
                                : 'bg-purple-100 border-l-4 border-purple-500'
                            }`}
                            style={{ height: `${getScheduleHeight(schedule) - 8}px`, zIndex: 10 }}
                          >
                            <div className="text-xs font-semibold text-neutral-900">
                              {schedule.subjectName}
                            </div>
                            <div className="text-xs text-neutral-600 mt-1">
                              {schedule.className}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                              <MapPinIcon className="h-3 w-3" />
                              {schedule.room}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* List View */
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const daySchedules = schedules.filter(s => s.dayOfWeek === day);
            if (daySchedules.length === 0) return null;
            
            return (
              <div key={day} className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  {day}
                </h3>
                <div className="space-y-3">
                  {daySchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          schedule.isOnline ? 'bg-blue-100' : 'bg-purple-100'
                        }`}>
                          <BookOpenIcon className={`h-6 w-6 ${
                            schedule.isOnline ? 'text-blue-600' : 'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-neutral-900">{schedule.subjectName}</h4>
                          <p className="text-sm text-neutral-600 mt-1">{schedule.className}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="h-4 w-4" />
                              {schedule.room}
                            </span>
                            <span className="flex items-center gap-1">
                              <UsersIcon className="h-4 w-4" />
                              {schedule.studentCount} students
                            </span>
                          </div>
                          {schedule.isOnline && schedule.meetingLink && (
                            <a
                              href={schedule.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              Join Meeting →
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-neutral-600 hover:bg-white rounded-lg transition-colors">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Classes</p>
              <p className="text-2xl font-bold text-neutral-900">{schedules.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Students</p>
              <p className="text-2xl font-bold text-neutral-900">
                {schedules.reduce((sum, s) => sum + s.studentCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Weekly Hours</p>
              <p className="text-2xl font-bold text-neutral-900">
                {schedules.reduce((sum, s) => {
                  const start = parseInt(s.startTime.split(':')[0]) * 60 + parseInt(s.startTime.split(':')[1]);
                  const end = parseInt(s.endTime.split(':')[0]) * 60 + parseInt(s.endTime.split(':')[1]);
                  return sum + (end - start) / 60;
                }, 0).toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Online Classes</p>
              <p className="text-2xl font-bold text-neutral-900">
                {schedules.filter(s => s.isOnline).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Class Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Class Schedule</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600 mb-4">
                Class schedule management is coming soon!
              </p>
              <p className="text-sm text-neutral-500">
                You'll be able to create recurring class schedules, manage timetables, and set room assignments.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  toast.info('Class schedule feature coming soon!');
                }}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}