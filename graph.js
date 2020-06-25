const sorter = (a, b) => a.weight - b.weight;

const updateQueueForShortestPath = function (table, current, queue, processed) {
  const newQueue = table[current.value].filter(ele => {
    return !processed.has(ele.value);
  });
  processed.add(current.value);
  newQueue.forEach(adj => queue.push(adj));
  queue.forEach((adj, index) => {
    if (processed.has(adj.value)) queue.splice(index, 1);
  });
  queue.sort(sorter);
};

const updateQueue = (parent, children, processed, queue) => {
  const valid = children.filter(({ value }) => !processed.includes(value));
  valid.forEach(({ value, weight }) =>
    queue.push({ vertex1: parent, vertex2: value, weight })
  );
  queue.sort(sorter);
};

const updateTree = (tree, parent, child, weight) => {
  if (!tree[parent]) tree[parent] = [];
  tree[parent].push({ vertex: child, weight });
  return tree;
};

const primsMst = function (graph) {
  let tree = {};
  let currentVertex = Object.keys(graph)[0];
  const vertexCount = Object.keys(graph).length;
  const processed = [currentVertex];
  const queue = [];
  while (processed.length < vertexCount) {
    updateQueue(currentVertex, graph[currentVertex], processed, queue);
    const { vertex1, vertex2, weight } = queue.shift();
    tree = updateTree(tree, vertex1, vertex2, weight);
    currentVertex = vertex2;
    processed.push(currentVertex);
  }
  return tree;
};

const updateCostTable = function (costTable, adj) {
  const row = costTable[adj.value];
  const newCost = costTable[adj.parent].cost + adj.weight;
  if (newCost < row.cost) {
    row.cost = newCost;
    row.path = costTable[adj.parent].path.concat(adj);
  }
};

const findPath = function (adjTable, from, to) {
  const costTable = createCostTable(adjTable, from);
  const queue = [...adjTable[from]];
  const processed = new Set();
  processed.add(from);
  queue.sort(sorter);
  queue.forEach(adj => {
    adj.parent = from;
    updateCostTable(costTable, adj);
  });
  while (processed.size != Object.keys(adjTable).length) {
    const current = queue.shift();
    const children = adjTable[current.value];
    children.forEach(adj => {
      adj.parent = current.value;
      updateCostTable(costTable, adj);
    });
    updateQueueForShortestPath(adjTable, current, queue, processed);
  }
  return costTable[to];
};

const createAdjacencyTable = function (pairs) {
  const table = {};
  pairs.forEach(([key, value, weight]) => {
    if (table[key]) return table[key].push({ value, weight });
    table[key] = [{ value, weight }];
  });
  return table;
};

const createCostTable = function (adjTable, from) {
  const costTable = {};
  Object.keys(adjTable).forEach(adj => {
    const row = { cost: Infinity, path: [] };
    if (adj == from) row.cost = 0;
    costTable[adj] = row;
  });
  return costTable;
};

const createEdgeQueue = function (table) {
  const edgeQueue = [];
  Object.entries(table).forEach(([parent, children]) => {
    children.forEach(({ value, weight }) => {
      edgeQueue.push({ value, weight, parent });
    });
  });
  edgeQueue.sort(sorter);
  return edgeQueue;
};

/////////////////////////////////////////////////

const formsLoop = (from, to, fromVertices, toVertices) => {
  return (
    fromVertices.has(from) &&
    toVertices.has(to) &&
    fromVertices.has(to) &&
    toVertices.has(from)
  );
};

const kruskal = function (table) {
  const edgeQueue = createEdgeQueue(table);
  const fromVertices = new Set();
  const toVertices = new Set();
  const tree = [];
  edgeQueue.forEach(({ parent, value, weight }) => {
    let isLoopForms = !formsLoop(parent, value, fromVertices, toVertices);
    if (isLoopForms) {
      const isEdgeAdded = tree.some(([from, to]) => {
        return from == value && to == parent;
      });
      !isEdgeAdded && tree.push([parent, value, weight]);
      fromVertices.add(parent);
      toVertices.add(value);
    }
  });
  // tree.forEach(([from, to]) => {
  //   const index = tree.findIndex(ele => ele[0] == to && ele[1] == from);
  //   tree.splice(index, 1);
  // });
  return tree;
};

/////////////////////////////////////////////////

const createVisitedList = function (table) {
  const list = {};
  for (const node in table) {
    list[node] = [];
  }
  return list;
};

const anyLoopForming = function (visitedList, from, to) {
  return (
    !visitedList[from].includes(to) &&
    !visitedList[to].includes(from) &&
    (!visitedList[from].some(node => visitedList[node].includes(from)) ||
      !visitedList[to].some(node => visitedList[node].includes(to)))
  );
};

const kruskalMst = function (table) {
  const edgeQueue = createEdgeQueue(table);
  const visitedList = createVisitedList(table);
  const tree = [];
  edgeQueue.forEach(({ parent, value, weight }) => {
    if (anyLoopForming(visitedList, parent, value)) {
      tree.push([parent, value, weight]);
      visitedList[parent].push(value);
      visitedList[value].push(parent);
    }
  });
  return tree;
};

/////////////////////////////////////////////////

const main = function () {
  const pairs = require('./graph.json');
  const table = createAdjacencyTable(pairs);
  const mst = primsMst(table, 'B');
  console.log(mst);
  console.log(findPath(table, 'B', 'D'));
  console.log(kruskal(table));
  console.log(kruskalMst(table));
};

main();
