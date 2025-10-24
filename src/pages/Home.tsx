import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Cpu, Clock, BarChart3, Play, ArrowRight, RefreshCw } from "lucide-react";
import switchxLogo from "@/assets/switchx-logo.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-tech">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={switchxLogo} alt="SwitchX" className="h-8 w-8" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SwitchX
              </h1>
            </div>
            <nav className="flex items-center gap-4">
              <Link to="/input">
                <Button variant="outline" className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Simulation
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <RefreshCw className="h-12 w-12 text-accent animate-pulse-glow" />
            <h1 className="text-5xl md:text-6xl font-bold">
              Context Switch
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Visualizer
              </span>
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Interactive Round Robin CPU scheduling simulator with real-time process 
            queue visualization and dynamic Gantt chart updates. Perfect for 
            understanding operating system concepts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/input">
              <Button size="lg" className="gap-2 shadow-process">
                <Play className="h-5 w-5" />
                Start Simulation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/visualizer">
              <Button variant="outline" size="lg" className="gap-2">
                <BarChart3 className="h-5 w-5" />
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-process hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 bg-process-blue/10 rounded-lg flex items-center justify-center mb-4">
                <Cpu className="h-6 w-6 text-process-blue" />
              </div>
              <CardTitle>Round Robin Algorithm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Accurate implementation of the Round Robin CPU scheduling algorithm 
                with configurable quantum time and real-time process switching.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-process hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 bg-process-green/10 rounded-lg flex items-center justify-center mb-4">
                <RefreshCw className="h-6 w-6 text-process-green" />
              </div>
              <CardTitle>Process Queue Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Watch processes move dynamically through Ready, Running, and 
                Completed queues with smooth animations and state transitions.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-process hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 bg-process-orange/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-process-orange" />
              </div>
              <CardTitle>Interactive Gantt Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Real-time Gantt chart updates showing process execution timeline 
                with distinct colors and timing information for each process.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the Round Robin scheduling algorithm through interactive visualization
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
              1
            </div>
            <h3 className="font-semibold mb-2">Input Processes</h3>
            <p className="text-sm text-muted-foreground">
              Enter process details with burst times and set quantum time
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
              2
            </div>
            <h3 className="font-semibold mb-2">Watch Queues</h3>
            <p className="text-sm text-muted-foreground">
              See processes move through Ready → Running → Completed queues
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
              3
            </div>
            <h3 className="font-semibold mb-2">Gantt Chart</h3>
            <p className="text-sm text-muted-foreground">
              Track execution timeline with real-time chart updates
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
              4
            </div>
            <h3 className="font-semibold mb-2">Analyze Results</h3>
            <p className="text-sm text-muted-foreground">
              View statistics like waiting time and turnaround time
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={switchxLogo} alt="SwitchX" className="h-6 w-6" />
              <span className="font-semibold">SwitchX</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for Operating Systems education
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;