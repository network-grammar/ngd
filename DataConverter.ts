/**
 * Functions for converting from raw JSON to actual objects
 */

import {Node, PNode, CNode, MNode, RNode} from "./Nodes"
import {Link, Word, Rule, CSwitch, Delivery} from "./Links"

// ---------------------------------------------------------------------------
// -- Generic

export function mkNode(data): Node {
  switch (data.type) {
    case 'P': return mkPNode(data)
    case 'C': return mkCNode(data)
    case 'M': return mkMNode(data)
    case 'R': return mkRNode(data)
    default:
      console.error("Cannot convert item: " + JSON.stringify(data))
      return null
  }
}

export function mkLink(data, nodeDict): Link {
  switch (data.type) {
    case 'PCM': return mkWord(data, nodeDict)
    case 'CRC': return mkRule(data, nodeDict)
    case 'CCC': return mkCSwitch(data, nodeDict)
    case 'MRM': return mkDelivery(data, nodeDict)
    default:
      console.error("Cannot convert item: " + JSON.stringify(data))
      return null
  }
}

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
  return new PNode(data.key, data.label)
}

/**
 * Make a CNode object from raw data
 */
export function mkCNode(data): CNode {
  if (data.type && data.type !== "C") {
    console.error("Cannot convert to CNode: " + JSON.stringify(data))
    return null
  }
  return new CNode(data.key, data.label)
}

/**
 * Make a PNode object from raw data
 */
export function mkMNode(data): MNode {
  if (data.type && data.type !== "M") {
    console.error("Cannot convert to MNode: " + JSON.stringify(data))
    return null
  }
  return new MNode(data.key, data.label)
}

/**
 * Make a RNode object from raw data
 */
export function mkRNode(data): RNode {
  if (data.type && data.type !== "R") {
    console.error("Cannot convert to RNode: " + JSON.stringify(data))
    return null
  }
  return new RNode(data.key, data.label)
}

// ---------------------------------------------------------------------------
// -- Links

/**
 * Make a Word object from raw data
 */
export function mkWord(data, nodeDict): Word {
  if (data.type && data.type !== "PCM") {
    console.error("Cannot convert to Word: " + JSON.stringify(data))
    return null
  }
  let o: Word = new Word(nodeDict[data.quo.key], nodeDict[data.rel.key], nodeDict[data.sic.key])
  o.setStatusStr(data.status)
  return o
}

/**
 * Make a Rule object from raw data
 */
export function mkRule(data, nodeDict): Rule {
  if (data.type && data.type !== "CRC") {
    console.error("Cannot convert to Rule: " + JSON.stringify(data))
    return null
  }
  let o:Rule = new Rule(nodeDict[data.quo.key], nodeDict[data.rel.key], nodeDict[data.sic.key])
  o.setStatusStr(data.status)
  if (data.quo.parent) o.setParentQuo()
  else if (data.sic.parent) o.setParentSic()
  return o
}

/**
 * Make a CSwitch object from raw data
 */
export function mkCSwitch(data, nodeDict): CSwitch {
  if (data.type && data.type !== "CCC") {
    console.error("Cannot convert to CSwitch: " + JSON.stringify(data))
    return null
  }
  let o:CSwitch = new CSwitch(nodeDict[data.quo.key], nodeDict[data.rel.key], nodeDict[data.sic.key])
  o.setStatusStr(data.status)
  return o
}

/**
 * Make a Delivery object from raw data
 */
export function mkDelivery(data, nodeDict): Delivery {
  if (data.type && data.type !== "MRM") {
    console.error("Cannot convert to Delivery: " + JSON.stringify(data))
    return null
  }
  let o:Delivery = new Delivery(nodeDict[data.quo.key], nodeDict[data.rel.key], nodeDict[data.sic.key])
  o.setStatusStr(data.status)
  return o
}
