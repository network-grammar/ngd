/**
 * A static, synchronous data layer where all data is hardcoded
 * Just for prototyping purposes
 */

import {Node, PNode, CNode, MNode, RNode} from "./Nodes"
import {Word, Rule, CSwitch, Delivery} from "./Links"

// TODO: read from data directory
let nodes = [
  {
    "type" : "P",
    "key" : "John",
    "label" : "John"
  },
  {
    "type" : "P",
    "key" : "Lucy",
    "label" : "Lucy"
  },
  {
    "type" : "P",
    "key" : "kiss",
    "label" : "kiss"
  }  
]
let links = [
  {
    "type": "PCM", // Word
    "quo": { "key": "John" },
    "rel": { "key": null },
    "sic": { "key": null },
    "status": 1
  },
  {
    "type": "CRC", // Rule
    "quo": { "key": null },
    "rel": { "key": null },
    "sic": { "key": null },
    "status": 1
  }
]

/**
 * Make a PNode object from raw data
 */
function mkPNode(data): PNode {
  if (data.type !== "P") {
    console.error("Cannot convert to PNode: " + JSON.stringify(data))
    return null
  }
  return new PNode(data.label)
}

/**
 * Make a PNode object from raw data
 */
function mkWord(data): Word {
  if (data.type !== "PCM") {
    console.error("Cannot convert to Word: " + JSON.stringify(data))
    return null
  }
  return new Word(data.quo, data.rel, data.sic) // TODO
}

/**
 * Make a PNode object from raw data
 */
function mkRule(data): Rule {
  if (data.type !== "CRC") {
    console.error("Cannot convert to Rule: " + JSON.stringify(data))
    return null
  }
  return new Rule(data.quo, data.rel, data.sic) // TODO
}

/**
 * Find a PNode by its label.
 * This is something like a lexicon lookup.
 */
export function findPNode(label: string): PNode {
  for (let node of nodes) {
    if (node.label === label) {
      return mkPNode(node)
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
      words.push(mkWord(link))
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
      rules.push(mkRule(link))
    }
  }
  return rules
}

export function close(): void {
}
