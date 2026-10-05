import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckSquare } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-6 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">ClearTasks</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium hover:underline underline-offset-4">Login</Link>
          <Button asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-3xl mx-auto py-24">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Who is doing what, <br className="hidden md:inline" />
          <span className="text-primary">and are we on track?</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10">
          The lightweight AI-powered project planning and task distribution application designed for student teams.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild className="h-12 px-8 text-base">
            <Link to="/signup">Start Your Project</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
            <Link to="/login">Login to Dashboard</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ClearTasks. Created for student teams.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
