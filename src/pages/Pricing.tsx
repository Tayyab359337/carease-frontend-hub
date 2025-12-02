import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, X, Sparkles, Zap, Crown, ArrowLeft } from 'lucide-react';

export default function Pricing() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      icon: Zap,
      features: [
        { name: 'Up to 3 patients', included: true },
        { name: 'Basic patient records', included: true },
        { name: 'Visit tracking', included: true },
        { name: 'Email support', included: true },
        { name: 'Appointment management', included: false },
        { name: 'Data export (CSV)', included: false },
        { name: 'Custom reports', included: false },
        { name: 'Mobile app access', included: false },
        { name: 'Video consultations', included: false },
        { name: 'Advanced analytics', included: false },
      ],
      cta: 'Get Started',
      recommended: false,
    },
    {
      name: 'Standard',
      price: '$29',
      period: '/month',
      description: 'For growing practices',
      icon: Crown,
      features: [
        { name: 'Unlimited patients', included: true },
        { name: 'Advanced patient records', included: true },
        { name: 'Visit tracking & analytics', included: true },
        { name: 'Appointment management', included: true },
        { name: 'Priority support', included: true },
        { name: 'Data export (CSV)', included: true },
        { name: 'Custom reports', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Video consultations', included: false },
        { name: 'Advanced analytics', included: false },
      ],
      cta: 'Upgrade Now',
      recommended: true,
    },
    {
      name: 'Business',
      price: '$99',
      period: '/month',
      description: 'For established healthcare networks',
      icon: Sparkles,
      features: [
        { name: 'Unlimited patients', included: true },
        { name: 'Advanced patient records', included: true },
        { name: 'Visit tracking & analytics', included: true },
        { name: 'Appointment management', included: true },
        { name: '24/7 priority support', included: true },
        { name: 'Data export (CSV)', included: true },
        { name: 'Custom reports', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Video consultations', included: true },
        { name: 'Advanced analytics', included: true },
      ],
      cta: 'Contact Sales',
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 sm:mb-8 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-12 sm:mb-16 lg:mb-20 space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your healthcare practice. Scale as you grow.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 mb-16 sm:mb-20">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative transition-all duration-300 ${
                  plan.recommended ? 'lg:scale-105' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-primary text-primary-foreground">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                <Card
                  className={`shadow-lg h-full flex flex-col transition-all duration-300 hover:shadow-xl ${
                    plan.recommended ? 'border-2 border-primary' : 'border'
                  }`}
                >
                  <CardHeader className="p-6 sm:p-8 text-center">
                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${
                        plan.recommended ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>
                    <div className="mt-6">
                      <span className="text-4xl sm:text-5xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground ml-2">{plan.period}</span>}
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="space-y-3 sm:space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${
                            feature.included ? '' : 'text-muted-foreground opacity-60'
                          }`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      variant={plan.recommended ? 'default' : 'outline'}
                      size="lg"
                    >
                      {plan.recommended && <Sparkles className="mr-2 h-4 w-4" />}
                      {plan.cta}
                    </Button>

                    {plan.name === 'Business' && (
                      <p className="text-xs text-center text-muted-foreground mt-4">
                        Custom pricing available for large organizations
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="bg-card border rounded-lg p-8 sm:p-12 mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold">Free</th>
                  <th className="text-center py-3 px-4 font-semibold">Standard</th>
                  <th className="text-center py-3 px-4 font-semibold">Business</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Patient Capacity</td>
                  <td className="text-center py-3 px-4">3</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Appointments</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 mx-auto text-muted-foreground" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 mx-auto text-success" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 mx-auto text-success" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Custom Reports</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 mx-auto text-muted-foreground" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 mx-auto text-success" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 mx-auto text-success" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Video Consultations</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 mx-auto text-muted-foreground" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 mx-auto text-muted-foreground" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 mx-auto text-success" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Advanced Analytics</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 mx-auto text-muted-foreground" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 mx-auto text-muted-foreground" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle2 className="h-4 w-4 mx-auto text-success" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card border rounded-lg p-6 sm:p-8">
            <h3 className="font-semibold mb-3 text-lg">Flexible Billing</h3>
            <p className="text-muted-foreground text-sm">
              Monthly or annual billing available. Cancel anytime with no hidden fees.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6 sm:p-8">
            <h3 className="font-semibold mb-3 text-lg">Money-Back Guarantee</h3>
            <p className="text-muted-foreground text-sm">
              Not satisfied? Get a full refund within 14 days of your first purchase.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6 sm:p-8">
            <h3 className="font-semibold mb-3 text-lg">Expert Support</h3>
            <p className="text-muted-foreground text-sm">
              Get help from our healthcare experts. Email, chat, and phone support available.
            </p>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">
            Our team is here to help. Contact us for more information or a custom quote.
          </p>
          <Button size="lg" variant="outline">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
