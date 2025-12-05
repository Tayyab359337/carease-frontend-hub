import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { patientAPI, visitAPI, exportToCSV } from '@/services/api/mockService';
import { Patient } from '@/services/api/types';
import { toast } from '@/hooks/use-toast';
import { Users, Plus, AlertCircle, Search, Download, Calendar, Stethoscope } from 'lucide-react';

export default function DoctorPatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
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
  const [visitFormData, setVisitFormData] = useState({
    disease: '',
    medicine: '',
    notes: '',
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

  const handleExportPatients = () => {
    exportToCSV(filteredPatients, 'patients');
    toast({
      title: 'Success',
      description: 'Patients exported to CSV',
    });
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.disease.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !user) return;

    setIsLoading(true);
    try {
      await visitAPI.createVisit({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        doctorId: user.id,
        doctorName: user.name,
        date: new Date().toISOString(),
        disease: visitFormData.disease,
        medicine: visitFormData.medicine,
        nextVisit: visitFormData.nextVisit || undefined,
      });

      toast({
        title: 'Success',
        description: 'Visit recorded successfully',
      });

      setIsVisitModalOpen(false);
      setVisitFormData({ disease: '', medicine: '', notes: '', nextVisit: '' });
      setSelectedPatient(null);
      loadPatients();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record visit',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openVisitModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setVisitFormData({
      disease: patient.disease,
      medicine: patient.medicine,
      notes: '',
      nextVisit: '',
    });
    setIsVisitModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Patients</h1>
            <p className="text-muted-foreground">Manage your patient records</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportPatients} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button disabled={!canAddPatient}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient List ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? 'No patients found matching your search'
                      : 'No patients yet. Click "Add Patient" to get started.'}
                  </p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                <div className="flex-1">
                      <h3 className="font-semibold mb-1">{patient.name}</h3>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p>🏥 {patient.disease}</p>
                        <p>💊 {patient.medicine}</p>
                        <p>📧 {patient.email}</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {new Date(patient.nextVisit).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => openVisitModal(patient)}
                      >
                        <Stethoscope className="mr-1 h-4 w-4" />
                        Add Visit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        {/* Add Visit Dialog */}
        <Dialog open={isVisitModalOpen} onOpenChange={setIsVisitModalOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Current Visit</DialogTitle>
              <DialogDescription>
                {selectedPatient && `Recording visit for ${selectedPatient.name}`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddVisit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visit-disease">Diagnosis / Condition</Label>
                <Input
                  id="visit-disease"
                  value={visitFormData.disease}
                  onChange={(e) => setVisitFormData({ ...visitFormData, disease: e.target.value })}
                  placeholder="e.g., Common Cold, Hypertension"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visit-medicine">Prescribed Medicine</Label>
                <Textarea
                  id="visit-medicine"
                  value={visitFormData.medicine}
                  onChange={(e) => setVisitFormData({ ...visitFormData, medicine: e.target.value })}
                  placeholder="e.g., Paracetamol 500mg - 2x daily"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visit-notes">Clinical Notes (Optional)</Label>
                <Textarea
                  id="visit-notes"
                  value={visitFormData.notes}
                  onChange={(e) => setVisitFormData({ ...visitFormData, notes: e.target.value })}
                  placeholder="Any additional observations or instructions..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visit-nextVisit">Next Visit Date (Optional)</Label>
                <Input
                  id="visit-nextVisit"
                  type="date"
                  value={visitFormData.nextVisit}
                  onChange={(e) => setVisitFormData({ ...visitFormData, nextVisit: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsVisitModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Visit'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
