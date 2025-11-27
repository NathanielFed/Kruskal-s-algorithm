import { useMemo } from "react";
import { useKruskal } from "../hooks/useKruskal";

function hslColor(idx: number, total: number) {
  const hue = Math.floor((idx / Math.max(total, 1)) * 360);
  return `hsl(${hue}, 65%, 70%)`;
}

export default function GraphCanvas() {
  const { graph, sortedIdx, dsu } = useKruskal();

  // Compute component-based colors from DSU groups
  const colorMap = useMemo(() => {
    if (!dsu) return new Map<number, string>();
    const groups = dsu.groups();
    const map = new Map<number, string>();
    const arr = Array.from(groups.keys());
    arr.forEach((root, i) => {
      const color = hslColor(i, arr.length);
      const members = groups.get(root) ?? [];
      members.forEach((m) => map.set(m, color));
    });
    return map;
  }, [dsu, graph.nodes]);

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded p-2 flex items-center justify-center min-h-[520px]">
      <svg width={800} height={500}>
        {/* edges */}
        {graph.edges.map((e, i) => {
          const u = graph.nodes[e.u];
          const v = graph.nodes[e.v];
          const className =
            i === sortedIdx
              ? "edge-current"
              : e.state === "accepted"
              ? "edge-accepted"
              : e.state === "rejected"
              ? "edge-rejected"
              : "edge-line";
          const mx = (u.x + v.x) / 2;
          const my = (u.y + v.y) / 2;
          return (
            <g key={`edge-${e.id}`}>
              <line
                x1={u.x}
                y1={u.y}
                x2={v.x}
                y2={v.y}
                className={className}
              />
              <text x={mx + 6} y={my - 6} className="node-label">
                {e.w}
              </text>
            </g>
          );
        })}

        {/* nodes */}
        {graph.nodes.map((n) => {
          const fill = colorMap.get(n.id) ?? hslColor(n.id, graph.nodes.length);
          return (
            <g key={`node-${n.id}`}>
              <circle cx={n.x} cy={n.y} r={12} className="node-circle" fill={fill} />
              <text x={n.x - 4} y={n.y + 4} className="node-label">
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}