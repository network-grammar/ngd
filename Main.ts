import { PNode, MNode, CNode, RNode } from "./Nodes"
import { Word, Rule, CSwitch, Delivery } from "./Links"
import { Parser } from "./Parser"
import * as DB from "./DataLayer"

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
