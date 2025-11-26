import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { doctorAPI } from '@/services/api/mockService';
import { Doctor } from '@/services/api/types';
import { toast } from '@/hooks/use-toast';
import { Users, Mail, Phone, CheckCircle2, XCircle } from 'lucide-react';

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await doctorAPI.getDoctors();
      setDoctors(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load doctors',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSubscription = async (doctorId: string, isSubscribed: boolean) => {
    try {
      await doctorAPI.updateDoctorSubscription(doctorId, isSubscribed);
      await loadDoctors();
      toast({
        title: 'Success',
        description: `Subscription ${isSubscribed ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAppointments = async (doctorId: string, enabled: boolean) => {
    try {
      await doctorAPI.updateAppointmentsEnabled(doctorId, enabled);
      await loadDoctors();
      toast({
        title: 'Success',
        description: `Appointments ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointments',
        variant: 'destructive',
      });
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctors Management</h1>
          <p className="text-muted-foreground">Manage doctor subscriptions and permissions</p>
        </div>

        <div className="grid gap-4">
          {doctors.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No doctors registered yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            doctors.map((doctor) => (
              <Card key={doctor.id} className="shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {doctor.name}
                        {doctor.isSubscribed && (
                          <Badge variant="default" className="bg-success text-success-foreground">
                            Subscribed
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{doctor.specialization || 'General Physician'}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{doctor.email}</span>
                      </div>
                      {doctor.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{doctor.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {doctor.isSubscribed ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium">Subscription Active</span>
                        </div>
                        <Switch
                          checked={doctor.isSubscribed}
                          onCheckedChange={(checked) =>
                            handleToggleSubscription(doctor.id, checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {doctor.appointmentsEnabled ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium">Appointments Enabled</span>
                        </div>
                        <Switch
                          checked={doctor.appointmentsEnabled}
                          onCheckedChange={(checked) =>
                            handleToggleAppointments(doctor.id, checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
