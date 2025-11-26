import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, X, Sparkles, Zap, Crown } from 'lucide-react';

export default function Subscription() {
  const { user } = useAuth();
  const isSubscribed = false;

  const features = {
    free: [
      'Up to 3 patients',
      'Basic patient records',
      'Visit tracking',
      'Email support',
    ],
    premium: [
      'Unlimited patients',
      'Advanced patient records',
      'Visit tracking & analytics',
      'Appointment management',
      'Priority support',
      'Data export (CSV)',
      'Custom reports',
      'Mobile app access',
    ],
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">
            Select the plan that best fits your practice needs
          </p>
        </div>

        {isSubscribed && (
          <Card className="border-success bg-success/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
                <div>
                  <p className="font-semibold text-success">Premium Plan Active</p>
                  <p className="text-sm text-muted-foreground">
                    Your subscription renews on December 26, 2025
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <Card className="shadow-lg border-2">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">Free</CardTitle>
              <CardDescription className="text-lg mt-2">
                Perfect for getting started
              </CardDescription>
              <div className="mt-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 opacity-50">
                  <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Appointment management</span>
                </div>
                <div className="flex items-start gap-3 opacity-50">
                  <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Data export</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" size="lg" disabled={!isSubscribed}>
                {isSubscribed ? 'Current Plan' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
              MOST POPULAR
            </div>
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl">Premium</CardTitle>
              <CardDescription className="text-lg mt-2">
                For growing practices
              </CardDescription>
              <div className="mt-6">
                <span className="text-5xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Billed monthly</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {features.premium.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full" size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                {isSubscribed ? 'Manage Subscription' : 'Upgrade Now'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime. No hidden fees.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md mt-12">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I switch plans later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens to my data if I cancel?</h3>
              <p className="text-sm text-muted-foreground">
                Your data is always yours. You can export all your data before canceling, and we keep it for 30 days after cancellation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-muted-foreground">
                We offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How secure is my patient data?</h3>
              <p className="text-sm text-muted-foreground">
                We use bank-level encryption and comply with healthcare data protection standards. Your data is always secure.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
