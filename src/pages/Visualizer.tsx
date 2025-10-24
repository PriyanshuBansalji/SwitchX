import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Clock, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import switchxLogo from "@/assets/switchx-logo.png";

interface Process {
  id: string;
  pid: number;
  name: string;
  burstTime: number;
  remainingTime: number;
  arrivalTime: number;
  completionTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
  color: string;
  state: 'waiting' | 'ready' | 'running' | 'completed';
}

interface GanttEntry {
  processId: string;
  pid: number;
  color: string;
  startTime: number;
  endTime: number;
}

const Visualizer = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [quantumTime, setQuantumTime] = useState<number>(2);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentQuantum, setCurrentQuantum] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [ganttChart, setGanttChart] = useState<GanttEntry[]>([]);
  const [readyQueue, setReadyQueue] = useState<Process[]>([]);
  const [waitingProcesses, setWaitingProcesses] = useState<Process[]>([]);
  const [runningProcess, setRunningProcess] = useState<Process | null>(null);
  const [completedProcesses, setCompletedProcesses] = useState<Process[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize simulation data
  useEffect(() => {
    const storedProcesses = sessionStorage.getItem('processes');
    const storedQuantum = sessionStorage.getItem('quantumTime');
    
    if (!storedProcesses || !storedQuantum) {
      toast({
        title: "No Simulation Data",
        description: "Please configure processes first",
        variant: "destructive",
      });
      navigate('/input');
      return;
    }

    const parsedProcesses: Process[] = JSON.parse(storedProcesses)
      .sort((a: any, b: any) => a.arrivalTime - b.arrivalTime) // Sort by arrival time
      .map((p: any, index: number) => ({
        ...p,
        pid: p.pid, // Assign PID starting from 1001
        remainingTime: p.burstTime,
        state: 'waiting'
      }));
    
    setProcesses(parsedProcesses);
    setWaitingProcesses([...parsedProcesses]);
    setQuantumTime(parseInt(storedQuantum));
    setCurrentQuantum(0);
  }, [navigate, toast]);

  // Round Robin simulation step
  const simulationStep = useCallback(() => {
    setProcesses(currentProcesses => {
      const updatedProcesses = [...currentProcesses];

      // 1. Move arrived processes from waiting to ready queue BEFORE incrementing time
      const arrivedProcesses = waitingProcesses.filter(p => p.arrivalTime <= currentTime);
      if (arrivedProcesses.length > 0) {
        arrivedProcesses.forEach(p => {
          const processIndex = updatedProcesses.findIndex(proc => proc.id === p.id);
          if (processIndex !== -1) {
            updatedProcesses[processIndex].state = 'ready';
          }
        });
        setReadyQueue(prev => [...prev, ...arrivedProcesses]);
        setWaitingProcesses(prev => prev.filter(p => p.arrivalTime > currentTime));
      }

      // 2. If no running process and ready queue has processes, start next process immediately
      if (!runningProcess && (readyQueue.length > 0 || arrivedProcesses.length > 0)) {
        // Use arrivedProcesses if readyQueue is empty
        const nextProcess = readyQueue.length > 0 ? readyQueue[0] : arrivedProcesses[0];
        setRunningProcess(nextProcess);
        setReadyQueue(prev => {
          if (readyQueue.length > 0) {
            return prev.slice(1);
          } else {
            // Remove the just-started process from arrivedProcesses
            return prev.filter(p => p.id !== nextProcess.id);
          }
        });
        setCurrentQuantum(quantumTime);

        const processIndex = updatedProcesses.findIndex(p => p.id === nextProcess.id);
        if (processIndex !== -1) {
          updatedProcesses[processIndex].state = 'running';
        }
        // Do NOT return here, continue to process runningProcess below
      }

      // 3. Execute running process or idle
      if (runningProcess) {
        const processIndex = updatedProcesses.findIndex(p => p.id === runningProcess.id);
        if (processIndex !== -1) {
          updatedProcesses[processIndex].remainingTime -= 1;
          // Update Gantt chart (continuous, including idle)
          setGanttChart(prev => {
            const last = prev[prev.length - 1];
            if (last && last.processId === runningProcess.id) {
              // Extend current entry
              return [
                ...prev.slice(0, -1),
                { ...last, endTime: currentTime + 1 }
              ];
            } else {
              // Add new entry for this process
              return [
                ...prev,
                {
                  processId: runningProcess.id,
                  pid: runningProcess.pid,
                  color: runningProcess.color,
                  startTime: currentTime,
                  endTime: currentTime + 1
                }
              ];
            }
          });

          // Check if process completed
          if (updatedProcesses[processIndex].remainingTime === 0) {
            updatedProcesses[processIndex].state = 'completed';
            updatedProcesses[processIndex].completionTime = currentTime + 1;
            updatedProcesses[processIndex].turnaroundTime = 
              (currentTime + 1) - updatedProcesses[processIndex].arrivalTime;
            updatedProcesses[processIndex].waitingTime = 
              updatedProcesses[processIndex].turnaroundTime! - updatedProcesses[processIndex].burstTime;

            setCompletedProcesses(prev => [...prev, updatedProcesses[processIndex]]);
            setRunningProcess(null);
            setCurrentQuantum(0);
          } else if (currentQuantum === 1) {
            // Quantum expired, move back to ready queue
            updatedProcesses[processIndex].state = 'ready';
            setReadyQueue(prev => [...prev, updatedProcesses[processIndex]]);
            setRunningProcess(null);
            setCurrentQuantum(0);
          } else {
            setCurrentQuantum(prev => prev - 1);
          }

        }
      } else {
        // No process running: add idle to Gantt chart
        setGanttChart(prev => {
          const last = prev[prev.length - 1];
          if (last && last.processId === 'IDLE') {
            // Extend idle
            return [
              ...prev.slice(0, -1),
              { ...last, endTime: currentTime + 1 }
            ];
          } else {
            // New idle entry
            return [
              ...prev,
              {
                processId: 'IDLE',
                pid: -1,
                color: 'gray',
                startTime: currentTime,
                endTime: currentTime + 1
              }
            ];
          }
        });
      }

      return updatedProcesses;
    });

    setCurrentTime(prev => prev + 1);
  }, [runningProcess, readyQueue, waitingProcesses, currentQuantum, quantumTime, currentTime]);

  // Check completion
  useEffect(() => {
    if (processes.length > 0 && processes.every(p => p.state === 'completed')) {
      setIsCompleted(true);
      setIsRunning(false);
    }
  }, [processes]);

  // Animation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isCompleted) {
      interval = setInterval(simulationStep, 800);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isCompleted, simulationStep]);

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setCurrentTime(0);
    setCurrentQuantum(0);
    setGanttChart([]);
    setRunningProcess(null);
    setCompletedProcesses([]);
    
    const resetProcesses = processes.map(p => ({
      ...p,
      remainingTime: p.burstTime,
      state: 'waiting' as const,
      completionTime: undefined,
      waitingTime: undefined,
      turnaroundTime: undefined,
    }));
    
    setProcesses(resetProcesses);
    setWaitingProcesses([...resetProcesses]);
    setReadyQueue([]);
  };

  const averageWaitingTime = completedProcesses.length > 0 
    ? completedProcesses.reduce((sum, p) => sum + (p.waitingTime || 0), 0) / completedProcesses.length 
    : 0;

  const averageTurnaroundTime = completedProcesses.length > 0
    ? completedProcesses.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0) / completedProcesses.length
    : 0;

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
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Time: {currentTime}ms | Quantum: {quantumTime}ms
              </span>
              <Link to="/input">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Input
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Control Panel */}
        <Card className="mb-8 shadow-process">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                Round Robin Simulation Control
              </span>
              <div className="flex gap-2">
                <Button 
                  onClick={toggleSimulation} 
                  disabled={isCompleted}
                  className="gap-2"
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      {isCompleted ? 'Completed' : 'Start'}
                    </>
                  )}
                </Button>
                <Button onClick={resetSimulation} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{currentTime}ms</p>
                <p className="text-sm text-muted-foreground">Current Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-queue-running">{currentQuantum}</p>
                <p className="text-sm text-muted-foreground">Quantum Left</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-queue-completed">{completedProcesses.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{waitingProcesses.length}</p>
                <p className="text-sm text-muted-foreground">Waiting</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Process Queues */}
        <div className="grid gap-8 mb-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Waiting Processes */}
            <Card className="shadow-process">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Waiting for Arrival ({waitingProcesses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {waitingProcesses.map((process, index) => (
                    <div 
                      key={`${process.id}-waiting-${index}`}
                      className="p-3 rounded-lg border-2 border-muted/20 bg-muted/10 animate-queue-transition"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className={`h-3 w-3 rounded-full bg-${process.color}`}
                          style={{ backgroundColor: `hsl(var(--${process.color}))` }}
                        />
                        <span className="font-semibold">{process.id}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        PID: {process.pid}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Arrives at {process.arrivalTime}ms
                      </p>
                    </div>
                  ))}
                  {waitingProcesses.length === 0 && (
                    <p className="text-muted-foreground text-center py-4 w-full">
                      All processes have arrived
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ready Queue */}
            <Card className="shadow-process">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-queue-ready" />
                  Ready Queue ({readyQueue.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {readyQueue.map((process, index) => (
                    <div 
                      key={`${process.id}-${index}`}
                      className="p-3 rounded-lg border-2 border-queue-ready/20 bg-queue-ready/10 animate-queue-transition"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className={`h-3 w-3 rounded-full bg-${process.color}`}
                          style={{ backgroundColor: `hsl(var(--${process.color}))` }}
                        />
                        <span className="font-semibold">{process.id}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        PID: {process.pid}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {process.remainingTime}ms left
                      </p>
                    </div>
                  ))}
                  {readyQueue.length === 0 && (
                    <p className="text-muted-foreground text-center py-4 w-full">
                      No processes in ready queue
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Running Process */}
            <Card className="shadow-process">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-queue-running" />
                  Running Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                {runningProcess ? (
                  <div className="p-4 rounded-lg border-2 border-queue-running/20 bg-queue-running/10 animate-pulse-glow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`h-4 w-4 rounded-full bg-${runningProcess.color}`}
                          style={{ backgroundColor: `hsl(var(--${runningProcess.color}))` }}
                        />
                        <div>
                          <p className="font-semibold">{runningProcess.id}</p>
                          <p className="text-sm text-muted-foreground">PID: {runningProcess.pid}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{runningProcess.remainingTime}ms</p>
                        <p className="text-xs text-muted-foreground">Remaining</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Quantum Progress</span>
                        <span>{quantumTime - currentQuantum + 1}/{quantumTime}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-queue-running h-2 rounded-full transition-all duration-200"
                          style={{ width: `${((quantumTime - currentQuantum + 1) / quantumTime) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No process currently running
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Completed Queue */}
          <Card className="shadow-process">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-queue-completed" />
                Completed Processes ({completedProcesses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedProcesses.map((process) => (
                  <div 
                    key={process.id}
                    className="p-3 rounded-lg border-2 border-queue-completed/20 bg-queue-completed/10 animate-process-enter"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`h-3 w-3 rounded-full bg-${process.color}`}
                          style={{ backgroundColor: `hsl(var(--${process.color}))` }}
                        />
                        <span className="font-semibold">{process.id}</span>
                      </div>
                      <div className="text-right text-xs">
                        <p>WT: {process.waitingTime}ms</p>
                        <p>TAT: {process.turnaroundTime}ms</p>
                      </div>
                    </div>
                  </div>
                ))}
                {completedProcesses.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No completed processes yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gantt Chart */}
        <Card className="shadow-process mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gantt Chart (Block View)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ganttChart.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-12 text-xs font-medium">{entry.processId}</div>
                  <div className="w-12 text-xs text-muted-foreground">PID:{entry.pid}</div>
                  <div className="flex-1 bg-muted rounded h-6 relative overflow-hidden">
                    <div 
                      className={`h-full bg-${entry.color} animate-gantt-fill flex items-center justify-center`}
                      style={{ 
                        backgroundColor: `hsl(var(--${entry.color}))`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {entry.endTime - entry.startTime}ms
                      </span>
                    </div>
                  </div>
                  <div className="w-16 text-xs text-muted-foreground text-right">
                    {entry.startTime}-{entry.endTime}
                  </div>
                </div>
              ))}
              {ganttChart.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Gantt chart will appear when simulation starts
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline View */}
        <Card className="shadow-process mb-8">
          <CardHeader>
            <CardTitle>Timeline View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-8">Time:</span>
                {Array.from({ length: Math.max(20, currentTime + 5) }, (_, i) => (
                  <span key={i} className="w-8 text-center text-xs border-r border-border">
                    {i}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 text-sm">CPU:</span>
                {Array.from({ length: Math.max(20, currentTime + 5) }, (_, i) => {
                  const entry = ganttChart.find(g => g.startTime <= i && g.endTime > i);
                  return (
                    <div 
                      key={i} 
                      className="w-8 h-8 border-r border-border flex items-center justify-center text-xs font-medium"
                      style={{ 
                        backgroundColor: entry ? `hsl(var(--${entry.color}))` : 'transparent',
                        color: entry ? 'white' : 'inherit'
                      }}
                    >
                      {entry ? entry.processId.replace('P', '') : '-'}
                    </div>
                  );
                })}
              </div>
              {ganttChart.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Timeline will appear when simulation starts
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {isCompleted && (
          <Card className="shadow-process">
            <CardHeader>
              <CardTitle>Performance Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-accent">{averageWaitingTime.toFixed(1)}ms</p>
                  <p className="text-sm text-muted-foreground">Average Waiting Time</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{averageTurnaroundTime.toFixed(1)}ms</p>
                  <p className="text-sm text-muted-foreground">Average Turnaround Time</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-queue-completed">{currentTime}ms</p>
                  <p className="text-sm text-muted-foreground">Total Execution Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Visualizer;