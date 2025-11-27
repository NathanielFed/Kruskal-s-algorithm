export type NodeId = number;

export type Node = {
  id: NodeId;
  x: number;
  y: number;
};

export type EdgeState = null | "accepted" | "rejected";

export type Edge = {
  id: number;
  u: NodeId;
  v: NodeId;
  w: number;
  state: EdgeState;
};

export type Graph = {
  nodes: Node[];
  edges: Edge[];
};

export type KruskalState = {
  graph: Graph;
  sortedIdx: number;
  totalWeight: number;
  playing: boolean;
  speed: number; // steps per second baseline
};