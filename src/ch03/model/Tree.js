/**
 * Simple tree class
 * Author: Luis Atencio
 */

const _ = require('lodash');

class Tree {
  constructor(root) {
    this._root = root;
  }

  static map(node, fn, tree = null) {
    node.value = fn(node.value);
    if (tree === null) {
      tree = new Tree(node);
    }
    if (node.hasChildren()) {
      _.map(node.children, (child) => {
        Tree.map(child, fn, tree);
      });
    }
    return tree;
  }

  get root() {
    return this._root;
  }

  toArray(node = null, arr = []) {
    if (node === null) {
      node = this._root;
    }
    arr.push(node.value);
    // Base case
    if (node.hasChildren()) {
      const that = this; // TODO revisit Lodash doc to insert objec context
      _.map(node.children, (child) => {
        that.toArray(child, arr);
      });
    }
    return arr;
  }
}

exports.Tree = Tree;
