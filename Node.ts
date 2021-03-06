export class Node {
  type : NodeType
  key  : string
  label: string
  constructor(t: NodeType, k: string, l: string) {
    this.type = t
    this.key = k
    this.label = l
  }
  typeString(): string {
    return NodeType[this.type]
  }
}

export type NodeJSON = {
  type : string, // "P"/"M"/"C"/"R"
  key  : string,
  label: string
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
}

/**
 * A relationship
 */
export class RNode extends Node {
  constructor(key: string, label: string) {
    super(NodeType.R, key, label)
  }
}
