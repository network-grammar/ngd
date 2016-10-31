/**
 * A static, synchronous data layer where all data is hardcoded
 * Just for prototyping purposes
 */

import {Node, NodeType, PNode, CNode, MNode, RNode} from "./Nodes"
import {Link, LinkType, Word, Rule, CSwitch, Delivery} from "./Links"
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

  /**
   * Find Words (P/C/M) for a given nodes
   */
  findWords(pnode?: PNode, cnode?: CNode, mnode?: MNode): Word[] {
    let words: Word[] = []
    for (let link of this.links) {
      if (link.type === LinkType.Word)
        if (!pnode || link.quo === pnode) {
          if (!cnode || link.rel === cnode) {
            if (!mnode || link.sic === mnode) {
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
      console.error('No words found for: ' + pnode + ' / ' + cnode)
      return null
    } else if (words.length > 0) {
      console.error('More than one word found for: ' + pnode + ' / ' + cnode)
      return words[0]
    } else {
      return words[0]
    }
  }

  /**
   * Find Rules (C/R/C) for 2 given CNodes
   */
  findRules(left: CNode, right: CNode): Rule[] {
    let rules: Rule[] = []
    for (let link of this.links) {
      if (link.type === LinkType.Rule && link.quo === left && link.sic === right) {
        rules.push(<Rule>link)
      }
    }
    return rules
  }

  /**
   * Find a (single) C-Switch (C/C/C) for 2 given CNodes
   */
  findCSwitch(c1: CNode, c2: CNode): CSwitch {
    for (let link of this.links) {
      if (link.type === LinkType.CSwitch && link.quo === c1 && link.sic === c2) {
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

}
