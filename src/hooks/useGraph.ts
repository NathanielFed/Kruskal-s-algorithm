import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from "d3";
import type { Edge, Graph, Node } from "../types";

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function generateRandomGraph(n: number, p: number, width = 800, height = 500): Graph {
  const nodes: Node[] = Array.from({ length: n }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height
  }));

  const rawEdges: Edge[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.random() <= p) {
        rawEdges.push({
          id: rawEdges.length,
          u: i,
          v: j,
          w: randInt(1, 20),
          state: null
        });
      }
    }
  }

  // Use D3-force to spread nodes out with simple physics
  const sim = forceSimulation(nodes as any)
    .force("charge", forceManyBody().strength(-80))
    .force("center", forceCenter(width / 2, height / 2))
    .force("collision", forceCollide(18))
    .force(
      "link",
      // Cast links to any to satisfy D3's complex generics and avoid TS errors
      forceLink((rawEdges.map((e) => ({ source: e.u, target: e.v })) as any))
        .id((d: any) => d.id)
        .distance(100)
        .strength(0.2)
    )
    .stop();

  // Run a fixed number of ticks
  for (let i = 0; i < 250; i++) sim.tick();

  // Clamp into bounds
  nodes.forEach((n) => {
    n.x = Math.max(20, Math.min(width - 20, n.x));
    n.y = Math.max(20, Math.min(height - 20, n.y));
  });

  return { nodes, edges: rawEdges.sort((a, b) => a.w - b.w) };
}