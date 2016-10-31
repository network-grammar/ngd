import { PNode, MNode, CNode, RNode } from "./Nodes"
import { LinkStatus, Word, RuleParent, Rule, CSwitch, Delivery } from "./Links"
import { DataLayerSync } from "./DataLayerSync"

// --------------------------------------------------------------------------

class ParseState {
  tokens: Array<string> // the input string
  list: Array<Delivery> // result of parsing?
  stack: Array<StackItem>
  lx: number // index of left in stack (or -1)
  rx: number // index of right in stack (or -1)
  left: StackItem // pointer to left item (or null)
  right: StackItem // pointer to right item (or null)
  rule: Rule // active rule
  l: string[] // log, instead of dumping to console
  constructor(input: string) {
    this.tokens = input.split(' ')
    this.list = []
    this.stack = []
    this.left = null
    this.right = null
    this.rule = null
    this.l = []
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
  pos: number // index in token list 's_seq'
  token: string // my own addition, why not?
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

export class Parser {

  DB: any
  constructor(data: {nodes: any, links: any}) {
    this.DB = new DataLayerSync(data)
  }

  parse(
    input: string,
    callback: (err, data?) => any)
    : void {

    let st = new ParseState(input)

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

    // TODO At sentence end

    // We're done
    return callback(null, {
      output: st.list,
      log: st.getLog()
    })
  }

  /**
   * Run on each pair of C's
   */
  // function pairOfCs (lx: number, rx: number, stack: Array<StackItem>): void {
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
        // TODO: write to database
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

    let parP: PNode = this.DB.findPNode(par.token)
    let depP: PNode = this.DB.findPNode(dep.token)

    let parW: Word = this.DB.findWord(parP, par.cnode)
    let depW: Word = this.DB.findWord(depP, dep.cnode)

    let parM: MNode = parW.m() // first n_label in MRM
    let depM: MNode = depW.m() // third n_label in MRM

    let r: RNode = st.rule.r()

    st.log('Found MRM: ' + parM.label + ' / ' + r.label + ' / ' + depM.label)
    st.list.push()
  }

}
