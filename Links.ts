import {Node, PNode, CNode, MNode, RNode} from "./Nodes"

class Link {
  quo: Node
  rel: Node
  sic: Node
  status: LinkStatus
  constructor(q: Node, r: Node, s: Node) {
    this.quo = q
    this.rel = r
    this.sic = s
    this.status = LinkStatus.InUse
  }
}

export enum LinkStatus {
  InUse,
  Deleted
}
  
/**
 * A word in the NG sense: P used as C means M
 * P/C/M
 */
export class Word extends Link {
  constructor(p: PNode, c: CNode, m: MNode) {
    super(p, c, m)
  }
  p():PNode { return <PNode>this.quo }
  c():CNode { return <CNode>this.rel }
  m():MNode { return <MNode>this.sic }
}


/**
 * A rule of combination: a word as C1 followed in a sentence by another as C2 may be joined with R
 * C/R/C
 */
export class Rule extends Link {
  parentIsQuo: boolean // true = quo is parent; false = sic is parent
  constructor(c1: CNode, r: RNode, c2: CNode) {
    super(c1, r, c2)
    this.parentQuo()
  }
  parentQuo(): void {
    this.parentIsQuo = true
  }
  parentSic(): void {
    this.parentIsQuo = false
  }
  dependentQuo(): void { this.parentSic() }
  dependentSic(): void { this.parentQuo() }
}

/**
 * A C-switch: the category for a word C1 is switched to C3 when the word is processed by a rule C1/R/C3
 * C/C/C
 */
export class CSwitch extends Link {
  constructor(c1: CNode, c2: CNode, c3: CNode) {
    super(c1, c2, c3)
  }
}

/**
 * Delivery of a proposition: concepts M1 and M2 are related as R
 * M/R/M
 */
export class Delivery extends Link {
  constructor(m1: MNode, r: RNode, m2: MNode) {
    super(m1, r, m2)
  }
}