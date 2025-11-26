import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { doctorAPI, patientAPI, paymentAPI } from '@/services/api/mockService';
import { Doctor, Patient, Payment } from '@/services/api/types';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft, User, Phone, Mail, Stethoscope, Calendar,
  Users, CreditCard, CheckCircle2, XCircle, Edit
} from 'lucide-react';

export default function DoctorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDoctorData();
    }
  }, [id]);

  const loadDoctorData = async () => {
    try {
      const doctors = await doctorAPI.getDoctors();
      const doctorData = doctors.find(d => d.id === id);

      if (!doctorData) {
        toast({
          title: 'Error',
          description: 'Doctor not found',
          variant: 'destructive',
        });
        navigate('/doctors');
        return;
      }

      setDoctor(doctorData);

      const [patientsData, paymentsData] = await Promise.all([
        patientAPI.getPatients(id!),
        paymentAPI.getPayments(),
      ]);

      setPatients(patientsData);
      setPayments(paymentsData.filter(p => p.doctorId === id));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load doctor details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSubscription = async (checked: boolean) => {
    try {
      await doctorAPI.updateDoctorSubscription(id!, checked);
      await loadDoctorData();
      toast({
        title: 'Success',
        description: `Subscription ${checked ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAppointments = async (checked: boolean) => {
    try {
      await doctorAPI.updateAppointmentsEnabled(id!, checked);
      await loadDoctorData();
      toast({
        title: 'Success',
        description: `Appointments ${checked ? 'enabled' : 'disabled'}`,
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

  if (!doctor) {
    return null;
  }

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidPayments = payments.filter(p => p.status === 'paid');

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Stethoscope className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-3xl">{doctor.name}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {doctor.specialization || 'General Physician'}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={doctor.isSubscribed ? 'default' : 'secondary'}
                className={doctor.isSubscribed ? 'bg-success text-success-foreground' : ''}
              >
                {doctor.isSubscribed ? 'Premium' : 'Free Plan'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{doctor.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{doctor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">
                        {new Date(doctor.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {doctor.isSubscribed ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">Premium Subscription</span>
                    </div>
                    <Switch
                      checked={doctor.isSubscribed}
                      onCheckedChange={handleToggleSubscription}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
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
                      onCheckedChange={handleToggleAppointments}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold text-foreground">{patients.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">${totalRevenue}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid Invoices</p>
                  <p className="text-2xl font-bold text-foreground">{paidPayments.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patients ({patients.length})
            </CardTitle>
            <CardDescription>List of registered patients</CardDescription>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No patients registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patients.map((patient, index) => (
                  <div key={patient.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.disease}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History ({payments.length})
            </CardTitle>
            <CardDescription>Subscription payment records</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No payment records</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div key={payment.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">${payment.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={payment.status === 'paid' ? 'default' : 'secondary'}
                        className={payment.status === 'paid' ? 'bg-success text-success-foreground' : ''}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
