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
  },
  {
    "type" : "M",
    "key" : "JOHN"
  },
  {
    "type" : "M",
    "key" : "KISS"
  },
  {
    "type" : "M",
    "key" : "LUCY"
  },
  {
    "type" : "C",
    "key" : "C1"
  },
  {
    "type" : "C",
    "key" : "C2"
  },
  {
    "type" : "R",
    "key" : "R1"
  },
  {
    "type" : "R",
    "key" : "R2"
  },
]
let links = [
  {
    "type": "PCM", // Word
    "quo": { "key": "John" },
    "rel": { "key": "C1" },
    "sic": { "key": "JOHN" },
    "status": 1
  },
  {
    "type": "PCM", // Word
    "quo": { "key": "kiss" },
    "rel": { "key": "C2" },
    "sic": { "key": "KISS" },
    "status": 1
  },
  {
    "type": "PCM", // Word
    "quo": { "key": "Lucy" },
    "rel": { "key": "C1" },
    "sic": { "key": "LUCY" },
    "status": 1
  },
  {
    "type": "CRC", // Rule
    "quo": { "key": "C1" },
    "rel": { "key": "R1" },
    "sic": { "key": "C1" },
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
 * Make a Word object from raw data
 */
function mkWord(data): Word {
  if (data.type !== "PCM") {
    console.error("Cannot convert to Word: " + JSON.stringify(data))
    return null
  }
  return new Word(data.quo, data.rel, data.sic) // TODO
}

/**
 * Make a Rule object from raw data
 */
function mkRule(data): Rule {
  if (data.type !== "CRC") {
    console.error("Cannot convert to Rule: " + JSON.stringify(data))
    return null
  }
  return new Rule(data.quo, data.rel, data.sic) // TODO
}

/**
 * Make a CSwitch object from raw data
 */
function mkCSwitch(data): CSwitch {
  if (data.type !== "CCC") {
    console.error("Cannot convert to CSwitch: " + JSON.stringify(data))
    return null
  }
  return new CSwitch(data.quo, data.rel, data.sic) // TODO
}

// --------------------------------------------------------------------------

/**
 * Find a PNode by its label.
 * This is something like a lexicon lookup.
 */
export function findPNode(label: string): PNode {
  for (let node of nodes) {
    if (node.type === "P" && node['label'] === label) {
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

/**
 * Find a (single) C-Switch (C/C/C) for 2 given CNodes
 */
export function findCSwitch(c1: CNode, c2: CNode): CSwitch {
  for (let link of links) {
    if (link.type === "CCC" && link.quo.key === c1.key && link.sic.key === c2.key) {
      return mkCSwitch(link)
    }
  }
  return null
}

export function close(): void {
}
