/**
 * Functions for converting from raw JSON to actual objects
 */

import {Node, NodeJSON, NodeType, PNode, CNode, MNode, RNode} from "./Node"
import {Link, LinkJSON, LinkType, LinkStatus, Word, Rule, CSwitch, Delivery} from "./Link"

// ---------------------------------------------------------------------------
// -- Generic make functions

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
// -- Making Nodes

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
// -- Making Links

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

// ---------------------------------------------------------------------------
// -- Un-making Nodes/Links into serialisable JSON objects

/**
 * Serialise Node to JSON object
 */
export function serNode(node: Node): NodeJSON {
  return {
    type: NodeType[node.type],
    key: node.key,
    label: node.label
  }
}

/**
 * Serialise Link to JSON object
 */
export function serLink(link: Link): LinkJSON {
  let obj: LinkJSON = {
    type: null,
    quo: { key: link.quo.key },
    rel: { key: link.rel.key },
    sic: { key: link.sic.key },
    status: LinkStatus[link.status]
  }
  switch (link.type) {
    case LinkType.Word: obj.type = "PCM"; break
    case LinkType.Rule: obj.type = "CRC"; break
    case LinkType.CSwitch: obj.type = "CCC"; break
    case LinkType.Delivery: obj.type = "MRM"; break
  }
  if (link.type === LinkType.Rule) {
    if ((<Rule>link).isParentQuo()) {
      obj.quo['parent'] = true
    } else {
      obj.rel['parent'] = true
    }
  }
  return obj
}
