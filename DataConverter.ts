/**
 * Functions for converting from raw JSON to actual objects
 */

import {Node, PNode, CNode, MNode, RNode} from "./Nodes"
import {Word, Rule, CSwitch, Delivery} from "./Links"

// ---------------------------------------------------------------------------
// -- Nodes

/**
 * Make a PNode object from raw data
 */
export function mkPNode(data): PNode {
  if (data.type && data.type !== "P") {
    console.error("Cannot convert to PNode: " + JSON.stringify(data))
    return null
  }
  let label: string = data.label ? data.label : data.key
  return new PNode(data.key, label)
}

/**
 * Make a CNode object from raw data
 */
export function mkCNode(data): CNode {
  if (data.type && data.type !== "C") {
    console.error("Cannot convert to CNode: " + JSON.stringify(data))
    return null
  }
  return new CNode(data.key)
}

/**
 * Make a PNode object from raw data
 */
export function mkMNode(data): MNode {
  if (data.type && data.type !== "M") {
    console.error("Cannot convert to MNode: " + JSON.stringify(data))
    return null
  }
  return new MNode(data.key)
}

/**
 * Make a RNode object from raw data
 */
export function mkRNode(data): RNode {
  if (data.type && data.type !== "R") {
    console.error("Cannot convert to RNode: " + JSON.stringify(data))
    return null
  }
  return new RNode(data.key)
}

// ---------------------------------------------------------------------------
// -- Links

/**
 * Make a Word object from raw data
 */
export function mkWord(data): Word {
  if (data.type && data.type !== "PCM") {
    console.error("Cannot convert to Word: " + JSON.stringify(data))
    return null
  }
  let o: Word = new Word(mkPNode(data.quo), mkCNode(data.rel), mkMNode(data.sic))
  o.setStatusStr(data.status)
  return o
}

/**
 * Make a Rule object from raw data
 */
export function mkRule(data): Rule {
  if (data.type && data.type !== "CRC") {
    console.error("Cannot convert to Rule: " + JSON.stringify(data))
    return null
  }
  let o:Rule = new Rule(mkCNode(data.quo), mkRNode(data.rel), mkCNode(data.sic))
  o.setStatusStr(data.status)
  return o
}

/**
 * Make a CSwitch object from raw data
 */
export function mkCSwitch(data): CSwitch {
  if (data.type && data.type !== "CCC") {
    console.error("Cannot convert to CSwitch: " + JSON.stringify(data))
    return null
  }
  let o:CSwitch = new CSwitch(mkCNode(data.quo), mkCNode(data.rel), mkCNode(data.sic))
  o.setStatusStr(data.status)
  return o
}
