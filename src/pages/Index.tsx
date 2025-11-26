import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-20 h-20 rounded-2xl bg-card flex items-center justify-center shadow-lg">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground">
              Welcome to Carease
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Your comprehensive healthcare management platform. Connect doctors and patients, 
              manage appointments, and streamline medical care.
            </p>
          </div>

          <div className="flex gap-4 pt-8">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="bg-card text-primary hover:bg-card/90 shadow-lg"
            >
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/signup')}
              className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              Create Account
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-16 max-w-4xl">
            {[
              {
                title: 'For Doctors',
                description: 'Manage patients, track visits, and maintain comprehensive medical records',
              },
              {
                title: 'For Patients',
                description: 'Access your medical history, book appointments, and stay connected with your healthcare providers',
              },
              {
                title: 'For Admins',
                description: 'Oversee operations, manage subscriptions, and ensure smooth platform functionality',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg shadow-lg text-left"
              >
                <CheckCircle2 className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
