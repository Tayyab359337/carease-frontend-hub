import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { visitAPI, exportToCSV } from '@/services/api/mockService';
import { Visit } from '@/services/api/types';
import { toast } from '@/hooks/use-toast';
import { Activity, Search, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Visits() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadVisits();
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

  const handleExportVisits = () => {
    exportToCSV(filteredVisits, 'visits');
    toast({
      title: 'Success',
      description: 'Visits exported to CSV',
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
