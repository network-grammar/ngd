export class Node {
  type : NodeType
  key  : string
  constructor(t: NodeType, k: string) {
    this.type = t
    this.key = k
  }
}

enum NodeType {
    P, // phonological string
    M, // meaning
    C, // category
    R  // relationship
}

/**
 * A phonological string
 */
export class PNode extends Node {
  label: string
  constructor(label: string) {
    super(NodeType.P, label)
    this.label = label
  }
  // constructor(key: string, label: string) {
  //   super(NodeType.P, key)
  //   this.label = label
  // }
}

/**
 * A meaning
 */
export class MNode extends Node {
  constructor(key: string) {
    super(NodeType.M, key)
  }
}

/**
 * A category
 */
export class CNode extends Node {
  description: string
  constructor(key: string) {
    super(NodeType.C, key)
    this.description = ''
  }
  // constructor(key: string, desc: string) {
  //   super(NodeType.C, key)
  //   this.description = desc
  // }
}

/**
 * A relationship
 */
export class RNode extends Node {
  constructor(key: string) {
    super(NodeType.R, key)
  }
}
