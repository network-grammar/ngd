/**
 * A static, synchronous data layer where all data is hardcoded
 * Just for prototyping purposes
 */

import {Node, NodeType, PNode, CNode, MNode, RNode} from "./Nodes"
import {Link, LinkType, Word, Rule, CSwitch, Delivery} from "./Links"
import * as DC from "./DataConverter"

/**
 * Read data from JSON files into JSON lists
 */
import fs = require("fs")
let nodesJSON = processJSONFile("data/nodes.json")
let linksJSON = processJSONFile("data/links.json")
function processJSONFile(file) {
  let data = fs.readFileSync(file, "utf-8")
  data = "[" + data.replace(/}\n+{/g, "},\n{") + "]"
  return JSON.parse(data)
}

/**
 * Convert JSON lists into lists of actual JS objects
 * Where Links point to Node instances
 */
let nodeDict = {}
export let nodes: Node[] = []
for (let n of nodesJSON) {
  let node:Node = DC.mkNode(n)
  nodes.push(node)
  nodeDict[n.key] = node
}
export let links: Link[] = linksJSON.map((l) => {
  return DC.mkLink(l, nodeDict)
})

// --------------------------------------------------------------------------

/**
 * Find a PNode by its label.
 * This is something like a lexicon lookup.
 */
export function findPNode(label: string): PNode {
  for (let node of nodes) {
    if (node.type === NodeType.P && node.label === label) {
      return node
    }
  }
  return null
}

/**
 * Find Words (P/C/M) for a given PNode
 */
export function findWords(pnode: PNode): Word[] {
  let words: Word[] = []
  for (let link of links) {
    if (link.type === LinkType.Word && link.quo === pnode) {
      words.push(link as Word)
    }
  }
  return words
}

/**
 * Find Rules (C/R/C) for 2 given CNodes
 */
export function findRules(left: CNode, right: CNode): Rule[] {
  let rules: Rule[] = []
  for (let link of links) {
    if (link.type === LinkType.Rule && link.quo === left && link.sic === right) {
      rules.push(link as Rule)
    }
  }
  return rules
}

/**
 * Find a (single) C-Switch (C/C/C) for 2 given CNodes
 */
export function findCSwitch(c1: CNode, c2: CNode): CSwitch {
  for (let link of links) {
    if (link.type === LinkType.CSwitch && link.quo === c1 && link.sic === c2) {
      return link as CSwitch
    }
  }
  return null
}

export function close(): void {
}
