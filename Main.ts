import { PNode, MNode, CNode, RNode } from "./Nodes"
import { Word, Rule, CSwitch, Delivery } from "./Links"
import { Parser } from "./Parser"

// (1)	John kiss-ed Lucy
// (2)	Nero gave Poppaea Olivia
// (3)	Nero gave Olivia to Poppaea

let parser = new Parser({
  nodes: require("./data/nodes.json"),
  links: require("./data/links.json")
})

parser.parse("John kiss ed Lucy", (err, data) => {
  if (err) {
    console.error("Error!")
    console.error(err)
  } else {
    console.log(data.log)
    console.log("\n\n")
    console.log(data.output)
  }
})
