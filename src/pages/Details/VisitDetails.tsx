import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { visitAPI } from '@/services/api/mockService';
import { Visit } from '@/services/api/types';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft, Calendar, User, Stethoscope, Activity,
  FileText, Clock, Pill, ClipboardList, Edit, Download
} from 'lucide-react';

export default function VisitDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVisitData();
    }
  }, [id]);

  const loadVisitData = async () => {
    try {
      const visits = await visitAPI.getAllVisits();
      const visitData = visits.find(v => v.id === id);

      if (!visitData) {
        toast({
          title: 'Error',
          description: 'Visit not found',
          variant: 'destructive',
        });
        navigate('/visits');
        return;
      }

      setVisit(visitData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load visit details',
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

  if (!visit) {
    return null;
  }

  const visitDate = new Date(visit.date);
  const hasNextVisit = visit.nextVisit && new Date(visit.nextVisit) > new Date();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">Medical Visit</CardTitle>
                <CardDescription className="text-base">
                  Visit ID: {visit.id}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-base px-4 py-1">
                {visitDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Visit Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Visit Date & Time</p>
                      <p className="font-medium">
                        {visitDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {visitDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Patient</p>
                      <p className="font-medium">{visit.patientName}</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={() => navigate(`/patients/${visit.patientId}`)}
                      >
                        View Patient Profile
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Doctor</p>
                      <p className="font-medium">{visit.doctorName}</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={() => navigate(`/doctors/${visit.doctorId}`)}
                      >
                        View Doctor Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Medical Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Diagnosis</p>
                      <p className="font-medium">{visit.disease}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Pill className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Prescribed Medicine</p>
                      <p className="font-medium">{visit.medicine}</p>
                    </div>
                  </div>
                  <Separator />
                  {visit.nextVisit && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Next Visit Scheduled</p>
                        <p className="font-medium">
                          {new Date(visit.nextVisit).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        {hasNextVisit && (
                          <Badge variant="default" className="mt-1 bg-success text-success-foreground">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Doctor's Notes
            </CardTitle>
            <CardDescription>Clinical observations and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="No notes recorded for this visit"
              value="Patient presented with symptoms of the common cold including fever, cough, and congestion. Physical examination revealed no signs of complications. Prescribed medication as noted above with instructions to rest and stay hydrated. Follow-up scheduled if symptoms persist beyond one week."
              readOnly
              className="min-h-[120px] resize-none bg-muted"
            />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Vital Signs
            </CardTitle>
            <CardDescription>Recorded during the visit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Blood Pressure</p>
                <p className="text-2xl font-bold">120/80</p>
                <p className="text-xs text-muted-foreground">mmHg</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Heart Rate</p>
                <p className="text-2xl font-bold">72</p>
                <p className="text-xs text-muted-foreground">bpm</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Temperature</p>
                <p className="text-2xl font-bold">98.6</p>
                <p className="text-xs text-muted-foreground">°F</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Weight</p>
                <p className="text-2xl font-bold">70</p>
                <p className="text-xs text-muted-foreground">kg</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Height</p>
                <p className="text-2xl font-bold">175</p>
                <p className="text-xs text-muted-foreground">cm</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Oxygen Level</p>
                <p className="text-2xl font-bold">98</p>
                <p className="text-xs text-muted-foreground">%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prescription Details
            </CardTitle>
            <CardDescription>Medication and dosage information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{visit.medicine}</p>
                    <p className="text-sm text-muted-foreground">500mg tablets</p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <Separator className="my-3" />
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Dosage</p>
                    <p className="font-medium">1 tablet every 6 hours</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">5 days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Instructions</p>
                    <p className="font-medium">Take after meals</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">20 tablets</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
