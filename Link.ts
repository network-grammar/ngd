import {Node, PNode, CNode, MNode, RNode} from "./Node"

export class Link {
  type : LinkType
  quo: Node
  rel: Node
  sic: Node
  status: LinkStatus
  constructor(t: LinkType, q: Node, r: Node, s: Node) {
    this.type = t
    this.quo = q
    this.rel = r
    this.sic = s
    this.status = LinkStatus.InUse
  }
  setStatusStr(status: string): void {
    this.status = LinkStatus[status]
  }
  typeString(): string {
    switch (this.type) {
      case LinkType.Word: return 'PCM'
      case LinkType.Rule: return 'CRC'
      case LinkType.CSwitch: return 'CCC'
      case LinkType.Delivery: return 'MRM'
    }
  }
}

export enum LinkType {
  Word, // PCM
  Rule, // CRC
  CSwitch, // CCC
  Delivery  // MRM
}

export enum LinkStatus {
  InUse, // W
  Deleted, // X
  ProvisionalNotUsedYet, // Y
  ProvisionalJunction // Z
}

export type LinkJSON = {
  type : string, // "PCM"/"CRC"/"CCC"/"MRM"
  quo  : { key: string, parent?: boolean },
  rel  : { key: string },
  sic  : { key: string, parent?: boolean }
  status: string // "InUse"/"Deleted"/"ProvisionalNotUsedYet"/"ProvisionalJunction"
}


/**
 * A word in the NG sense: P used as C means M
 * P/C/M
 */
export class Word extends Link {
  constructor(p: PNode, c: CNode, m: MNode) {
    super(LinkType.Word, p, c, m)
  }
  p():PNode { return <PNode>this.quo }
  c():CNode { return <CNode>this.rel }
  m():MNode { return <MNode>this.sic }
}

export enum RuleParent {
  Quo, // Q
  Sic  // S
}

/**
 * A rule of combination: a word as C1 followed in a sentence by another as C2 may be joined with R
 * C/R/C
 */
export class Rule extends Link {
  parent: RuleParent
  constructor(c1: CNode, r: RNode, c2: CNode) {
    super(LinkType.Rule, c1, r, c2)
    this.parent = RuleParent.Quo
  }
  setParentQuo(): void { this.parent = RuleParent.Quo }
  setParentSic(): void { this.parent = RuleParent.Sic }
  isParentQuo(): boolean { return this.parent === RuleParent.Quo }
  isParentSic(): boolean { return this.parent === RuleParent.Sic }
  getParent(): CNode {
    return (this.parent === RuleParent.Quo) ? this.quo : this.sic
  }
  getDependent(): CNode {
    return (this.parent === RuleParent.Quo) ? this.sic : this.quo
  }
  c1():CNode { return <CNode>this.quo }
  r() :RNode { return <RNode>this.rel }
  c2():CNode { return <CNode>this.sic }
}

/**
 * A C-switch: the category for a word C1 is switched to C3 when the word is processed by a rule C1/R/C3
 * C/C/C
 */
export class CSwitch extends Link {
  constructor(c1: CNode, c2: CNode, c3: CNode) {
    super(LinkType.CSwitch, c1, c2, c3)
  }
  c1():CNode { return <CNode>this.quo }
  c2():CNode { return <CNode>this.rel }
  c3():CNode { return <CNode>this.sic }
}

/**
 * Delivery of a proposition: concepts M1 and M2 are related as R
 * M/R/M
 */
export class Delivery extends Link {
  constructor(m1: MNode, r: RNode, m2: MNode) {
    super(LinkType.Delivery, m1, r, m2)
  }
}
