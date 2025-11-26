import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { patientAPI, visitAPI } from '@/services/api/mockService';
import { Patient, Visit } from '@/services/api/types';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft, User, Phone, Mail, IdCard, Calendar,
  Activity, FileText, Clock, Edit, Trash2
} from 'lucide-react';

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPatientData();
    }
  }, [id]);

  const loadPatientData = async () => {
    try {
      const patientData = await patientAPI.getPatientById(id!);
      if (!patientData) {
        toast({
          title: 'Error',
          description: 'Patient not found',
          variant: 'destructive',
        });
        navigate('/patients');
        return;
      }
      setPatient(patientData);

      const visitsData = await visitAPI.getVisits(id!);
      setVisits(visitsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load patient details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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

  if (!patient) {
    return null;
  }

  const nextVisitDate = new Date(patient.nextVisit);
  const isUpcoming = nextVisitDate > new Date();

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
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-3xl">{patient.name}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Patient ID: {patient.id}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={isUpcoming ? 'default' : 'secondary'}
                className={isUpcoming ? 'bg-success text-success-foreground' : ''}
              >
                {isUpcoming ? 'Active' : 'Inactive'}
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
                      <p className="font-medium">{patient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{patient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <IdCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">CNIC</p>
                      <p className="font-medium">{patient.cnic}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Medical Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Disease/Condition</p>
                      <p className="font-medium">{patient.disease}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Medicine</p>
                      <p className="font-medium">{patient.medicine}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Next Visit</p>
                      <p className="font-medium">
                        {nextVisitDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Patient Since</p>
                      <p className="font-medium">
                        {new Date(patient.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Visit History ({visits.length})
            </CardTitle>
            <CardDescription>Complete medical visit records</CardDescription>
          </CardHeader>
          <CardContent>
            {visits.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No visits recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visits.map((visit, index) => (
                  <div key={visit.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {new Date(visit.date).toLocaleDateString()}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            with {visit.doctorName}
                          </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Diagnosis</p>
                            <p className="font-medium">{visit.disease}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Prescribed Medicine</p>
                            <p className="font-medium">{visit.medicine}</p>
                          </div>
                        </div>
                        {visit.nextVisit && (
                          <p className="text-sm text-primary">
                            Next visit scheduled: {new Date(visit.nextVisit).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
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
