import * as Dialog from "./ui/dialog";
import { Button } from "./ui/button";
import { useState, useCallback } from "react";
import { useKruskal } from "../hooks/useKruskal";
import type { Graph, Node, Edge } from "../types";

const W = 800;
const H = 500;

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export default function GraphBuilderDialog() {
  const { actions } = useKruskal();
  const [open, setOpen] = useState(false);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [dragStartId, setDragStartId] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const reset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setDragStartId(null);
    setDragPos(null);
  }, []);

  const save = useCallback(() => {
    const graph: Graph = {
      nodes,
      edges: edges.map((e, i) => ({ ...e, id: i, state: null }))
    };
    actions.loadGraph(graph);
    setOpen(false);
  }, [actions, nodes, edges]);

  const onSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Add a node if clicking background (not on a circle)
    if ((e.target as HTMLElement).tagName.toLowerCase() !== "svg") return;
    const rect = (e.target as SVGSVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Avoid placing nodes too close
    const near = nodes.some((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.hypot(dx, dy) < 24;
    });
    if (near) return;

    const id = nodes.length;
    setNodes([...nodes, { id, x, y }]);
  };

  const onSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragStartId === null) return;
    const rect = (e.target as SVGSVGElement).getBoundingClientRect();
    setDragPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const onSvgMouseUp = () => {
    setDragStartId(null);
    setDragPos(null);
  };

  const onNodeMouseDown = (id: number) => setDragStartId(id);

  const onNodeMouseUp = (id: number) => {
    if (dragStartId === null || dragStartId === id) return;
    const weight = randInt(1, 20);
    const newEdge: Edge = {
      id: edges.length,
      u: dragStartId,
      v: id,
      w: weight,
      state: null
    };
    // Prevent duplicate edges u–v or v–u
    const exists = edges.some(
      (e) => (e.u === newEdge.u && e.v === newEdge.v) || (e.u === newEdge.v && e.v === newEdge.u)
    );
    if (!exists) {
      setEdges([...edges, newEdge]);
    }
    setDragStartId(null);
    setDragPos(null);
  };

  const startNode = dragStartId !== null ? nodes[dragStartId] : null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline">Build Graph</Button>
      </Dialog.Trigger>

      <Dialog.Content className="sm:max-w-[900px]">
        <Dialog.Header>
          <Dialog.Title>Interactive Graph Builder</Dialog.Title>
          <Dialog.Description>
            Click to add nodes. Click and drag from one node to another to create a weighted edge.
          </Dialog.Description>
        </Dialog.Header>

        <div className="mt-2">
          <svg
            width={W}
            height={H}
            className="border border-gray-200 rounded bg-white"
            onClick={onSvgClick}
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
          >
            {/* existing edges */}
            {edges.map((e) => {
              const u = nodes[e.u];
              const v = nodes[e.v];
              if (!u || !v) return null;
              const mx = (u.x + v.x) / 2;
              const my = (u.y + v.y) / 2;
              return (
                <g key={`edge-${e.id}`}>
                  <line x1={u.x} y1={u.y} x2={v.x} y2={v.y} className="edge-line" />
                  <text x={mx + 6} y={my - 6} className="node-label">
                    {e.w}
                  </text>
                </g>
              );
            })}

            {/* drag preview */}
            {startNode && dragPos && (
              <line
                x1={startNode.x}
                y1={startNode.y}
                x2={dragPos.x}
                y2={dragPos.y}
                className="edge-current"
              />
            )}

            {/* nodes */}
            {nodes.map((n) => (
              <g key={`node-${n.id}`}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={12}
                  className="node-circle"
                  fill="hsl(210, 65%, 70%)"
                  onMouseDown={() => onNodeMouseDown(n.id)}
                  onMouseUp={() => onNodeMouseUp(n.id)}
                />
                <text x={n.x - 4} y={n.y + 4} className="node-label">
                  {n.id}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-4 flex justify-between">
          <div className="text-sm text-gray-600">
            Nodes: {nodes.length} • Edges: {edges.length}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={reset}>Reset</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}