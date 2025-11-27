import classNames from "classnames";
import { useKruskal } from "../hooks/useKruskal";

export default function EdgeList() {
  const { graph, sortedIdx } = useKruskal();

  return (
    <aside className="w-72 bg-white border border-gray-200 rounded p-2 h-[520px] overflow-auto">
      <h2 className="text-base font-semibold mb-2">Sorted Edges</h2>
      <ul className="text-sm font-mono">
        {graph.edges.map((e, i) => (
          <li
            key={e.id}
            className={classNames("px-2 py-1 border-b border-gray-100 flex items-center justify-between", {
              "bg-yellow-50": i === sortedIdx,
              "bg-green-50": e.state === "accepted",
              "bg-red-50": e.state === "rejected"
            })}
          >
            <span className="text-gray-700">{e.u}–{e.v}</span>
            <span className="text-gray-500">w={e.w}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}