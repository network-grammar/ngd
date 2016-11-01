import { PNode, MNode, CNode, RNode } from "./Nodes"
import { Word, Rule, CSwitch, Delivery } from "./Links"
import { Parser } from "./Parser"

const input = "John kiss ed Lucy"
// const input = "Nero gave Poppaea Olivia"
// const input = "Nero gave Olivia to Poppaea"

let parser = new Parser({
  nodes: require("./data/nodes.json"),
  links: require("./data/links.json")
})

parser.parse(input, (err, data) => {
  if (err) {
    console.error("Error!")
    console.error(err)
  } else {
    console.log(data.log)
    console.log("OUTPUT")
    console.log(data.output)
  }
})
