/**
 * Format an API response object
 * @param {boolean} success
 * @param {string} message
 * @param {*} data
 * @returns {Object}
 */
const apiResponse = (success, message, data = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  return response;
};

/**
 * Flatten a UI flow tree to a flat array of nodes
 * @param {Array} nodes
 * @returns {Array}
 */
const flattenUIFlowTree = (nodes) => {
  const result = [];
  const traverse = (nodeList) => {
    for (const node of nodeList) {
      result.push({ id: node.id, label: node.label, path: node.path, action: node.action });
      if (node.children && node.children.length > 0) traverse(node.children);
    }
  };
  traverse(nodes);
  return result;
};

/**
 * Find a node by ID in a UI flow tree
 * @param {Array} nodes
 * @param {string} id
 * @returns {Object|null}
 */
const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

module.exports = { apiResponse, flattenUIFlowTree, findNodeById };
