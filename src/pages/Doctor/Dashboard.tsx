import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { MetricsCard } from '@/components/MetricsCard';
import { Users, Activity, Plus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { patientAPI, visitAPI } from '@/services/api/mockService';
import { Patient } from '@/services/api/types';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    phone: '',
    email: '',
    disease: '',
    medicine: '',
    nextVisit: '',
  });

  const isSubscribed = false; // Mock - would come from user data
  const patientLimit = 3;
  const canAddPatient = isSubscribed || patients.length < patientLimit;

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
    try {
      const data = await patientAPI.getPatients(user!.id);
      setPatients(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load patients',
        variant: 'destructive',
      });
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAddPatient) {
      toast({
        title: 'Limit reached',
        description: 'Subscribe to add more than 3 patients',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await patientAPI.addPatient({
        ...formData,
        dateAdded: new Date().toISOString(),
        doctorId: user!.id,
      });
      
      toast({
        title: 'Success',
        description: 'Patient added successfully',
      });
      
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        cnic: '',
        phone: '',
        email: '',
        disease: '',
        medicine: '',
        nextVisit: '',
      });
      loadPatients();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add patient',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Manage your patients and appointments</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canAddPatient}>
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>Enter patient details to add them to your list</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPatient} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnic">CNIC</Label>
                  <Input
                    id="cnic"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="12345-6789012-3"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disease">Disease/Condition</Label>
                  <Input
                    id="disease"
                    value={formData.disease}
                    onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicine">Prescribed Medicine</Label>
                  <Input
                    id="medicine"
                    value={formData.medicine}
                    onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextVisit">Next Visit Date</Label>
                  <Input
                    id="nextVisit"
                    type="date"
                    value={formData.nextVisit}
                    onChange={(e) => setFormData({ ...formData, nextVisit: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Patient'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {!isSubscribed && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're using the free plan ({patients.length}/{patientLimit} patients). Subscribe to add unlimited patients.
              <Button variant="link" className="ml-2 p-0 h-auto">
                Upgrade Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricsCard
            title="Total Patients"
            value={patients.length}
            icon={Users}
          />
          <MetricsCard
            title="Visits This Month"
            value="12"
            icon={Activity}
          />
          <MetricsCard
            title="Upcoming Appointments"
            value="5"
            icon={Activity}
          />
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>My Patients</CardTitle>
            <CardDescription>View and manage your patient list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No patients yet. Click "Add Patient" to get started.
                </p>
              ) : (
                patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.disease}</p>
                      <p className="text-xs text-muted-foreground">
                        Next visit: {new Date(patient.nextVisit).toLocaleDateString()}
                      </p>
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
      </div>
    </DashboardLayout>
  );
}
