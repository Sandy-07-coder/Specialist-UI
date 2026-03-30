import { useMemo, useState } from 'react';
import { Users, CheckSquare, Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Activity, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { studentsData } from '@/data/students';
import { 
  format, startOfWeek, addDays, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO
} from 'date-fns';

export function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Metrics Calculation
  const metrics = useMemo(() => {
    let assigned = 0;
    let completed = 0;
    
    studentsData.forEach(student => {
      if (student.tasks) {
        assigned += student.tasks.length;
        completed += student.tasks.filter(t => t.status === "Completed").length;
      }
    });

    return {
      totalStudents: studentsData.length,
      totalAssignedTasks: assigned,
      totalCompletedTasks: completed,
    };
  }, []);

  // Mock Calendar Events for Visit Schedule
  const [events, setEvents] = useState(() => {
    const startObj = startOfMonth(new Date());
    return [
      {
        id: 1,
        date: addDays(startObj, 2),
        title: "Home Visit: Ethan W.",
        time: "10:00 AM - 11:30 AM",
        location: "123 Main St, Springfield",
        type: "Visit"
      },
      {
        id: 2,
        date: addDays(startObj, 5),
        title: "School Observation: Sophia M.",
        time: "01:00 PM - 02:30 PM",
        location: "Lincoln Elementary",
        type: "Observation"
      },
      {
        id: 3,
        date: addDays(startObj, 12),
        title: "Home Visit: Liam J.",
        time: "09:00 AM - 10:00 AM",
        location: "456 Oak Ave, Springfield",
        type: "Visit"
      },
      {
        id: 4,
        date: addDays(startObj, 15),
        title: "Therapy Session: Isabella D.",
        time: "03:00 PM - 04:00 PM",
        location: "Clinic Room B",
        type: "Therapy"
      },
      {
        id: 5,
        date: addDays(startObj, 20),
        title: "Home Visit: Emma C.",
        time: "11:00 AM - 12:30 PM",
        location: "789 Pine Ln, Springfield",
        type: "Visit"
      },
    ];
  });

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00 AM - 10:00 AM',
    location: '',
    type: 'Visit'
  });

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    
    // Parse date ensuring local timezone interpretation
    const [year, month, day] = newEvent.date.split('-');
    const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    const newEventObj = {
      id: Date.now(),
      title: newEvent.title,
      date: eventDate,
      time: newEvent.time,
      location: newEvent.location,
      type: newEvent.type
    };

    setEvents(prev => [...prev, newEventObj]);
    setIsEventModalOpen(false);
    setNewEvent({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00 AM - 10:00 AM',
      location: '',
      type: 'Visit'
    });
  };

  // Calendar setup
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = addDays(startOfWeek(monthEnd), 6);
  
  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Determine what has events today
  const eventsToday = events.filter(e => isSameDay(e.date, new Date()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Overview of your students and overall tasks progress.
        </p>
      </header>

      {/* Metrics Row */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</CardTitle>
            <Users className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{metrics.totalStudents}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active assigned patients</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Per Week (Avg)</CardTitle>
            <Activity className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{Math.round(metrics.totalAssignedTasks / 4)}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assigned dynamically</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Assigned Total</CardTitle>
            <CheckSquare className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{metrics.totalAssignedTasks}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all students</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Completed</CardTitle>
            <CheckSquare className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{metrics.totalCompletedTasks}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Historically tracked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        {/* Calendar Section */}
        <Card className="lg:col-span-2 xl:col-span-3 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col h-full">
          <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="w-full sm:w-auto flex items-start justify-between sm:block">
                <div>
                  <CardTitle className="text-gray-900 dark:text-gray-100 mb-1">
                    In-Person Visit Schedule
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Manage your student visits and therapy appointments
                  </CardDescription>
                </div>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white sm:hidden mt-1 shrink-0 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center">
                    <button 
                      onClick={prevMonth}
                      className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium text-gray-900 dark:text-gray-100 w-[120px] text-center text-sm sm:text-base">
                      {format(currentDate, dateFormat)}
                    </span>
                    <button 
                      onClick={nextMonth}
                      className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <DialogTrigger asChild>
                    <Button size="sm" className="hidden sm:flex h-9 bg-blue-600 hover:bg-blue-700 text-white ml-2 gap-2">
                      <CalendarIcon className="w-4 h-4" /> 
                      <span className="hidden xl:inline">Add Event</span>
                      <span className="inline xl:hidden">Add</span>
                    </Button>
                  </DialogTrigger>
                </div>
              </div>
            </CardHeader>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
              <DialogHeader>
                <DialogTitle>Add New Visit or Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEvent} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Event Title</Label>
                  <Input 
                    id="title" 
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="e.g. Home Visit: Ethan W."
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-gray-700 dark:text-gray-300">Date</Label>
                    <Input 
                      id="date" 
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 [color-scheme:light] dark:[color-scheme:dark]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-gray-700 dark:text-gray-300">Time</Label>
                    <Input 
                      id="time" 
                      required
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      placeholder="e.g. 10:00 AM - 11:30 AM"
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location</Label>
                  <Input 
                    id="location" 
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="e.g. 123 Main St"
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">Target Type</Label>
                  <select 
                    id="type"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                    className="flex h-10 w-full rounded-md border text-sm px-3 py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Visit">Visit</option>
                    <option value="Observation">Observation</option>
                    <option value="Therapy">Therapy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEventModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Event
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                <div key={dayName} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                  {dayName}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((day, idx) => {
                const dayEvents = events.filter(e => isSameDay(e.date, day));
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDay = isToday(day);

                return (
                  <div 
                    key={day.toString()} 
                    className={`
                      min-h-[80px] p-2 rounded-lg border flex flex-col items-center xl:items-start transition-colors
                      ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600 border-transparent dark:border-transparent' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-100 dark:border-gray-800'}
                      ${isTodayDay ? 'ring-2 ring-blue-500 border-transparent' : ''}
                      hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm cursor-pointer
                    `}
                  >
                    <span className={`text-sm font-medium mb-1 ${isTodayDay ? 'bg-blue-500 text-white w-7 h-7 flex items-center justify-center rounded-full' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="w-full space-y-1 mt-1">
                      {dayEvents.map(event => (
                        <div 
                          key={event.id} 
                          title={event.title}
                          className="text-[10px] xl:text-xs truncate w-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-1 rounded"
                        >
                          <span className="hidden xl:inline">{event.time.split(' - ')[0]} </span>
                          <span className="font-semibold xl:font-normal">{event.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Visits List (Agenda) */}
        <Card className="lg:col-span-1 border-gray-200 dark:border-gray-800 border bg-white dark:bg-gray-900 shadow-sm flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              Upcoming Events
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">Next 30 days schedule</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-4">
            {events.length > 0 ? (
              events.sort((a,b) => a.date - b.date).map(event => (
                <div key={event.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg group hover:border-blue-100 dark:hover:border-blue-900 transition-colors">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{event.title}</h4>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {format(event.date, 'MMM d')} • {event.time}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
               <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                 No upcoming events this month.
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
