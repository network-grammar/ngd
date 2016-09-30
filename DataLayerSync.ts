/**
 * A static, synchronous data layer where all data is hardcoded
 * Just for prototyping purposes
 */

import {Node, PNode, CNode, MNode, RNode} from "./Nodes"
import {Word, Rule, CSwitch, Delivery} from "./Links"
import * as DC from "./DataConverter"

/**
 * Read data from JSON files
 */
import fs = require("fs")
let nodes = processJSONFile("data/nodes.json")
let links = processJSONFile("data/links.json")
function processJSONFile(file) {
  let data = fs.readFileSync(file, "utf-8")
  data = "[" + data.replace(/}\n{/g, "},\n{") + "]"
  return JSON.parse(data)
}

// --------------------------------------------------------------------------

/**
 * Find a PNode by its label.
 * This is something like a lexicon lookup.
 */
export function findPNode(label: string): PNode {
  for (let node of nodes) {
    if (node.type === "P" && node['label'] === label) {
      return DC.mkPNode(node)
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
    if (link.type === "PCM" && link.quo.key === pnode.key) {
      words.push(DC.mkWord(link))
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
    if (link.type === "CRC" && link.quo.key === left.key && link.sic.key === right.key) {
      rules.push(DC.mkRule(link))
    }
  }
  return rules
}

/**
 * Find a (single) C-Switch (C/C/C) for 2 given CNodes
 */
export function findCSwitch(c1: CNode, c2: CNode): CSwitch {
  for (let link of links) {
    if (link.type === "CCC" && link.quo.key === c1.key && link.sic.key === c2.key) {
      return DC.mkCSwitch(link)
    }
  }
  return null
}

export function close(): void {
}
