import { create } from "zustand";
import type { Edge, Graph, KruskalState } from "../types";
import { UnionFind } from "./useUnionFind";
import { generateRandomGraph } from "./useGraph";

type Actions = {
  generate: (n: number, p: number) => void;
  stepNext: () => void;
  stepPrev: () => void;
  resetRun: () => void;
  togglePlay: () => void;
  setSpeed: (s: number) => void;
};

type Store = KruskalState & {
  dsu: UnionFind | null;
  actions: Actions;
};

function cloneEdges(edges: Edge[]): Edge[] {
  return edges.map((e) => ({ ...e }));
}

export const useKruskal = create<Store>((set, get) => ({
  graph: { nodes: [], edges: [] },
  sortedIdx: 0,
  totalWeight: 0,
  playing: false,
  speed: 1.0,
  dsu: null,

  actions: {
    generate: (n: number, p: number) => {
      const graph: Graph = generateRandomGraph(n, p, 800, 500);
      const dsu = new UnionFind(graph.nodes.length);
      set({
        graph,
        dsu,
        sortedIdx: 0,
        totalWeight: 0,
        playing: false
      });
    },

    stepNext: () => {
      const { graph, sortedIdx, dsu, totalWeight } = get();
      if (!dsu) return;
      if (sortedIdx >= graph.edges.length) return;

      const e = graph.edges[sortedIdx];
      const merged = dsu.union(e.u, e.v);

      const edges = cloneEdges(graph.edges);
      edges[sortedIdx] = { ...e, state: merged ? "accepted" : "rejected" };

      const newWeight = merged ? totalWeight + e.w : totalWeight;

      set({
        graph: { nodes: graph.nodes, edges },
        sortedIdx: sortedIdx + 1,
        totalWeight: newWeight
      });

      // Optional: stop when MST reaches n-1 edges.
      const mstEdges = edges.filter((x) => x.state === "accepted").length;
      if (mstEdges >= graph.nodes.length - 1) {
        set({ playing: false });
      }
    },

    stepPrev: () => {
      const { graph, sortedIdx } = get();
      if (sortedIdx <= 0) return;

      // Recompute DSU and edge states up to sortedIdx-1
      const dsu = new UnionFind(graph.nodes.length);
      const edges = cloneEdges(graph.edges).map((e) => ({ ...e, state: null }));
      let total = 0;

      for (let i = 0; i < sortedIdx - 1; i++) {
        const e = edges[i];
        const merged = dsu.union(e.u, e.v);
        edges[i] = { ...e, state: merged ? "accepted" : "rejected" };
        if (merged) total += e.w;
      }

      set({
        graph: { nodes: graph.nodes, edges },
        dsu,
        sortedIdx: sortedIdx - 1,
        totalWeight: total
      });
    },

    resetRun: () => {
      const { graph } = get();
      const dsu = new UnionFind(graph.nodes.length);
      const edges = cloneEdges(graph.edges).map((e) => ({ ...e, state: null }));
      set({
        dsu,
        graph: { nodes: graph.nodes, edges },
        sortedIdx: 0,
        totalWeight: 0,
        playing: false
      });
    },

    togglePlay: () => {
      const { playing } = get();
      set({ playing: !playing });
    },

    setSpeed: (s: number) => set({ speed: s })
  }
}));

// Autoplay helper hook
import { useEffect } from "react";

export function useAutoPlay() {
  const { playing, speed } = useKruskal();
  useEffect(() => {
    if (!playing) return;
    const baseMs = 600;
    const intervalMs = Math.max(100, Math.floor(baseMs / speed));
    const t = setInterval(() => {
      const { actions, sortedIdx, graph } = useKruskal.getState();
      actions.stepNext();
      if (sortedIdx >= graph.edges.length) actions.togglePlay();
    }, intervalMs);
    return () => clearInterval(t);
  }, [playing, speed]);
}