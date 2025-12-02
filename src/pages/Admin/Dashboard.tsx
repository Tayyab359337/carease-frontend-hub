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
      <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Overview of your healthcare platform</p>
          </div>
          <Button onClick={handleExportPayments} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        {metrics && (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CreditCard className="h-5 w-5 flex-shrink-0" />
              Recent Payments
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">Manage doctor subscription payments</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-3 sm:space-y-4">
              {payments.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm sm:text-base">No payments yet</p>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{payment.doctorName}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        ${payment.amount} - {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Switch
                        checked={payment.status === 'paid'}
                        onCheckedChange={(checked) =>
                          handlePaymentStatusChange(payment.id, checked ? 'paid' : 'pending')
                        }
                      />
                      <span
                        className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
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
