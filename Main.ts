import { PNode, MNode, CNode, RNode } from "./Nodes"
import { Word, Rule, CSwitch, Delivery } from "./Links"
import { Parser } from "./Parser"
import * as DB from "./DataLayer"
  
// var john_P : PNode = new PNode("John")
// var lucy_P : PNode = new PNode("Lucy")
// 
// var john_M : MNode = new MNode("John")
// var lucy_M : MNode = new MNode("Lucy")
// 
// var c1 : CNode = new CNode("C1")
// var c2 : CNode = new CNode("C2")
// var c3 : CNode = new CNode("C3")
// 
// var r1 : RNode = new RNode("R1")
// var r2 : RNode = new RNode("R2")
// var r3 : RNode = new RNode("R3")
// 
// var john_Word : Word = new Word(john_P, c1, john_M)
// var lucy_Word : Word = new Word(lucy_P, c1, lucy_M)
// 
// var rule : Rule = new Rule(c1, r1, c2)
// rule.parentQuo()

// console.log(john_P)

Parser.parse("John kiss Lucy", (err, data) => {
  if (err) {
    console.error("Error!")
    console.error(err)
  } else {
    console.log(data)
  }
  DB.close()
})

// DB.findPNode("Lucy", (err, doc) => {
//   if (err)
//     console.log(err)
//   else
//     console.log(doc)
//   DB.close()
// })
