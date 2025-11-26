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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Dashboard</h1>
          <p className="text-muted-foreground">Track your health journey</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Visits</CardTitle>
                <CardDescription>View your medical visit history</CardDescription>
              </div>
              <Input
                type="search"
                placeholder="Search visits..."
                className="max-w-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredVisits.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {searchQuery ? 'No visits found matching your search' : 'No visits yet'}
                </p>
              ) : (
                filteredVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{visit.doctorName}</p>
                      <p className="text-sm text-muted-foreground">
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
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Request Appointment</CardTitle>
            <CardDescription>Book an appointment with your doctor</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Appointment request feature will be available when your doctor enables appointments.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
