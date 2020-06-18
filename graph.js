const { writeFileSync } = require('fs');

const sorter = (a, b) => a.weight - b.weight;

const updateQueue = function (table, current, queue, processed) {
  const newQueue = table[current.value].filter(ele => {
    return !processed.includes(ele.value);
  });
  processed.push(current.value);
  newQueue.forEach(adj => {
    adj.parent = current.value;
    queue.push(adj);
  });
  queue.forEach((adj, index) => {
    if (processed.includes(adj.value)) queue.splice(index, 1);
  });
  queue.sort(sorter);
};

const primsMst = function (table, root) {
  const tree = {};
  const queue = [...table[root]];
  const processed = [root];
  tree[root] = [];
  queue.forEach(adj => (adj.parent = root));
  queue.sort(sorter);
  while (processed.length != Object.keys(table).length) {
    const current = queue.shift();
    if (!tree[current.parent]) tree[current.parent] = [];
    tree[current.parent].push(current);
    delete current.parent;
    updateQueue(table, current, queue, processed);
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
  const processed = [from];
  queue.sort(sorter);
  queue.forEach(adj => {
    adj.parent = from;
    updateCostTable(costTable, adj);
  });
  while (processed.length != Object.keys(adjTable).length) {
    const current = queue.shift();
    const children = adjTable[current.value];
    children.forEach(adj => {
      adj.parent = current.value;
      updateCostTable(costTable, child);
    });
    updateQueue(adjTable, current, queue, processed);
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

const kruskalMst = function (table) {};

const main = function () {
  const pairs = require('./graph.json');
  const table = createAdjacencyTable(pairs);
  const mst = primsMst(table, 'B');
  console.log(mst);
  console.log(findPath(table, 'B', 'D'));
};

main();
