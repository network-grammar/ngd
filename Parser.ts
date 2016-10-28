import { PNode, MNode, CNode, RNode } from "./Nodes"
import { LinkStatus, Word, RuleParent, Rule, CSwitch, Delivery } from "./Links"
import * as DB from "./DataLayerSync"

export module Parser {

  enum Flag {
    DoesNotFit, // 0,
    NotYetParticipated, // 1
    OnlyParticipatedAsParent, // 2
    ActivationUsed // 3
  }

  class StackItem {
    cnode: CNode
    pos: number // index in token list 's_seq'
    token: string // my own addition, why not?
    status: LinkStatus
    flag: Flag
  }

  export function parse(input: string, callback: (err, data?) => any): void {

    let tokens: Array<string> = input.split(' ')

    let list: Array<Delivery> = []
    let stack: Array<StackItem> = []

    console.log("INPUT: " + input)
    console.log('--------------------')

    // for (let i=0; i<tokens.length; i++) {
    for (let i in tokens) {
      let token = tokens[i]

      // 1. Get PNode corresponding to token
      let pnode: PNode = DB.findPNode(token)
      if (!pnode) {
        return callback("Cannot find PNode for: " + token)
      }

      // 2. Find Words where quo == PNode
      let words: Word[] = DB.findWords(pnode)
      if (!words || words.length === 0) {
        return callback("Cannot find any Words for PNode: " + pnode.key)
      }

      // 3. For each, add to stack
      for (let word of words) {
        let item = new StackItem()
        item.cnode = word.c()
        item.pos = parseInt(i)
        item.status = word.status
        item.flag = Flag.NotYetParticipated
        stack.push(item)
      }

      // 4. Pair entries in stack (left flag == 1)
      for (let rx = stack.length-1; rx >= 0; rx--) {
        let right: StackItem = stack[rx]
        if (right.flag != Flag.NotYetParticipated) continue
        for (let lx = rx-1; lx >= 0; lx--) {
          let left: StackItem = stack[lx]
          if (left.flag != Flag.NotYetParticipated) continue
          console.log("PAIR: " + tokens[left.pos] + "___" + tokens[right.pos])
          pairOfCs(lx, rx, stack)
          console.log('--------------------')
        }
      }

      // Pair again where left flag == 3
      // TODO: never gets here...
      for (let rx = stack.length-1; rx >= 0; rx--) {
        let right = stack[rx]
        if (right.flag != Flag.NotYetParticipated) continue
        for (let lx = rx-1; lx >= 0; lx--) {
          let left = stack[lx]
          if (left.flag != Flag.ActivationUsed) continue
          console.log("PAIR: " + tokens[left.pos] + " / " + tokens[right.pos])
          pairOfCs(lx, rx, stack)
          console.log('--------------------')
        }
      }

    }

    // At sentence end...

    // We're done
    return callback(null, stack)

    // console.log(stack)
    // console.log(JSON.stringify(stack, null, 2))
  }

  /**
   * Run on each pair of C's
   */
  function pairOfCs (lx: number, rx: number, stack: Array<StackItem>): void {
    let left = stack[lx]
    let right = stack[rx]

    let rules: Rule[] = DB.findRules(left.cnode, right.cnode)
    if (!rules || rules.length === 0) return
    let last_used_rule: Rule = null

    console.log("STACK")
    console.log(stack)
    console.log("RULES")
    console.log(rules)

    for (let rule of rules) {

      // TODO: temporary workaround until clarified initial value of statuses
      if (!rule.status) {
        rule.status = LinkStatus.InUse
      }

      // r_status != W or Y
      if (rule.status.valueOf() !== LinkStatus.InUse || rule.status !== LinkStatus.ProvisionalNotUsedYet) {
        continue
      }
      // r_parent == Q and s_fleft == 3
      if (rule.parent === RuleParent.Quo && left.flag === Flag.ActivationUsed) {
        continue
      }

      last_used_rule = rule

      // Discard any other C's for these words
      for (let x = stack.length-1; x >= 0; x--) {
        if (x === lx || x === rx) continue
        if (stack[x].flag === Flag.NotYetParticipated &&
            (stack[x].pos === left.pos || stack[x].pos === right.pos)) {
          stack[x].flag = Flag.DoesNotFit
        }
      }

      // if r_status == Y, r_status = Z
      if (rule.status === LinkStatus.ProvisionalNotUsedYet) {
        rule.status = LinkStatus.ProvisionalJunction
        // TODO: write to database
      }

      // if s_sright == Y, s_sright = Z
      if (right.status === LinkStatus.ProvisionalNotUsedYet) {
        right.status = LinkStatus.ProvisionalJunction
      }
      // if s_sleft == Y, s_left = Z
      if (left.status === LinkStatus.ProvisionalNotUsedYet) {
        left.status = LinkStatus.ProvisionalJunction
      }

      if (rule.rel === null) { // was RNULL
        switchCs(rule, lx, rx, stack)
      } else {
        // if r_parent == S, s_fright = 2 and s_fleft = 3
        if (rule.parent === RuleParent.Sic) {
          right.flag = Flag.OnlyParticipatedAsParent // 2
          left.flag  = Flag.ActivationUsed // 3
        }
        // if r_parent == Q, s_fright = 3 and unless s_fleft already == 3, s_fleft = 2
        if (rule.parent === RuleParent.Quo) {
          right.flag = Flag.ActivationUsed // 3
          if (left.flag !== Flag.ActivationUsed) left.flag = Flag.OnlyParticipatedAsParent // 2
        }

        displayProposition(rule, lx, rx, stack)
      }
    } // for rule of rules
    if (last_used_rule !== null) {
      switchCs(last_used_rule, lx, rx, stack)
    }
  }

  /**
   * Switch-Cs function
   */
  function switchCs (rule: Rule, lx: number, rx: number, stack: Array<StackItem>): void {
    let cswitch1: CSwitch = DB.findCSwitch(rule.c1(), rule.c2()) // r_quonode + r_sicnode + ***
    if (cswitch1.status === LinkStatus.InUse) { // == W
      stack[lx].cnode = cswitch1.c3() // s_node = c_sicnode
    }
    let cswitch2: CSwitch = DB.findCSwitch(rule.c2(), rule.c1()) // r_sicnode + r_quonode + ***
    if (cswitch2.status === LinkStatus.InUse) { // == W
      stack[rx].cnode = cswitch2.c3() // s_node = c_sicnode
    }
  }

  /**
   * Display proposition function
   */
  function displayProposition (rule: Rule, lx: number, rx: number, stack: Array<StackItem>): void {
    console.log('> in displayProposition')

    let left = stack[lx] // lower
    let right = stack[rx] // higher

    // The parent and dependent words are identified in the stack.
    // The higher entry in the stack gives the parent word if the successful RULE record has r_parent = ‘S’, or dependent if r_parent = ‘Q’.
    // The lower entry gives the other word in the junction.
    let par: StackItem
    let dep: StackItem
    if (rule.isParentSic()) {
      par = right
      dep = left
    } else {
      par = left
      dep = right
    }

    let parP: PNode = DB.findPNode(par.token)
    let depP: PNode = DB.findPNode(dep.token)

    let parW: Word = DB.findWord(parP, par.cnode)
    let depW: Word = DB.findWord(depP, dep.cnode)

    let parM: MNode = parW.m() // first n_label in MRM
    let depM: MNode = depW.m() // third n_label in MRM

    let r: RNode = rule.r()

    console.log('Found MRM: ' + parM.label + ' / ' + r.label + ' / ' + depM.label)
    // TODO surely we want to do something better with construted MRM?
  }

}
