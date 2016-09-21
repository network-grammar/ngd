import { PNode, MNode, CNode, RNode } from "./Nodes"
import { LinkStatus, Word, Rule, CSwitch, Delivery } from "./Links"
// import Stack from "./Stack"

export module Parser {
  
  export function parse(input: string): void {
    
    let tokens: Array<string> = input.split(' ')
    
    enum Flag {
      DoesNotFit = 0,
      NotYetParticipated = 1,
      OnlyParticipatedAsParent = 2,
      ActivationUsed = 3
    }
    class StackItem {
      cnode: CNode
      pos: number // index in token list
      status: LinkStatus
      flag: Flag
    }
    
    let list: Array<Delivery> = []
    let stack: Array<StackItem> = []
    
    console.log("I'm parsing: " + input)
    
    // for (let i=0; i<tokens.length; i++) {
    let i:number = -1
    for (let token of tokens) {
      i++

      // 1. Get PNode corresponding to token
      let pnode: PNode
      pnode = new PNode(token) // TODO

      // 2. Find Words where quo == PNode
      let words: Array<Word>
      words = [new Word(pnode, new CNode("dummy_C"), new MNode(token))] // TODO

      // 3. For each, add to stack
      for (let word of words) {
        let item = new StackItem()
        item.cnode = word.c()
        item.pos = i
        item.status = word.status
        item.flag = Flag.NotYetParticipated
        stack.push(item)
      }
      
      
      // 4. Pair entries in stack (left flag == 1)
      for (let rx = stack.length-1; rx >= 0; rx--) {
        let right = stack[rx]
        if (right.flag != Flag.NotYetParticipated) continue
        for (let lx = rx-1; lx >= 0; lx--) {
          let left = stack[lx]
          if (left.flag != Flag.NotYetParticipated) continue
          
          // TODO
          console.log("Found pair: " + tokens[left.pos] + " / " + tokens[right.pos])
        }
      }

      // Pair again where left flag = 3
      for (let rx = stack.length-1; rx >= 0; rx--) {
        let right = stack[rx]
        if (right.flag != Flag.NotYetParticipated) continue
        for (let lx = rx-1; lx >= 0; lx--) {
          let left = stack[lx]
          if (left.flag != Flag.ActivationUsed) continue
          
          // TODO
          console.log("Found pair: " + tokens[left.pos] + " / " + tokens[right.pos])
        }
      }
      
    }
    
    // console.log(stack)
    // console.log(JSON.stringify(stack, null, 2))
  }
  
}
