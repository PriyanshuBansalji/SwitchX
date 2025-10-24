import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Play, ArrowLeft, Trash2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import switchxLogo from "@/assets/switchx-logo.png";

interface Process {
  id: string;
  pid: number;
  name: string;
  burstTime: number;
  arrivalTime: number;
  color: string;
}

const processColors = [
  "process-red", "process-blue", "process-green", "process-orange",
  "process-purple", "process-cyan", "process-pink", "process-yellow"
];

const ProcessInput = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [maxProcesses, setMaxProcesses] = useState<number | null>(null);
  const [quantumTime, setQuantumTime] = useState<number>(2);
  const [isQuantumSet, setIsQuantumSet] = useState<boolean>(false);
  const [newProcessName, setNewProcessName] = useState("");
  const [newProcessBurst, setNewProcessBurst] = useState<number>(1);
  const [newProcessArrival, setNewProcessArrival] = useState<number>(0);
  // Removed nextPid, PID will be fetched from backend
  const navigate = useNavigate();
  const { toast } = useToast();



  const setProcessLimit = () => {
    if (!maxProcesses || maxProcesses <= 0) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid number of processes",
        variant: "destructive",
      });
      return;
    }

    if (maxProcesses > 10) {
      toast({
        title: "Too Many Processes",
        description: "Maximum 10 processes allowed for optimal visualization",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Process Limit Set",
      description: `You can now add up to ${maxProcesses} processes`,
    });
  };

  const addProcess = async () => {
    if (!maxProcesses) {
      toast({
        title: "Set Process Limit First",
        description: "Please set the number of processes before adding",
        variant: "destructive",
      });
      return;
    }

    if (!newProcessName.trim()) {
      toast({
        title: "Invalid Process Name",
        description: "Please enter a valid process name",
        variant: "destructive",
      });
      return;
    }

    // Assign PID locally (incremental)
          // Assign PID locally (incremental)
          const pid = processes.length > 0 ? Math.max(...processes.map(p => p.pid)) + 1 : 1;
          if (processes.length >= maxProcesses) {
            toast({
              title: "Maximum Processes Reached",
              description: `You can only add ${maxProcesses} processes`,
              variant: "destructive",
            });
            return;
          }

    // Fetch PID from backend
    let assignedPid = 0;
    assignedPid = Math.floor(Math.random() * 9000) + 1000; // fallback

    const newProcess: Process = {
      id: `P${processes.length + 1}`,
      pid: assignedPid,
      name: newProcessName.trim(),
      burstTime: newProcessBurst,
      arrivalTime: newProcessArrival,
      color: processColors[processes.length % processColors.length],
    };

    setProcesses([...processes, newProcess]);
    setNewProcessName("");
    setNewProcessBurst(1);
    setNewProcessArrival(0);

    // Set quantum time when first process is added
    if (!isQuantumSet) {
      setIsQuantumSet(true);
    }

    toast({
      title: "Process Created",
      description: `${newProcess.id} created with PID ${assignedPid}`,
    });
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id));
    toast({
      title: "Process Removed",
      description: "Process removed from simulation",
    });
  };

  const startSimulation = () => {
    if (processes.length === 0) {
      toast({
        title: "No Processes",
        description: "Please add at least one process to start simulation",
        variant: "destructive",
      });
      return;
    }

    if (quantumTime <= 0) {
      toast({
        title: "Invalid Quantum Time",
        description: "Quantum time must be greater than 0",
        variant: "destructive",
      });
      return;
    }

  // Store data in sessionStorage for the visualizer (include latest process list)
  sessionStorage.setItem('processes', JSON.stringify(processes));
  sessionStorage.setItem('quantumTime', quantumTime.toString());
  navigate('/visualizer');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addProcess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-tech">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <img src={switchxLogo} alt="SwitchX" className="h-8 w-8" />
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  SwitchX
                </h1>
              </Link>
            </div>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Configure Simulation</h1>
              <p className="text-muted-foreground text-lg">
                Add processes and set quantum time for Round Robin scheduling
              </p>
            </div>

            {/* Step 1: Set Number of Processes */}
            {!maxProcesses && (
              <Card className="mb-8 shadow-process">
                <CardHeader>
                  <CardTitle className="text-center">Step 1: Set Number of Processes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-w-md mx-auto">
                    <Label htmlFor="maxProcesses">How many processes do you want to simulate?</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="maxProcesses"
                        type="number"
                        min="1"
                        max="20"
                        placeholder="e.g., 5"
                        value={maxProcesses || ""}
                        onChange={(e) => setMaxProcesses(parseInt(e.target.value) || null)}
                        className="flex-1"
                      />
                      <Button onClick={setProcessLimit} disabled={!maxProcesses}>
                        Set Limit
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose between 1-10 processes for optimal visualization
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {maxProcesses && (
              <div className="grid lg:grid-cols-2 gap-8">
            {/* Process Input Form */}
            <Card className="shadow-process">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-accent" />
                  Add New Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="processName">Process Name</Label>
                  <Input
                    id="processName"
                    placeholder="e.g., Calculator, Notepad"
                    value={newProcessName}
                    onChange={(e) => setNewProcessName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="burstTime">Burst Time (ms)</Label>
                    <Input
                      id="burstTime"
                      type="number"
                      min="1"
                      max="50"
                      value={newProcessBurst}
                      onChange={(e) => setNewProcessBurst(parseInt(e.target.value) || 1)}
                      onKeyPress={handleKeyPress}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="arrivalTime">Arrival Time (ms)</Label>
                    <Input
                      id="arrivalTime"
                      type="number"
                      min="0"
                      max="100"
                      value={newProcessArrival}
                      onChange={(e) => setNewProcessArrival(parseInt(e.target.value) || 0)}
                      onKeyPress={handleKeyPress}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button onClick={addProcess} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Process
                </Button>

                <div className="border-t pt-4">
                  <Label htmlFor="quantumTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Quantum Time (ms)
                  </Label>
                  <Input
                    id="quantumTime"
                    type="number"
                    min="1"
                    max="10"
                    value={quantumTime}
                    onChange={(e) => setQuantumTime(parseInt(e.target.value) || 1)}
                    disabled={isQuantumSet}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {isQuantumSet 
                      ? "Quantum time is locked after adding first process" 
                      : "Time slice for each process before context switch"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Process List */}
            <Card className="shadow-process">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Process Queue ({processes.length}/{maxProcesses || 0})</span>
                  {processes.length > 0 && (
                    <Button onClick={startSimulation} className="gap-2">
                      <Play className="h-4 w-4" />
                      Start Simulation
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processes.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No processes added yet. Add your first process to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {processes.map((process, index) => (
                      <div
                        key={process.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card/50 animate-process-enter"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className={`h-4 w-4 rounded-full bg-${process.color}`}
                            style={{ backgroundColor: `hsl(var(--${process.color}))` }}
                          />
                          <div>
                            <p className="font-semibold">{process.id} (PID: {process.pid})</p>
                            <p className="text-sm text-muted-foreground">{process.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{process.burstTime}ms / {process.arrivalTime}ms</p>
                            <p className="text-xs text-muted-foreground">Burst / Arrival</p>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeProcess(process.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {processes.length > 0 && (
                      <div className="pt-4 border-t">
                        <Button onClick={startSimulation} className="w-full gap-2 shadow-process">
                          <Play className="h-4 w-4" />
                          Start Round Robin Simulation
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          )}

          {/* Quick Info */}
          <Card className="mt-8 shadow-process">
            <CardHeader>
              <CardTitle>Round Robin Algorithm Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">How it Works</h4>
                  <p className="text-muted-foreground">
                    Each process gets equal CPU time (quantum). After quantum expires, 
                    the process moves to the back of the ready queue.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Context Switching</h4>
                  <p className="text-muted-foreground">
                    When a process is preempted or completes, the CPU switches to 
                    the next process in the ready queue.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Fair Scheduling</h4>
                  <p className="text-muted-foreground">
                    All processes get equal opportunity to execute, preventing 
                    starvation and ensuring fair CPU time distribution.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProcessInput;