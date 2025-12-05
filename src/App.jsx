import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, SkipForward, Gauge } from 'lucide-react';

const AsyncRoadVisualization = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lanes, setLanes] = useState([]);
  const [selectedExample, setSelectedExample] = useState('basic');
  const [speedFactor, setSpeedFactor] = useState(0.35);
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  const examples = {
    basic: {
      name: 'Basic Async/Await',
      code: `async function main() {
  console.log('Start');
  await fetchData();
  console.log('End');
}

async function fetchData() {
  // Simulates API call
  await delay(2000);
  return 'data';
}`,
      lanes: [
        {
          id: 1,
          name: 'main()',
          color: 'bg-blue-500',
          cars: [
            { id: 1, label: 'Start', pos: 0, speed: 0.5, type: 'normal', step: 1, codeLine: 2 },
            { id: 2, label: 'await fetchData()', pos: 0, speed: 0.5, type: 'await', targetLane: 2, startDelay: 15, step: 2, codeLine: 3, returnsTo: 1 },
            { id: 3, label: 'End', pos: 0, speed: 0.5, type: 'normal', startDelay: 80, step: 4, codeLine: 4 }
          ]
        },
        {
          id: 2,
          name: 'fetchData()',
          color: 'bg-green-500',
          cars: [
            { id: 4, label: 'delay(2000)', pos: 0, speed: 0.3, type: 'async', startDelay: 20, step: 3, codeLine: 9 },
            { id: 5, label: 'return', pos: 0, speed: 0.5, type: 'normal', startDelay: 70, step: 3, codeLine: 10, returnsTo: 1 }
          ]
        }
      ]
    },
    parallel: {
      name: 'Parallel Execution',
      code: `async function main() {
  const p1 = fetchUser();
  const p2 = fetchPosts();
  const p3 = fetchComments();
  
  await Promise.all([p1, p2, p3]);
  console.log('All done!');
}`,
      lanes: [
        {
          id: 1,
          name: 'main()',
          color: 'bg-blue-500',
          cars: [
            { id: 1, label: 'fetchUser()', pos: 0, speed: 0.5, type: 'spawn', targetLane: 2, step: 1, codeLine: 2 },
            { id: 2, label: 'fetchPosts()', pos: 0, speed: 0.5, type: 'spawn', targetLane: 3, startDelay: 10, step: 2, codeLine: 3 },
            { id: 3, label: 'fetchComments()', pos: 0, speed: 0.5, type: 'spawn', targetLane: 4, startDelay: 20, step: 3, codeLine: 4 },
            { id: 4, label: 'Promise.all', pos: 0, speed: 0.5, type: 'await', startDelay: 30, step: 4, codeLine: 6 },
            { id: 5, label: 'All done!', pos: 0, speed: 0.5, type: 'normal', startDelay: 90, step: 5, codeLine: 7 }
          ]
        },
        {
          id: 2,
          name: 'fetchUser()',
          color: 'bg-green-500',
          cars: [
            { id: 6, label: 'API Call', pos: 0, speed: 0.4, type: 'async', startDelay: 5, step: 1, returnsTo: 1 },
            { id: 7, label: 'return', pos: 0, speed: 0.5, type: 'normal', startDelay: 50, step: 1, returnsTo: 1 }
          ]
        },
        {
          id: 3,
          name: 'fetchPosts()',
          color: 'bg-purple-500',
          cars: [
            { id: 8, label: 'API Call', pos: 0, speed: 0.35, type: 'async', startDelay: 15, step: 2, returnsTo: 1 },
            { id: 9, label: 'return', pos: 0, speed: 0.5, type: 'normal', startDelay: 70, step: 2, returnsTo: 1 }
          ]
        },
        {
          id: 4,
          name: 'fetchComments()',
          color: 'bg-orange-500',
          cars: [
            { id: 10, label: 'API Call', pos: 0, speed: 0.3, type: 'async', startDelay: 25, step: 3, returnsTo: 1 },
            { id: 11, label: 'return', pos: 0, speed: 0.5, type: 'normal', startDelay: 85, step: 3, returnsTo: 1 }
          ]
        }
      ]
    },
    sequential: {
      name: 'Sequential vs Parallel',
      code: `// Sequential (slower)
async function sequential() {
  const user = await fetchUser();
  const posts = await fetchPosts();
  const comments = await fetchComments();
}

// Parallel (faster)
async function parallel() {
  const [user, posts, comments] = 
    await Promise.all([
      fetchUser(),
      fetchPosts(),
      fetchComments()
    ]);
}`,
      lanes: [
        {
          id: 1,
          name: 'sequential()',
          color: 'bg-red-500',
          cars: [
            { id: 1, label: 'await fetchUser()', pos: 0, speed: 0.5, type: 'await', step: 1, codeLine: 3 },
            { id: 2, label: 'await fetchPosts()', pos: 0, speed: 0.5, type: 'await', startDelay: 40, step: 2, codeLine: 4 },
            { id: 3, label: 'await fetchComments()', pos: 0, speed: 0.5, type: 'await', startDelay: 80, step: 3, codeLine: 5 }
          ]
        },
        {
          id: 2,
          name: 'parallel() - All at once!',
          color: 'bg-green-500',
          cars: [
            { id: 4, label: 'fetchUser()', pos: 0, speed: 0.5, type: 'normal', step: 1, codeLine: 12 },
            { id: 5, label: 'fetchPosts()', pos: 0, speed: 0.5, type: 'normal', startDelay: 5, step: 1, codeLine: 13 },
            { id: 6, label: 'fetchComments()', pos: 0, speed: 0.5, type: 'normal', startDelay: 10, step: 1, codeLine: 14 },
            { id: 7, label: 'Promise.all', pos: 0, speed: 0.5, type: 'await', startDelay: 15, step: 2, codeLine: 11 }
          ]
        }
      ]
    }
  };

  useEffect(() => {
    reset();
  }, [selectedExample]);

  const reset = () => {
    setIsRunning(false);
    timeRef.current = 0;
    setCurrentStep(0);
    const example = examples[selectedExample];
    setLanes(
      example.lanes.map((lane) => ({
        ...lane,
        cars: lane.cars.map((car) => ({
          ...car,
          pos: 0,
          visible: car.startDelay ? false : true,
        })),
      }))
    );
  };

  const nextStep = () => {
    if (stepByStepMode) {
      setCurrentStep(prev => prev + 1);
      // Advance time to trigger next car
      timeRef.current += 20;
    }
  };

  useEffect(() => {
    if (isRunning && !stepByStepMode) {
      const animate = () => {
        timeRef.current += 1;

        setLanes((prevLanes) => {
          const newLanes = prevLanes.map((lane) => ({
            ...lane,
            cars: lane.cars.map((car) => {
              if (car.startDelay && timeRef.current < car.startDelay) {
                return { ...car, visible: false };
              }

              if (car.pos >= 100) {
                return { ...car, visible: true };
              }

              return {
                ...car,
                visible: true,
                pos: Math.min(car.pos + car.speed * speedFactor, 100),
              };
            }),
          }));

          return newLanes;
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, speedFactor, stepByStepMode]);

  // Step-by-step mode logic
  useEffect(() => {
    if (stepByStepMode && currentStep > 0) {
      setLanes((prevLanes) => {
        return prevLanes.map((lane) => ({
          ...lane,
          cars: lane.cars.map((car) => {
            if (car.step <= currentStep) {
              return {
                ...car,
                visible: true,
                pos: car.step === currentStep ? Math.min(car.pos + 5, 100) : 100,
              };
            }
            return car;
          }),
        }));
      });
    }
  }, [currentStep, stepByStepMode]);

  const getCarIcon = (type) => {
    switch (type) {
      case 'await':
        return '🚦';
      case 'async':
        return '⏳';
      case 'spawn':
        return '🔀';
      default:
        return '🚗';
    }
  };

  const getCarStyles = (type) => {
    switch (type) {
      case 'await':
        return 'drop-shadow-[0_0_6px_rgba(255,230,0,0.7)]';
      case 'async':
        return 'animate-pulse';
      case 'spawn':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  // Get currently executing car
  const getCurrentlyExecuting = () => {
    const allCars = lanes.flatMap(lane => 
      lane.cars.map(car => ({ ...car, laneId: lane.id, laneName: lane.name }))
    );
    return allCars.filter(car => car.visible && car.pos > 0 && car.pos < 100);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Async Programming Visualizer
          </h1>
          <p className="text-slate-400">Watch how asynchronous code executes like cars on a highway</p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
          <div className="flex flex-col gap-4">
            {/* Main controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  onClick={() => {
                    setIsRunning(!isRunning);
                    if (stepByStepMode) setStepByStepMode(false);
                  }}
                  disabled={stepByStepMode}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition"
                >
                  {isRunning ? <Pause size={20} /> : <Play size={20} />}
                  {isRunning ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
                <button
                  onClick={() => {
                    setStepByStepMode(!stepByStepMode);
                    setIsRunning(false);
                    if (!stepByStepMode) setCurrentStep(0);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    stepByStepMode
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <SkipForward size={20} />
                  {stepByStepMode ? 'Exit Step Mode' : 'Step-by-Step'}
                </button>
                {stepByStepMode && (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  >
                    Next Step →
                  </button>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {Object.entries(examples).map(([key, ex]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedExample(key)}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedExample === key
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed control */}
            {!stepByStepMode && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Gauge size={20} className="text-slate-400" />
                  <span className="text-sm text-slate-400">Speed:</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={speedFactor}
                  onChange={(e) => setSpeedFactor(parseFloat(e.target.value))}
                  className="flex-1 max-w-xs h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-sm text-slate-300 min-w-[3rem]">
                  {(speedFactor * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        {getCurrentlyExecuting().length > 0 && (
          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-amber-400 font-semibold">⚡ Currently Executing:</span>
              <div className="flex gap-3 flex-wrap">
                {getCurrentlyExecuting().map((car, idx) => (
                  <span key={idx} className="text-amber-200">
                    {car.laneName}: <span className="font-mono">{car.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Road Visualization */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ChevronRight className="text-blue-400" />
              Execution Flow
            </h2>

            <div className="space-y-4 relative">
              {/* Return arrows SVG overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {lanes.flatMap((lane, laneIdx) =>
                  lane.cars
                    .filter(car => car.returnsTo && car.visible && car.pos > 80)
                    .map((car, carIdx) => {
                      const fromLane = laneIdx;
                      const toLane = lanes.findIndex(l => l.id === car.returnsTo);
                      if (toLane === -1) return null;
                      
                      const y1 = (fromLane * 88) + 70;
                      const y2 = (toLane * 88) + 70;
                      const x1 = car.pos * 4.5;
                      const x2 = 450;
                      
                      return (
                        <g key={`${lane.id}-${car.id}`}>
                          <defs>
                            <marker
                              id={`arrowhead-${lane.id}-${car.id}`}
                              markerWidth="10"
                              markerHeight="7"
                              refX="9"
                              refY="3.5"
                              orient="auto"
                            >
                              <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                            </marker>
                          </defs>
                          <path
                            d={`M ${x1} ${y1} Q ${x2} ${y1}, ${x2} ${y2}`}
                            stroke="#10b981"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="5,5"
                            markerEnd={`url(#arrowhead-${lane.id}-${car.id})`}
                            opacity="0.5"
                          />
                        </g>
                      );
                    })
                )}
              </svg>

              {lanes.map((lane) => (
                <div key={lane.id} className="relative" style={{ zIndex: 1 }}>
                  {/* Lane Label */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${lane.color}`}></div>
                    <span className="text-sm font-mono text-slate-300">{lane.name}</span>
                  </div>

                  {/* Road */}
                  <div className="relative h-16 bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-600">
                    {/* Road markings */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-0.5 border-t-2 border-dashed border-slate-500"></div>
                    </div>

                    {/* Cars */}
                    {lane.cars.map((car) => (
                      <div
                        key={car.id}
                        className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-linear ${
                          car.visible ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ left: `${car.pos}%` }}
                      >
                        <div className="relative group">
                          <div
                            className={`text-2xl transition-transform duration-500 group-hover:scale-125 ${getCarStyles(
                              car.type
                            )}`}
                          >
                            {getCarIcon(car.type)}
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 border border-slate-700">
                            {car.label}
                            {car.codeLine && <div className="text-slate-500">Line {car.codeLine}</div>}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Finish line */}
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-green-600"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <h3 className="text-sm font-semibold mb-2 text-slate-400">Legend</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚗</span>
                  <span className="text-slate-300">Normal execution</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚦</span>
                  <span className="text-slate-300">Await (waiting)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏳</span>
                  <span className="text-slate-300">Async operation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔀</span>
                  <span className="text-slate-300">Spawns new task</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-0.5 border-t-2 border-dashed border-green-500"></div>
                  <span className="text-slate-300">Return value path</span>
                </div>
              </div>
            </div>
          </div>

          {/* Code Display */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ChevronRight className="text-purple-400" />
              Code Example
            </h2>

            <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm border border-slate-700">
              <code className="text-green-400 font-mono">
                {examples[selectedExample].code}
              </code>
            </pre>

            {/* Explanation */}
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <h3 className="font-semibold text-base text-white">How it works:</h3>

              {selectedExample === 'basic' && (
                <>
                  <p>
                    • The <code className="text-blue-400">main()</code> function starts execution in the first lane
                  </p>
                  <p>
                    • When it hits <code className="text-blue-400">await fetchData()</code>, it spawns a new lane for
                    that async function
                  </p>
                  <p>• The main function waits (🚦) until fetchData() completes</p>
                  <p>• Once the async operation finishes, execution continues in main()</p>
                  <p>• Watch the green dashed arrow showing the return value flowing back!</p>
                </>
              )}

              {selectedExample === 'parallel' && (
                <>
                  <p>• Multiple async functions are started at nearly the same time</p>
                  <p>• Each function runs in its own "lane" independently</p>
                  <p>
                    • <code className="text-blue-400">Promise.all()</code> waits for all of them to complete
                  </p>
                  <p>• This is much faster than running them one after another!</p>
                  <p>• Use the speed slider to slow down and see parallel execution clearly</p>
                </>
              )}

              {selectedExample === 'sequential' && (
                <>
                  <p>
                    • <span className="text-red-400">Sequential</span>: Each await waits for the previous one to finish
                    (slower)
                  </p>
                  <p>
                    • <span className="text-green-400">Parallel</span>: All operations start immediately (faster)
                  </p>
                  <p>• Watch how parallel execution finishes much quicker!</p>
                  <p>• Use parallel when operations don't depend on each other</p>
                  <p>• Try step-by-step mode to see exactly when each operation executes</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700 text-sm text-slate-400">
          <p className="font-semibold text-white mb-2">Understanding the Visualization:</p>
          <p>
            Each horizontal "lane" represents an execution context (function). Cars are individual operations moving
            through code. When you see an "await", the car stops at a traffic light until the async operation in another
            lane completes. Green dashed arrows show return values flowing back to calling functions. This mimics how JavaScript's event loop manages asynchronous code execution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AsyncRoadVisualization;