/**
 * A static, synchronous data layer where all data is hardcoded
 * Just for prototyping purposes
 */

import {Node, NodeType, PNode, CNode, MNode, RNode} from "./Node"
import {Link, LinkType, LinkStatus, Word, Rule, CSwitch, Delivery} from "./Link"
import * as DC from "./DataConverter"

// --------------------------------------------------------------------------

export class DataLayerSync {

  nodes: Node[] = []
  links: Link[] = []

  constructor(data: {nodes: any, links: any}) {
    let nodesJSON = data.nodes
    let linksJSON = data.links

    // Convert JSON lists into lists of actual JS objects
    // One instance for every DB entry
    // Links point to Node instances
    let nodeDict = {}
    for (let n of nodesJSON) {
      let node:Node = DC.mkNode(n)
      this.nodes.push(node)
      nodeDict[n.key] = node
    }
    this.links = linksJSON.map((l) => {
      return DC.mkLink(l, nodeDict)
    })
  }

// --------------------------------------------------------------------------
// --- Nodes

  /**
   * Find a PNode by its label.
   * This is something like a lexicon lookup.
   */
  findPNode(label: string): PNode {
    for (let node of this.nodes) {
      if (node.type === NodeType.P && node.label === label) {
        return node
      }
    }
    return null
  }

// --------------------------------------------------------------------------
// --- Links

  /**
   * Find Words (P/C/M) for given nodes
   */
  findWords(quo?: PNode, rel?: CNode, sic?: MNode): Word[] {
    let words: Word[] = []
    for (let link of this.links) {
      if (link.type === LinkType.Word)
        if (!quo || link.quo === quo) {
          if (!rel || link.rel === rel) {
            if (!sic || link.sic === sic) {
              words.push(<Word>link)
            }
          }
      }
    }
    return words
  }

  /**
   * Find a Word (P/C/M) for a given PNode and CNode
   */
  findWord(pnode: PNode, cnode: CNode): Word {
    let words: Word[] = []
    for (let link of this.links) {
      if (link.type === LinkType.Word && link.quo === pnode && link.rel === cnode) {
        words.push(<Word>link)
      }
    }
    if (words.length === 0) {
      console.error('No words found for: ' + pnode.key + ' / ' + cnode.key)
      return null
    } else if (words.length > 1) {
      console.error('More than one word found for: ' + pnode.key + ' / ' + cnode.key)
      return words[0]
    } else {
      return words[0]
    }
  }

  /**
   * Find Rules (C/R/C) for given nodes
   */
  findRules(quo?: CNode, rel?: RNode, sic?: CNode): Rule[] {
    let rules: Rule[] = []
    for (let link of this.links) {
      if (link.type === LinkType.Rule) {
        if (!quo || link.quo === quo) {
          if (!rel || link.rel === rel) {
            if (!sic || link.sic === sic) {
              rules.push(<Rule>link)
            }
          }
        }
      }
    }
    return rules
  }

  /**
   * Find a (single) C-Switch (C/C/C) for 2 given CNodes
   */
  findCSwitch(quo: CNode, sic: CNode): CSwitch {
    for (let link of this.links) {
      if (link.type === LinkType.CSwitch && link.quo === quo && link.sic === sic) {
        return <CSwitch>link
      }
    }
    return null
  }

  /**
   * Find Deliveries (M/R/M) where either (but not both) QUO or SIC is in a list of M keys
   */
  findDeliveries(ms: MNode[]): Delivery[] {
    let dels: Delivery[] = []
    let in_ms = (x: MNode) => {
      for (let m of ms) {
        if (x === m) return true
      }
      return false
    }
    for (let link of this.links) {
      let quo_in_ms = in_ms(link.quo)
      let sic_in_ms = in_ms(link.sic)
      if (link.type === LinkType.Delivery && (quo_in_ms != sic_in_ms)) { // XOR
        dels.push(<Delivery>link)
      }
    }
    return dels
  }

  /**
   * Get all provisional rules and words
   * NOTE This is probably not good design and should be avoided
   */
  getProvisionalLinks(): {rules: Rule[], words: Word[]} {
    let obj = {
      rules: [],
      words: []
    }
    for (let link of this.links) {
      if (link.status === LinkStatus.ProvisionalJunction || link.status === LinkStatus.ProvisionalNotUsedYet) {
        if (link.type === LinkType.Rule) {
          obj.rules.push(<Rule>link)
        }
        if (link.type === LinkType.Word) {
          obj.words.push(<Word>link)
        }
      }
    }
    return obj
  }

}
