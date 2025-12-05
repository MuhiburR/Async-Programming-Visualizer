import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';

const SPEED_FACTOR = 0.35; // Global speed multiplier – lower = slower animations

const AsyncRoadVisualization = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lanes, setLanes] = useState([]);
  const [selectedExample, setSelectedExample] = useState('basic');
  const [showCode, setShowCode] = useState(true);
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
            { id: 1, label: 'Start', pos: 0, speed: 0.5, type: 'normal' },
            { id: 2, label: 'await fetchData()', pos: 0, speed: 0.5, type: 'await', targetLane: 2, startDelay: 15 },
            { id: 3, label: 'End', pos: 0, speed: 0.5, type: 'normal', startDelay: 80 }
          ]
        },
        {
          id: 2,
          name: 'fetchData()',
          color: 'bg-green-500',
          cars: [
            { id: 4, label: 'delay(2000)', pos: 0, speed: 0.3, type: 'async', startDelay: 20 },
            { id: 5, label: 'return', pos: 0, speed: 0.5, type: 'normal', startDelay: 70 }
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
            { id: 1, label: 'fetchUser()', pos: 0, speed: 0.5, type: 'spawn', targetLane: 2 },
            { id: 2, label: 'fetchPosts()', pos: 0, speed: 0.5, type: 'spawn', targetLane: 3, startDelay: 10 },
            { id: 3, label: 'fetchComments()', pos: 0, speed: 0.5, type: 'spawn', targetLane: 4, startDelay: 20 },
            { id: 4, label: 'Promise.all', pos: 0, speed: 0.5, type: 'await', startDelay: 30 },
            { id: 5, label: 'All done!', pos: 0, speed: 0.5, type: 'normal', startDelay: 90 }
          ]
        },
        {
          id: 2,
          name: 'fetchUser()',
          color: 'bg-green-500',
          cars: [
            { id: 6, label: 'API Call', pos: 0, speed: 0.4, type: 'async', startDelay: 5 },
            { id: 7, label: 'return', pos: 0, speed: 0.5, type: 'normal', startDelay: 50 }
          ]
        },
        {
          id: 3,
          name: 'fetchPosts()',
          color: 'bg-purple-500',
          cars: [
            { id: 8, label: 'API Call', pos: 0, speed: 0.35, type: 'async', startDelay: 15 },
            { id: 9, label: 'return', pos: 0, speed: 0.5, type: 'normal', startDelay: 70 }
          ]
        },
        {
          id: 4,
          name: 'fetchComments()',
          color: 'bg-orange-500',
          cars: [
            { id: 10, label: 'API Call', pos: 0, speed: 0.3, type: 'async', startDelay: 25 },
            { id: 11, label: 'return', pos: 0, speed: 0.5, type: 'normal', startDelay: 85 }
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
            { id: 1, label: 'await fetchUser()', pos: 0, speed: 0.5, type: 'await' },
            { id: 2, label: 'await fetchPosts()', pos: 0, speed: 0.5, type: 'await', startDelay: 40 },
            { id: 3, label: 'await fetchComments()', pos: 0, speed: 0.5, type: 'await', startDelay: 80 }
          ]
        },
        {
          id: 2,
          name: 'parallel() - All at once!',
          color: 'bg-green-500',
          cars: [
            { id: 4, label: 'fetchUser()', pos: 0, speed: 0.5, type: 'normal' },
            { id: 5, label: 'fetchPosts()', pos: 0, speed: 0.5, type: 'normal', startDelay: 5 },
            { id: 6, label: 'fetchComments()', pos: 0, speed: 0.5, type: 'normal', startDelay: 10 },
            { id: 7, label: 'Promise.all', pos: 0, speed: 0.5, type: 'await', startDelay: 15 }
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

  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        timeRef.current += 1;

        setLanes((prevLanes) => {
          const newLanes = prevLanes.map((lane) => ({
            ...lane,
            cars: lane.cars.map((car) => {
              // Handle delayed start (spawn/fade-in)
              if (car.startDelay && timeRef.current < car.startDelay) {
                return { ...car, visible: false };
              }

              if (car.pos >= 100) {
                return { ...car, visible: true };
              }

              return {
                ...car,
                visible: true,
                pos: Math.min(car.pos + car.speed * SPEED_FACTOR, 100),
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
  }, [isRunning]);

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

  // Extra visual flair depending on car type
  const getCarStyles = (type) => {
    switch (type) {
      case 'await':
        // highlight awaits with a subtle glow
        return 'drop-shadow-[0_0_6px_rgba(255,230,0,0.7)]';
      case 'async':
        // async operations pulse
        return 'animate-pulse';
      case 'spawn':
        // spawns bounce a bit
        return 'animate-bounce';
      default:
        return '';
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 overflow-auto">
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
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
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
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Road Visualization */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ChevronRight className="text-blue-400" />
              Execution Flow
            </h2>

            <div className="space-y-4">
              {lanes.map((lane) => (
                <div key={lane.id} className="relative">
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
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            {car.label}
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
            lane completes. This mimics how JavaScript's event loop manages asynchronous code execution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AsyncRoadVisualization;
