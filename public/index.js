const label = "0.33";

const nodes = new vis.DataSet([
  { id: 0, label },
  { id: 1, label },
  { id: 2, label },
]);

const edges = new vis.DataSet([
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 0 },
]);

const container = document.getElementById("mynetwork");

const data = {
  nodes: nodes,
  edges: edges,
};
const options = {
  edges: {
    arrows: "to",
  },
  manipulation: {
    addNode,
    addEdge,
    editEdge: false,
    deleteNode: update,
    deleteEdge: update,
  },
};

const network = new vis.Network(container, data, options);

function addNode(node, callback) {
  callback(node);
}

function addEdge(edge, callback) {
  if (edge.from === edge.to) {
    return;
  }

  const existingEdges = edges.get({
    filter: ({ from, to }) =>
      (from === edge.from && to === edge.to) ||
      (from === edge.to && to === edge.from),
  });
  if (existingEdges.length > 0) {
    edges.remove([existingEdges[0].id]);
    update();
    return;
  }

  update(edge, callback);
}

function update(data, callback) {
  callback?.(data);
  const adj = makeAdj();
  const str = makeStr(adj);
  const strPtr = Module.stringToNewUTF8(str);
  const eqmPtr = Module._solve(strPtr);
  _free(strPtr);
  const eqm = new Float64Array(Module.HEAPF64.buffer, eqmPtr, adj.length);
  nodes.update(
    nodes.get().map(({ id }, i) => ({ id, label: eqm[i].toFixed(2) })),
  );
  Module._free_array(eqmPtr);
}

function makeAdj() {
  const ids = Object.fromEntries(nodes.get().map(({ id }, i) => [id, i]));
  const n = nodes.length;
  const adj = Array.from({ length: n }, () => Array(n).fill(0));
  edges.forEach(({ from, to }) => {
    const f = ids[from];
    const t = ids[to];
    adj[f][t] = 1;
    adj[t][f] = -1;
  });
  return adj;
}

function makeStr(arr) {
  const s = ` 1""{${'""'.repeat(arr.length)}}0`;
  return `EFG 2 R ""{""""}p ""1${s}${arr
    .map(
      (a) => `p ""2${s}${a.map((k) => `t ""${k + 2}""{${k},${-k}}`).join("")}`,
    )
    .join("")}`;
}
