import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { visitAPI, patientAPI, exportToCSV } from '@/services/api/mockService';
import { Visit, Patient } from '@/services/api/types';
import { toast } from '@/hooks/use-toast';
import { Activity, Search, Calendar, Download, Plus, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Visits() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [visitFormData, setVisitFormData] = useState({
    patientId: '',
    disease: '',
    medicine: '',
    notes: '',
    nextVisit: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenLevel: '',
    dosage: '',
    duration: '',
    instructions: '',
  });

  useEffect(() => {
    if (user) {
      loadVisits();
      if (user.role === 'doctor') {
        loadPatients();
      }
    }
  }, [user]);

  const loadVisits = async () => {
    try {
      let data: Visit[];
      if (user?.role === 'patient') {
        data = await visitAPI.getVisits(user.id);
      } else {
        data = await visitAPI.getAllVisits();
      }
      setVisits(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load visits',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      if (user) {
        const data = await patientAPI.getPatients(user.id);
        setPatients(data);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const handleExportVisits = () => {
    exportToCSV(filteredVisits, 'visits');
    toast({
      title: 'Success',
      description: 'Visits exported to CSV',
    });
  };

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !visitFormData.patientId) return;

    setIsSubmitting(true);
    try {
      const selectedPatient = patients.find(p => p.id === visitFormData.patientId);
      if (!selectedPatient) throw new Error('Patient not found');

      await visitAPI.createVisit({
        patientId: visitFormData.patientId,
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

      setIsAddModalOpen(false);
      resetForm();
      loadVisits();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record visit',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setVisitFormData({
      patientId: '',
      disease: '',
      medicine: '',
      notes: '',
      nextVisit: '',
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      oxygenLevel: '',
      dosage: '',
      duration: '',
      instructions: '',
    });
  };

  const filteredVisits = visits.filter((visit) =>
    (user?.role === 'patient' ? visit.doctorName : visit.patientName)
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    visit.disease.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingVisits = visits.filter(
    (v) => v.nextVisit && new Date(v.nextVisit) > new Date()
  );

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
            <h1 className="text-3xl font-bold text-foreground">
              {user?.role === 'patient' ? 'My Visits' : 'Patient Visits'}
            </h1>
            <p className="text-muted-foreground">View visit history and records</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportVisits} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {user?.role === 'doctor' && (
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Visit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Record New Visit
                    </DialogTitle>
                    <DialogDescription>
                      Enter visit details including diagnosis, prescription, and vitals
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddVisit} className="space-y-6">
                    {/* Patient Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="patientId">Select Patient *</Label>
                      <Select
                        value={visitFormData.patientId}
                        onValueChange={(value) => setVisitFormData({ ...visitFormData, patientId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} - {patient.cnic}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Diagnosis Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Diagnosis & Treatment
                      </h4>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="disease">Diagnosis / Condition *</Label>
                          <Input
                            id="disease"
                            value={visitFormData.disease}
                            onChange={(e) => setVisitFormData({ ...visitFormData, disease: e.target.value })}
                            placeholder="e.g., Common Cold, Hypertension, Diabetes"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="medicine">Prescribed Medicine *</Label>
                          <Textarea
                            id="medicine"
                            value={visitFormData.medicine}
                            onChange={(e) => setVisitFormData({ ...visitFormData, medicine: e.target.value })}
                            placeholder="e.g., Paracetamol 500mg, Amoxicillin 250mg"
                            rows={2}
                            required
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="dosage">Dosage</Label>
                            <Input
                              id="dosage"
                              value={visitFormData.dosage}
                              onChange={(e) => setVisitFormData({ ...visitFormData, dosage: e.target.value })}
                              placeholder="e.g., 1 tablet every 6 hours"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                              id="duration"
                              value={visitFormData.duration}
                              onChange={(e) => setVisitFormData({ ...visitFormData, duration: e.target.value })}
                              placeholder="e.g., 5 days"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="instructions">Instructions</Label>
                            <Input
                              id="instructions"
                              value={visitFormData.instructions}
                              onChange={(e) => setVisitFormData({ ...visitFormData, instructions: e.target.value })}
                              placeholder="e.g., Take after meals"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vital Signs Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Vital Signs
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bloodPressure">Blood Pressure</Label>
                          <Input
                            id="bloodPressure"
                            value={visitFormData.bloodPressure}
                            onChange={(e) => setVisitFormData({ ...visitFormData, bloodPressure: e.target.value })}
                            placeholder="e.g., 120/80 mmHg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="heartRate">Heart Rate</Label>
                          <Input
                            id="heartRate"
                            value={visitFormData.heartRate}
                            onChange={(e) => setVisitFormData({ ...visitFormData, heartRate: e.target.value })}
                            placeholder="e.g., 72 bpm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="temperature">Temperature</Label>
                          <Input
                            id="temperature"
                            value={visitFormData.temperature}
                            onChange={(e) => setVisitFormData({ ...visitFormData, temperature: e.target.value })}
                            placeholder="e.g., 98.6 °F"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight</Label>
                          <Input
                            id="weight"
                            value={visitFormData.weight}
                            onChange={(e) => setVisitFormData({ ...visitFormData, weight: e.target.value })}
                            placeholder="e.g., 70 kg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height</Label>
                          <Input
                            id="height"
                            value={visitFormData.height}
                            onChange={(e) => setVisitFormData({ ...visitFormData, height: e.target.value })}
                            placeholder="e.g., 175 cm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="oxygenLevel">Oxygen Level</Label>
                          <Input
                            id="oxygenLevel"
                            value={visitFormData.oxygenLevel}
                            onChange={(e) => setVisitFormData({ ...visitFormData, oxygenLevel: e.target.value })}
                            placeholder="e.g., 98%"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Clinical Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Clinical Notes</Label>
                      <Textarea
                        id="notes"
                        value={visitFormData.notes}
                        onChange={(e) => setVisitFormData({ ...visitFormData, notes: e.target.value })}
                        placeholder="Additional observations, recommendations, or follow-up instructions..."
                        rows={3}
                      />
                    </div>

                    {/* Next Visit */}
                    <div className="space-y-2">
                      <Label htmlFor="nextVisit">Schedule Next Visit</Label>
                      <Input
                        id="nextVisit"
                        type="date"
                        value={visitFormData.nextVisit}
                        onChange={(e) => setVisitFormData({ ...visitFormData, nextVisit: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setIsAddModalOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isSubmitting || !visitFormData.patientId}>
                        {isSubmitting ? 'Saving...' : 'Save Visit'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                  <p className="text-2xl font-bold text-foreground">{visits.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Visits</p>
                  <p className="text-2xl font-bold text-foreground">{upcomingVisits.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">
                    {visits.filter((v) => {
                      const visitDate = new Date(v.date);
                      const now = new Date();
                      return (
                        visitDate.getMonth() === now.getMonth() &&
                        visitDate.getFullYear() === now.getFullYear()
                      );
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search visits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Visit History
            </CardTitle>
            <CardDescription>
              {filteredVisits.length} {filteredVisits.length === 1 ? 'visit' : 'visits'} recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredVisits.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No visits found matching your search' : 'No visits recorded yet'}
                  </p>
                </div>
              ) : (
                filteredVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {user?.role === 'patient' ? visit.doctorName : visit.patientName}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(visit.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p>🏥 {visit.disease}</p>
                        <p>💊 {visit.medicine}</p>
                      </div>
                      {visit.nextVisit && (
                        <p className="text-xs text-primary mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next visit: {new Date(visit.nextVisit).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/visits/${visit.id}`)}
                    >
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