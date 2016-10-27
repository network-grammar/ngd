export class Node {
  type : NodeType
  key  : string
  label: string
  constructor(t: NodeType, k: string, l: string) {
    this.type = t
    this.key = k
    this.label = l
  }
}

export enum NodeType {
  P, // phonological string
  M, // meaning
  C, // category
  R  // relationship
}

/**
 * A phonological string
 */
export class PNode extends Node {
  constructor(key: string, label: string) {
    super(NodeType.P, key, label)
  }
}

/**
 * A meaning
 */
export class MNode extends Node {
  constructor(key: string, label: string) {
    super(NodeType.M, key, label)
  }
}

/**
 * A category
 */
export class CNode extends Node {
  constructor(key: string, label: string) {
    super(NodeType.C, key, label)
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
  constructor(key: string, label: string) {
    super(NodeType.R, key, label)
  }
}
