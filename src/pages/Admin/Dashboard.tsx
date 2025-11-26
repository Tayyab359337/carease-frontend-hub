import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { MetricsCard } from '@/components/MetricsCard';
import { Users, Activity, Calendar, CreditCard, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { adminAPI, paymentAPI, doctorAPI, exportToCSV } from '@/services/api/mockService';
import { DashboardMetrics, Payment } from '@/services/api/types';
import { toast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metricsData, paymentsData] = await Promise.all([
        adminAPI.getDashboardMetrics(),
        paymentAPI.getPayments(),
      ]);
      setMetrics(metricsData);
      setPayments(paymentsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentStatusChange = async (id: string, status: 'pending' | 'paid') => {
    try {
      await paymentAPI.updatePaymentStatus(id, status);
      await loadData();
      toast({
        title: 'Success',
        description: 'Payment status updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'destructive',
      });
    }
  };

  const handleToggleSubscription = async (doctorId: string, isSubscribed: boolean) => {
    try {
      await doctorAPI.updateDoctorSubscription(doctorId, isSubscribed);
      toast({
        title: 'Success',
        description: 'Subscription status updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  const handleExportPayments = () => {
    exportToCSV(payments, 'payments');
    toast({
      title: 'Success',
      description: 'Payments exported to CSV',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of your healthcare platform</p>
          </div>
          <Button onClick={handleExportPayments} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        {metrics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricsCard
              title="Total Doctors"
              value={metrics.totalDoctors}
              icon={Users}
              trend={{ value: '+12% from last month', positive: true }}
            />
            <MetricsCard
              title="Total Patients"
              value={metrics.totalPatients}
              icon={Users}
              trend={{ value: '+18% from last month', positive: true }}
            />
            <MetricsCard
              title="Total Visits"
              value={metrics.totalVisits}
              icon={Activity}
              trend={{ value: '+8% from last month', positive: true }}
            />
            <MetricsCard
              title="Appointments"
              value={metrics.totalAppointments}
              icon={Calendar}
              trend={{ value: '+23% from last month', positive: true }}
            />
          </div>
        )}

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Payments
            </CardTitle>
            <CardDescription>Manage doctor subscription payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No payments yet</p>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{payment.doctorName}</p>
                      <p className="text-sm text-muted-foreground">
                        ${payment.amount} - {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={payment.status === 'paid'}
                        onCheckedChange={(checked) =>
                          handlePaymentStatusChange(payment.id, checked ? 'paid' : 'pending')
                        }
                      />
                      <span
                        className={`text-sm font-medium ${
                          payment.status === 'paid' ? 'text-success' : 'text-warning'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
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
