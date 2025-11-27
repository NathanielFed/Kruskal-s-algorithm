// App state
const svg = document.getElementById("graph");
const edgeListEl = document.getElementById("edgeList");
const nodeCountEl = document.getElementById("nodeCount");
const edgeProbEl = document.getElementById("edgeProb");
const edgeProbValueEl = document.getElementById("edgeProbValue");
const speedEl = document.getElementById("speed");
const speedValueEl = document.getElementById("speedValue");
const generateBtn = document.getElementById("generateBtn");
const stepBtn = document.getElementById("stepBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const resetBtn = document.getElementById("resetBtn");

const currentEdgeEl = document.getElementById("currentEdge");
const totalWeightEl = document.getElementById("totalWeight");
const edgesConsideredEl = document.getElementById("edgesConsidered");
const edgesTotalEl = document.getElementById("edgesTotal");

// Graph data
let nodes = [];
let edges = []; // { id, u, v, w, lineEl, labelEl, listEl, state }
let dsu = null;
let sortedIdx = 0;
let totalWeight = 0;
let playing = false;
let timer = null;

// Utils
function randInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}
function hslColor(idx, total) {
    const hue = Math.floor((idx / Math.max(total, 1)) * 360);
    return `hsl(${hue}, 65%, 70%)`;
}

// Disjoint Set Union
class DSU {
    constructor(n) {
        this.parent = Array(n).fill(0).map((_, i) => i);
        this.rank = Array(n).fill(0);
    }
    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }
    union(a, b) {
        let ra = this.find(a);
        let rb = this.find(b);
        if (ra === rb) return false;
        if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
        this.parent[rb] = ra;
        if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
        return true;
    }
    groups() {
        const groupMap = new Map();
        nodes.forEach((_, i) => {
            const r = this.find(i);
            if (!groupMap.has(r)) groupMap.set(r, []);
            groupMap.get(r).push(i);
        });
        return [...groupMap.values()];
    }
}

// SVG helpers
function clearSVG() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
}
function createLine(x1, y1, x2, y2, className) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("class", className);
    return line;
}
function createText(x, y, text, className) {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x);
    t.setAttribute("y", y);
    t.setAttribute("class", className);
    t.textContent = text;
    return t;
}
function createCircle(cx, cy, r, fill, className) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", cx);
    c.setAttribute("cy", cy);
    c.setAttribute("r", r);
    c.setAttribute("fill", fill);
    c.setAttribute("class", className);
    return c;
}

// UI helpers
function setInfoCurrentEdge(edge) {
    currentEdgeEl.textContent = edge ? `${edge.u}–${edge.v} (w=${edge.w})` : "-";
}
function updateCounters() {
    edgesConsideredEl.textContent = String(sortedIdx);
    edgesTotalEl.textContent = String(edges.length);
    totalWeightEl.textContent = String(totalWeight);
}
function updateEdgeListStates() {
    edges.forEach((e, i) => {
        e.listEl.className = "";
        if (i === sortedIdx) e.listEl.classList.add("current");
        if (e.state === "accepted") e.listEl.classList.add("accepted");
        if (e.state === "rejected") e.listEl.classList.add("rejected");
        if (!e.state) e.listEl.classList.add("pending");
    });
}

// Build graph
function generateGraph(n, p) {
    clearSVG();
    edges = [];
    nodes = [];
    dsu = new DSU(n);
    sortedIdx = 0;
    totalWeight = 0;
    setInfoCurrentEdge(null);
    updateCounters();
    edgeListEl.innerHTML = "";

    const W = svg.viewBox.baseVal.width || svg.getAttribute("width");
    const H = svg.viewBox.baseVal.height || svg.getAttribute("height");
    const width = Number(W);
    const height = Number(H);

    // Place nodes randomly with padding
    const pad = 40;
    for (let i = 0; i < n; i++) {
        nodes.push({
            id: i,
            x: randInt(pad, width - pad),
            y: randInt(pad, height - pad),
        });
    }

    // Create edges with probability p
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (Math.random() <= p) {
                const w = randInt(1, 20);
                const id = edges.length;

                const line = createLine(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, "edge-line");
                // Label at midpoint offset
                const mx = (nodes[i].x + nodes[j].x) / 2;
                const my = (nodes[i].y + nodes[j].y) / 2;
                const label = createText(mx + 6, my - 6, String(w), "edge-label");

                svg.appendChild(line);
                svg.appendChild(label);

                // Edge list item
                const li = document.createElement("li");
                const edgeSpan = document.createElement("span");
                edgeSpan.className = "edge";
                edgeSpan.textContent = `${i}–${j}`;
                const weightSpan = document.createElement("span");
                weightSpan.className = "weight";
                weightSpan.textContent = `w=${w}`;
                li.appendChild(edgeSpan);
                li.appendChild(weightSpan);
                edgeListEl.appendChild(li);

                edges.push({
                    id,
                    u: i,
                    v: j,
                    w,
                    lineEl: line,
                    labelEl: label,
                    listEl: li,
                    state: null
                });
            }
        }
    }

    // Sort edges by weight asc
    edges.sort((a, b) => a.w - b.w);

    // Reorder edge list DOM to match sorted edges
    edgeListEl.innerHTML = "";
    edges.forEach(e => edgeListEl.appendChild(e.listEl));

    // Draw nodes (after edges so nodes appear on top)
    colorNodesByComponents();
    nodes.forEach(node => {
        const fill = hslColor(node.id, nodes.length);
        const circle = createCircle(node.x, node.y, 12, fill, "node-circle");
        const label = createText(node.x - 4, node.y + 4, String(node.id), "node-label");
        svg.appendChild(circle);
        svg.appendChild(label);
    });

    updateCounters();
    updateEdgeListStates();
}

// Color nodes based on DSU groups (group hues)
function colorNodesByComponents() {
    // Compute group colors stable by root id
    const groups = dsu ? dsu.groups() : nodes.map((_, i) => [i]);
    const colorMap = new Map();
    groups.forEach((group, idx) => {
        const color = hslColor(idx, groups.length);
        group.forEach(nodeIdx => colorMap.set(nodeIdx, color));
    });

    // Remove existing node elements before recoloring
    const oldNodes = [...svg.querySelectorAll(".node-circle, .node-label")];
    oldNodes.forEach(el => svg.removeChild(el));

    // Re-add nodes with colors
    nodes.forEach(node => {
        const circle = createCircle(node.x, node.y, 12, colorMap.get(node.id), "node-circle");
        const label = createText(node.x - 4, node.y + 4, String(node.id), "node-label");
        svg.appendChild(circle);
        svg.appendChild(label);
    });
}

// Kruskal step
function step() {
    if (sortedIdx >= edges.length) {
        setInfoCurrentEdge(null);
        stopPlaying();
        return;
    }
    // Clear previous "current" highlighting
    edges.forEach(e => e.lineEl.classList.remove("edge-current"));

    const e = edges[sortedIdx];
    setInfoCurrentEdge(e);
    e.lineEl.classList.add("edge-current");

    const merged = dsu.union(e.u, e.v);
    if (merged) {
        e.state = "accepted";
        e.lineEl.classList.remove("edge-current");
        e.lineEl.classList.add("edge-accepted");
        totalWeight += e.w;
        colorNodesByComponents();
    } else {
        e.state = "rejected";
        e.lineEl.classList.remove("edge-current");
        e.lineEl.classList.add("edge-rejected");
    }

    sortedIdx++;
    updateCounters();
    updateEdgeListStates();

    // Stop automatically when MST size reaches n-1 (optional early stop)
    const mstEdges = edges.filter(x => x.state === "accepted").length;
    if (mstEdges >= nodes.length - 1) {
        stopPlaying();
    }
}

// Play/Pause control
function startPlaying() {
    if (playing) return;
    playing = true;
    playPauseBtn.textContent = "Pause";
    const baseMs = 600; // base duration per step
    const speed = Number(speedEl.value); // multiplier (0.1 .. 2.0)
    const intervalMs = Math.max(100, Math.floor(baseMs / speed));
    timer = setInterval(() => {
        step();
        if (sortedIdx >= edges.length) stopPlaying();
    }, intervalMs);
}
function stopPlaying() {
    playing = false;
    playPauseBtn.textContent = "Play";
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

// Reset current run state (without regenerating)
function resetRun() {
    if (timer) clearInterval(timer);
    playing = false;
    playPauseBtn.textContent = "Play";
    dsu = new DSU(nodes.length);
    totalWeight = 0;
    sortedIdx = 0;
    edges.forEach(e => {
        e.state = null;
        e.lineEl.classList.remove("edge-current", "edge-accepted", "edge-rejected");
        e.lineEl.classList.add("edge-line");
    });
    setInfoCurrentEdge(null);
    updateCounters();
    updateEdgeListStates();
    colorNodesByComponents();
}

// Wire up UI
edgeProbEl.addEventListener("input", () => {
    edgeProbValueEl.textContent = Number(edgeProbEl.value).toFixed(2);
});
speedEl.addEventListener("input", () => {
    speedValueEl.textContent = `${Number(speedEl.value).toFixed(1)}x`;
});

generateBtn.addEventListener("click", () => {
    stopPlaying();
    const n = Math.max(3, Math.min(30, Number(nodeCountEl.value)));
    const p = Number(edgeProbEl.value);
    generateGraph(n, p);
});
stepBtn.addEventListener("click", () => step());
playPauseBtn.addEventListener("click", () => {
    if (playing) stopPlaying();
    else startPlaying();
});
resetBtn.addEventListener("click", () => resetRun());

// Initialize first graph on load
window.addEventListener("DOMContentLoaded", () => {
    generateGraph(Number(nodeCountEl.value), Number(edgeProbEl.value));
    speedValueEl.textContent = `${Number(speedEl.value).toFixed(1)}x`;
    edgeProbValueEl.textContent = Number(edgeProbEl.value).toFixed(2);
});
