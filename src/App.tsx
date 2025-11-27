import { useEffect } from "react";
import Controls from "./components/Controls";
import EdgeList from "./components/EdgeList";
import GraphCanvas from "./components/GraphCanvas";
import { useKruskal, useAutoPlay } from "./hooks/useKruskal";

export default function App() {
  const { actions } = useKruskal();
  useAutoPlay();

  useEffect(() => {
    // Initialize once on mount using stable store read
    useKruskal.getState().actions.generate(10, 0.3);
  }, []);

  return (
    <div className="min-h-screen">
      <Controls />
      <main className="flex gap-3 p-3">
        <GraphCanvas />
        <EdgeList />
      </main>
      <footer className="px-3 py-2 text-xs text-gray-600">
        Drag sliders and click "Generate Graph" to start. Use "Prev", "Step", or "Play" to visualize Kruskal’s algorithm.
      </footer>
    </div>
  );
}