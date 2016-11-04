/**
 * A MongoDB data layer where all calls are asynchronous
 */

import {Node, PNode, CNode, MNode, RNode} from "./Node"
import {Word, Rule, CSwitch, Delivery} from "./Link"

import monk = require("monk")
import async = require("async")

let db = monk('localhost:27017/ngd')
let nodes = db.get('nodes')
let links = db.get('links')

type Callback<T> = (err: any, data?: T) => any

/**
 * Find a PNode by its label.
 * This is something like a lexicon lookup.
 */
export function findPNode(label: string, callback: Callback<PNode>): void {
  nodes.findOne({type: 'P', label: label}, function(err, doc) {
    if (err)
      callback(err)
    else if (doc == null)
      callback("Cannot find PNode: " + label)
    else
      callback(null, new PNode(doc.key, doc.label))
  })
}

/**
 * Find Words (P/C/M) for a given PNode
 */
export function findWords(pnode: PNode, callback: Callback<[Word]>): void {
  links.find({type: 'PCM', quo: pnode.key}, function(err, docs) {
    if (err)
      callback(err)
    else if (docs == [])
      callback("Cannot find any Words for PNode: " + pnode.key)
    else {
      let mkWord = (data) => {
        return new Word(null, null, null) // TODO
      }
      async.map(docs, mkWord, callback)
    }
  })
}

/**
 * Find Rules (C/R/C) for 2 given CNodes
 */
export function findRules(left: CNode, right: CNode, callback: Callback<[Rule]>): void {
  let conds = {
    type: 'CRM',
    quo: left.key,
    sic: right.key
    // status: InUse or Deleted
  }
  links.find(conds, function(err, docs) {
    if (err)
      callback(err)
    else if (docs == [])
      callback("Cannot find any Rules for CNodes: " + left.key + ", " + right.key)
    else {
      let mkRule = (data) => {
        return new Rule(null, null, null) // TODO
      }
      async.map(docs, mkRule, callback)
    }
  })
}

export function close(): void {
  db.close()
}
