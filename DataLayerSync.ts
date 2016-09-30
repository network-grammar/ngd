/**
 * A static, synchronous data layer where all data is hardcoded
 * Just for prototyping purposes
 */

import {Node, PNode, CNode, MNode, RNode} from "./Nodes"
import {Word, Rule, CSwitch, Delivery} from "./Links"

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
