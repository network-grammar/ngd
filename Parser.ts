import { PNode, MNode, CNode, RNode } from "./Nodes"
import { Link, LinkStatus, Word, RuleParent, Rule, CSwitch, Delivery } from "./Links"
import { DataLayerSync } from "./DataLayerSync"

// --------------------------------------------------------------------------

class ParseState {
  tokens: string[] // the input string
  list: MNode[]
  stack: StackItem[]
  lx: number // index of left in stack (or -1)
  rx: number // index of right in stack (or -1)
  left: StackItem // pointer to left item (or null)
  right: StackItem // pointer to right item (or null)
  rule: Rule // active rule
  l: string[] // log, instead of dumping to console
  provisionals: Link[] // provisionals from input data which may be updated / appended to
  constructor(input: string) {
    this.tokens = input.split(' ')
    this.list = []
    this.stack = []
    this.left = null
    this.right = null
    this.rule = null
    this.l = []
    this.provisionals = []
  }
  setLeft(lx: number): void {
    this.lx = lx
    this.left = this.stack[lx]
  }
  setRight(rx: number): void {
    this.rx = rx
    this.right = this.stack[rx]
  }

  log(s: any) {
    if (typeof s === 'string') {
      this.l.push(s)
    } else {
      this.l.push(JSON.stringify(s, null, 2))
    }
  }
  getLog(): string {
    return this.l.join("\n")
  }
}

class StackItem {
  cnode: CNode
  pos: number // token position in input string
  token: string // actual token
  status: LinkStatus
  flag: Flag
}

enum Flag {
  DoesNotFit, // 0,
  NotYetParticipated, // 1
  OnlyParticipatedAsParent, // 2
  ActivationUsed // 3
}

// --------------------------------------------------------------------------

/** Some general notes, relating to NGD 1.0 document **

p_string = input
p_seq = counter `i`
s_seq = StackItem.pos
l_list = ParseState.list

top of stack = right of sentence = end of list
bottom of stack = left of sentence = beginning of list
high > low = right > left

status
  W = In use
  X = Deleted
  Y = Provisional, not used yet
  Z = Provisional, used for a junction

*/

export class Parser {

  DB: any
  constructor(data: {nodes: any, links: any}) {
    this.DB = new DataLayerSync(data)
  }

  parse(
    input: string,
    callback: (err, data?) => any)
    : void {

    // TODO: we probably don't want to pass this about, but instead make it a class instance
    let st = new ParseState(input)

    // TODO: get all provisional rules from DB and add them to st.provisionals

    st.log("INPUT: " + input)
    st.log('--------------------')

    // for (let i=0; i<tokens.length; i++) {
    for (let i in st.tokens) {
      let token = st.tokens[i]

      // 1. Get PNode corresponding to token
      let pnode: PNode = this.DB.findPNode(token)
      if (!pnode) {
        return callback("Cannot find PNode for: " + token)
      }

      // 2. Find Words where quo == PNode
      let words: Word[] = this.DB.findWords(pnode)
      if (!words || words.length === 0) {
        return callback("Cannot find any Words for PNode: " + pnode.key)
      }

      // 3. For each, add to stack
      for (let word of words) {
        let item = new StackItem()
        item.cnode = word.c()
        item.pos = parseInt(i)
        item.token = token
        item.status = word.status
        item.flag = Flag.NotYetParticipated
        st.stack.push(item)
      }

      // 4. Pair entries in stack (left flag == 1)
      for (let rx = st.stack.length-1; rx >= 0; rx--) {
        st.setRight(rx)
        if (st.right.flag != Flag.NotYetParticipated) continue
        for (let lx = rx-1; lx >= 0; lx--) {
          st.setLeft(lx)
          if (st.left.flag != Flag.NotYetParticipated) continue
          st.log("PAIR: " + st.left.token + "___" + st.right.token)
          this.pairOfCs(st)
          st.log('--------------------')
        }
      }

      // Pair again where left flag == 3
      // TODO: never gets here...
      for (let rx = st.stack.length-1; rx >= 0; rx--) {
        st.setRight(rx)
        if (st.right.flag != Flag.NotYetParticipated) continue
        for (let lx = rx-1; lx >= 0; lx--) {
          st.setLeft(lx)
          if (st.left.flag != Flag.ActivationUsed) continue
          st.log("PAIR: " + st.left.token + " / " + st.right.token)
          this.pairOfCs(st)
          st.log('--------------------')
        }
      }

    }

    this.sentenceEnd(st)

    // We're done
    return callback(null, {
      output: "not sure what the output is...",
      log: st.getLog()
    })
  }

  /**
   * Run on each pair of C's
   */
  pairOfCs (st: ParseState): void {

    let rules: Rule[] = this.DB.findRules(st.left.cnode, st.right.cnode)
    if (!rules || rules.length === 0) return
    let last_used_rule: Rule = null

    st.log("STACK")
    st.log(st.stack)
    st.log("RULES")
    st.log(rules)

    for (let rule of rules) {

      // r_status != W or Y
      if (rule.status.valueOf() !== LinkStatus.InUse || rule.status !== LinkStatus.ProvisionalNotUsedYet) {
        continue
      }
      // r_parent == Q and s_fleft == 3
      if (rule.parent === RuleParent.Quo && st.left.flag === Flag.ActivationUsed) {
        continue
      }

      last_used_rule = rule

      // Discard any other C's for these words
      for (let x = st.stack.length-1; x >= 0; x--) {
        if (x === st.lx || x === st.rx) continue
        if (st.stack[x].flag === Flag.NotYetParticipated &&
            (st.stack[x].pos === st.left.pos || st.stack[x].pos === st.right.pos)) {
          st.stack[x].flag = Flag.DoesNotFit
        }
      }

      // if r_status == Y, r_status = Z
      if (rule.status === LinkStatus.ProvisionalNotUsedYet) {
        rule.status = LinkStatus.ProvisionalJunction
        // This rule came from DB, but we will add it to provisionals to show it's status has been updated
        st.provisionals.push(rule)
      }

      // if s_sright == Y, s_sright = Z
      if (st.right.status === LinkStatus.ProvisionalNotUsedYet) {
        st.right.status = LinkStatus.ProvisionalJunction
      }
      // if s_sleft == Y, s_left = Z
      if (st.left.status === LinkStatus.ProvisionalNotUsedYet) {
        st.left.status = LinkStatus.ProvisionalJunction
      }

      if (rule.rel === null) { // was RNULL
        this.switchCs(st)
      } else {
        // if r_parent == S, s_fright = 2 and s_fleft = 3
        if (rule.parent === RuleParent.Sic) {
          st.right.flag = Flag.OnlyParticipatedAsParent // 2
          st.left.flag  = Flag.ActivationUsed // 3
        }
        // if r_parent == Q, s_fright = 3 and unless s_fleft already == 3, s_fleft = 2
        if (rule.parent === RuleParent.Quo) {
          st.right.flag = Flag.ActivationUsed // 3
          if (st.left.flag !== Flag.ActivationUsed) {
            st.left.flag = Flag.OnlyParticipatedAsParent // 2
          }
        }

        this.displayProposition(st)
      }
    } // for rule of rules
    if (last_used_rule !== null) {
      st.rule = last_used_rule
      this.switchCs(st)
    }
  }

  /**
   * Switch-Cs function
   */
  switchCs (st: ParseState): void {
    let cswitch1: CSwitch = this.DB.findCSwitch(st.rule.c1(), st.rule.c2()) // r_quonode + r_sicnode + ***
    if (cswitch1.status === LinkStatus.InUse) { // == W
      st.left.cnode = cswitch1.c3() // s_node = c_sicnode
    }
    let cswitch2: CSwitch = this.DB.findCSwitch(st.rule.c2(), st.rule.c1()) // r_sicnode + r_quonode + ***
    if (cswitch2.status === LinkStatus.InUse) { // == W
      st.right.cnode = cswitch2.c3() // s_node = c_sicnode
    }
  }

  /**
   * Display proposition function
   */
  displayProposition (st: ParseState): void {
    st.log('> in displayProposition')

    // The parent and dependent words are identified in the stack.
    // The higher entry in the stack gives the parent word if the successful RULE record has r_parent = ‘S’, or dependent if r_parent = ‘Q’.
    // The lower entry gives the other word in the junction.
    let par: StackItem
    let dep: StackItem
    if (st.rule.isParentSic()) {
      par = st.right
      dep = st.left
    } else {
      par = st.left
      dep = st.right
    }

    // TODO: Wouldn't it be better to have actual WORD in StackItem?
    // Then we wouldn't need these lookups
    // Also applies in sentenceEnd below
    // But need to consider switchCs function
    let parP: PNode = this.DB.findPNode(par.token)
    let depP: PNode = this.DB.findPNode(dep.token)

    let parW: Word = this.DB.findWord(parP, par.cnode)
    let depW: Word = this.DB.findWord(depP, dep.cnode)

    let parM: MNode = parW.m() // first n_label in MRM
    let depM: MNode = depW.m() // third n_label in MRM
    st.list.push(parM)
    st.list.push(depM)

    let r: RNode = st.rule.r()

    st.log('Found MRM: ' + parM.label + ' / ' + r.label + ' / ' + depM.label)
  }

  /**
   * At sentence end function TODO
   */
  sentenceEnd (st: ParseState): void {
    st.log('> in sentenceEnd')
    let entries: StackItem[] = []

    // Work top-down through the stack looking for entries with s_flag == 1
    for (let x = st.stack.length-1; x >= 0; x--) {
      if (st.stack[x].flag === Flag.NotYetParticipated) {
        entries.push(st.stack[x])
      }
    }

    // If there are no such entries
    if (entries.length === 0) {

      for (let rule of st.provisionals) {
        // Make permanent any provisional rule that contributed to the successful parse
        if (rule.status === LinkStatus.ProvisionalJunction) {
          rule.status = LinkStatus.InUse
        }
        // Delete any provisional rule that did not contribute to the successful parse
        if (rule.status === LinkStatus.ProvisionalNotUsedYet) {
          rule.status = LinkStatus.Deleted
        }
      }

      for (let item of st.stack) {
        if (item.status === LinkStatus.ProvisionalJunction || item.status === LinkStatus.ProvisionalNotUsedYet) {
          // Get word for token
          let itemP: PNode = this.DB.findPNode(item.token)
          let itemW: Word = this.DB.findWord(itemP, item.cnode)

          // Make permanent any provisional word that contributed to the successful parse
          // TODO: how are we handling provisional WORDS?
          if (item.status === LinkStatus.ProvisionalJunction) {
            if (itemW.status === LinkStatus.ProvisionalJunction) {
              itemW.status = LinkStatus.InUse
            }
          }
          // Delete any provisional word that did not contribute to the successful parse
          // TODO: how are we handling provisional WORDS?
          if (item.status === LinkStatus.ProvisionalNotUsedYet) {
            if (itemW.status === LinkStatus.ProvisionalNotUsedYet) {
              itemW.status = LinkStatus.Deleted
            }
          }
        }
      }

      st.log('Sentence is grammatical')

    } else {

      // Delete all provisional rules

      // Delete all provisional words

      // See which token positions are involved
      let poss: number[] = []
      for (let entry of entries) {
        if (poss.indexOf(entry.pos) === -1) {
          poss.push(entry.pos)
        }
      }
      poss.sort()

      // If there are two or more such entries with different s_seq values
      if (poss.length >= 2) {
        // for each of these s_seq values
        for (let pos of poss) {
          // Display a line with the p_string for s_seq followed by ‘ungrammatical: string cannot be linked’.
          st.log('Ungrammatical: token "' + st.tokens[pos] + '" cannot be linked')
        }
      } else if (poss.length == 1) {
        // If there is only one orphan p_string (only one s_seq value occurs with s_flag = ‘1’)
        st.log('Token "' + poss[0] + '" cannot be linked')
        st.log('Trying to infer new links')
        this.inferringLinks(poss[0], st)
      } else {
        // This is a HARD error
        console.error("Unexpected length for poss.length: " + poss.length)
      }
    }
  }

  /**
   * Infer links function TODO
   */
  inferringLinks (orphan_pos: number, st: ParseState): void {
    st.log('> in inferringLinks')

    let orphanP: PNode = this.DB.findPNode(st.tokens[orphan_pos])
    let x_key = orphanP.key

    // For each record in DELIVERY with d_quonode or d_sicnode, but not both, matching an l_list entry
    let dels: Delivery[] = this.DB.findDeliveries(st.list)
    for (let del of dels) {
      // For each p_string in the sentence except the orphan
      for (let i = st.tokens.length; i < st.tokens.length && i != orphan_pos; i++) {
        let x_orphan
        if (i < orphan_pos) x_orphan = "L"
        else x_orphan = "R"

        let p: PNode = this.DB.findPNode(st.tokens[i])

        // Try same thing both ways round
        for (let x_sicnode of [del.quo, del.sic]) {
          let words: Word[] = this.DB.findWords(p, null, x_sicnode)
          for (let word of words) {
            let relC = word.rel
            this.findCbInstances()
            this.findCcInstances()
          }
        }

      }
    }
  }

  // TODO
  findCbInstances() : void {
  }

  // TODO
  findCcInstances() : void {
  }
}
