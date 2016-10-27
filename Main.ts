import { PNode, MNode, CNode, RNode } from "./Nodes"
import { Word, Rule, CSwitch, Delivery } from "./Links"
import { Parser } from "./Parser"

// import * as DB from "./DataLayerSync"
// console.log(DB.nodes)
// console.log(DB.links)


// (1)	John kiss-ed Lucy
// (2)	Nero gave Poppaea Olivia
// (3)	Nero gave Olivia to Poppaea
Parser.parse("John kiss ed Lucy", (err, data) => {
  if (err) {
    console.error("Error!")
    console.error(err)
  } else {
    console.log("Done")
  }
})
