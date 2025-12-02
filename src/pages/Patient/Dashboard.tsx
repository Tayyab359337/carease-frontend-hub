import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { MetricsCard } from '@/components/MetricsCard';
import { Activity, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { visitAPI, appointmentAPI } from '@/services/api/mockService';
import { Visit, Appointment } from '@/services/api/types';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [visitsData, appointmentsData] = await Promise.all([
        visitAPI.getVisits(user!.id),
        appointmentAPI.getAppointments(user!.id, 'patient'),
      ]);
      setVisits(visitsData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const upcomingVisits = visits.filter(
    (v) => v.nextVisit && new Date(v.nextVisit) > new Date()
  );

  const filteredVisits = visits.filter((visit) =>
    visit.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visit.disease.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Patient Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Track your health journey</p>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <MetricsCard
            title="Total Visits"
            value={visits.length}
            icon={Activity}
          />
          <MetricsCard
            title="Upcoming Visits"
            value={upcomingVisits.length}
            icon={Clock}
          />
          <MetricsCard
            title="Appointments"
            value={appointments.length}
            icon={Calendar}
          />
        </div>

        <Card className="shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl">My Visits</CardTitle>
                <CardDescription className="text-xs sm:text-sm">View your medical visit history</CardDescription>
              </div>
              <Input
                type="search"
                placeholder="Search visits..."
                className="w-full sm:max-w-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-3 sm:space-y-4">
              {filteredVisits.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm sm:text-base">
                  {searchQuery ? 'No visits found matching your search' : 'No visits yet'}
                </p>
              ) : (
                filteredVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{visit.doctorName}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {visit.disease} - {visit.medicine}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(visit.date).toLocaleDateString()}
                      </p>
                      {visit.nextVisit && (
                        <p className="text-xs text-primary mt-1">
                          Next visit: {new Date(visit.nextVisit).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Request Appointment</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Book an appointment with your doctor</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm sm:text-base">
              Appointment request feature will be available when your doctor enables appointments.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
