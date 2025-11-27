import { useKruskal } from "../hooks/useKruskal";
import { useState } from "react";
import GraphBuilderDialog from "./GraphBuilderDialog";

export default function Controls() {
  const { sortedIdx, graph, totalWeight, playing, speed, actions } = useKruskal();
  const [nodes, setNodes] = useState(10);
  const [prob, setProb] = useState(0.3);

  return (
    <section className="flex flex-wrap items-center gap-4 p-3 bg-white border-b border-gray-200">
      <h1 className="text-lg font-semibold text-gray-800">Kruskal's Algorithm Visualizer</h1>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-700">Nodes</label>
        <input
          type="number"
          min={3}
          max={30}
          value={nodes}
          onChange={(e) => setNodes(Math.max(3, Math.min(30, Number(e.target.value))))}
          className="w-20 border rounded px-2 py-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-700">Edge prob</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={prob}
          onChange={(e) => setProb(Number(e.target.value))}
        />
        <span className="text-sm text-gray-600">{prob.toFixed(2)}</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-700">Speed</label>
        <input
          type="range"
          min={0.1}
          max={2.0}
          step={0.1}
          value={speed}
          onChange={(e) => actions.setSpeed(Number(e.target.value))}
        />
        <span className="text-sm text-gray-600">{speed.toFixed(1)}x</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => actions.generate(nodes, prob)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
        >
          Generate Graph
        </button>
        {/* NEW: Shadcn button + dialog trigger */}
        <GraphBuilderDialog />
        <button
          onClick={() => actions.stepPrev()}
          className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded"
        >
          Prev
        </button>
        <button
          onClick={() => actions.stepNext()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
        >
          Step
        </button>
        <button
          onClick={() => actions.togglePlay()}
          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => actions.resetRun()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
        >
          Reset
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-700">
        <div>Current Edge: {sortedIdx < graph.edges.length ? `${graph.edges[sortedIdx].u}–${graph.edges[sortedIdx].v} (w=${graph.edges[sortedIdx].w})` : "-"}</div>
        <div>Total MST Weight: {totalWeight}</div>
        <div>Edges Considered: {sortedIdx}/{graph.edges.length}</div>
      </div>
    </section>
  );
}