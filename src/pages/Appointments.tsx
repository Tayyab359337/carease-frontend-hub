import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentAPI, doctorAPI } from '@/services/api/mockService';
import { Appointment, Doctor } from '@/services/api/types';
import { toast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, Plus, Check, X, Users } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [requestFormData, setRequestFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadAppointments();
      if (user.role === 'patient') {
        loadDoctors();
      }
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      let data: Appointment[];
      if (user?.role === 'admin') {
        data = await appointmentAPI.getAllAppointments();
      } else {
        data = await appointmentAPI.getAppointments(user!.id, user!.role);
      }
      setAppointments(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const data = await doctorAPI.getDoctors();
      // Only show doctors with appointments enabled
      setDoctors(data.filter(d => d.appointmentsEnabled));
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  };

  const handleRequestAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !requestFormData.doctorId || !requestFormData.date || !requestFormData.time) return;

    setIsSubmitting(true);
    try {
      const selectedDoctor = doctors.find(d => d.id === requestFormData.doctorId);
      if (!selectedDoctor) throw new Error('Doctor not found');

      const appointmentDate = new Date(`${requestFormData.date}T${requestFormData.time}`);

      await appointmentAPI.createAppointment({
        patientId: user.id,
        patientName: user.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: appointmentDate.toISOString(),
        status: 'pending',
        notes: requestFormData.notes || undefined,
      });

      toast({
        title: 'Success',
        description: 'Appointment request sent successfully',
      });

      setIsRequestModalOpen(false);
      setRequestFormData({ doctorId: '', date: '', time: '', notes: '' });
      loadAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request appointment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, status);
      toast({
        title: 'Success',
        description: `Appointment ${status}`,
      });
      loadAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return '';
    }
  };

  // Get appointments for selected date
  const appointmentsForSelectedDate = selectedDate
    ? appointments.filter(apt => isSameDay(new Date(apt.date), selectedDate))
    : [];

  // Get dates with appointments for calendar highlighting
  const datesWithAppointments = appointments.map(apt => new Date(apt.date));

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) >= new Date() && apt.status !== 'cancelled'
  );

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground">
              {user?.role === 'admin' 
                ? 'View all doctor appointments' 
                : user?.role === 'doctor' 
                  ? 'Manage your appointments' 
                  : 'Request and manage your appointments'}
            </p>
          </div>
          {user?.role === 'patient' && (
            <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Request Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Request an Appointment</DialogTitle>
                  <DialogDescription>
                    Select a doctor and preferred time for your appointment
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRequestAppointment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Select Doctor *</Label>
                    <Select
                      value={requestFormData.doctorId}
                      onValueChange={(value) => setRequestFormData({ ...requestFormData, doctorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.length === 0 ? (
                          <SelectItem value="none" disabled>No doctors available</SelectItem>
                        ) : (
                          doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.name} {doctor.specialization && `- ${doctor.specialization}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !requestFormData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {requestFormData.date ? format(new Date(requestFormData.date), "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={requestFormData.date ? new Date(requestFormData.date) : undefined}
                          onSelect={(date) => setRequestFormData({ 
                            ...requestFormData, 
                            date: date ? format(date, 'yyyy-MM-dd') : '' 
                          })}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Preferred Time *</Label>
                    <Select
                      value={requestFormData.time}
                      onValueChange={(value) => setRequestFormData({ ...requestFormData, time: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">09:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="14:00">02:00 PM</SelectItem>
                        <SelectItem value="15:00">03:00 PM</SelectItem>
                        <SelectItem value="16:00">04:00 PM</SelectItem>
                        <SelectItem value="17:00">05:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={requestFormData.notes}
                      onChange={(e) => setRequestFormData({ ...requestFormData, notes: e.target.value })}
                      placeholder="Reason for visit or any additional information..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsRequestModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isSubmitting || !requestFormData.doctorId || !requestFormData.date || !requestFormData.time}
                    >
                      {isSubmitting ? 'Requesting...' : 'Request Appointment'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Appointments</p>
                  <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-foreground">{upcomingAppointments.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold text-foreground">{pendingAppointments.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Calendar and Appointments */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="shadow-md lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar
              </CardTitle>
              <CardDescription>Select a date to view appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border pointer-events-auto"
                modifiers={{
                  hasAppointment: datesWithAppointments,
                }}
                modifiersStyles={{
                  hasAppointment: {
                    fontWeight: 'bold',
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                    color: 'hsl(var(--primary))',
                  },
                }}
              />
              {selectedDate && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointmentsForSelectedDate.length} appointment(s)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments for Selected Date */}
          <Card className="shadow-md lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {selectedDate ? `Appointments for ${format(selectedDate, 'MMM d, yyyy')}` : 'Select a Date'}
              </CardTitle>
              <CardDescription>
                {appointmentsForSelectedDate.length} appointment(s) scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointmentsForSelectedDate.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No appointments scheduled for this date
                    </p>
                  </div>
                ) : (
                  appointmentsForSelectedDate.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {user?.role === 'patient' 
                              ? appointment.doctorName 
                              : user?.role === 'admin'
                                ? `${appointment.patientName} → ${appointment.doctorName}`
                                : appointment.patientName}
                          </h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(appointment.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm mt-2 text-muted-foreground italic">
                            "{appointment.notes}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {user?.role === 'doctor' && appointment.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Upcoming Appointments */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              All Upcoming Appointments ({upcomingAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming appointments</p>
                  {user?.role === 'patient' && (
                    <Button 
                      className="mt-4" 
                      onClick={() => setIsRequestModalOpen(true)}
                    >
                      Request Your First Appointment
                    </Button>
                  )}
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {user?.role === 'patient' 
                            ? appointment.doctorName 
                            : user?.role === 'admin'
                              ? `${appointment.patientName} → ${appointment.doctorName}`
                              : appointment.patientName}
                        </h3>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(appointment.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">{appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {user?.role === 'doctor' && appointment.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}
                      {user?.role === 'patient' && appointment.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                        >
                          Cancel Request
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}