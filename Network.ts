import { Node, PNode, MNode, CNode, RNode } from "./Node"
import { Link, LinkStatus, Word, RuleParent, Rule, CSwitch, Delivery } from "./Link"

export class Junction {
  left: {
    word: Word
    pos: number
    token: string
  }
  right: {
    word: Word
    pos: number
    token: string
  }
  rule: Rule // CRC
  delivery: Delivery // MRM
}

export class Network {
  junctions: Junction[]
  input: string[]

  constructor(input: string[]) {
    this.junctions = []
    this.input = input
  }

  /**
   * Export to vis.js
   */
  toVisJS(): {nodes: any[], edges: any[]} {
    // Palette: https://coolors.co/8bc3e4-aadaba-fba2a6-fdd892-eeebdd
    const colour = {
      node: {
        P: '#8BC3E4',
        C: '#AADABA',
        M: '#FBA2A6',
        R: '#FDD892'
      },
      link: {
        PCM: '#007DC5',
        CRC: '#44AF69',
        MRM: '#F8333C',
        CCC: '#FCAB10'
      }
    }

    var ret = {
      node_ids: [],
      nodes: [],
      edges: []
    }

    function pushNode(ret, n: Node): string {
      let id = n.key
      if (ret.node_ids.indexOf(id) > -1) return id // avoid adding same node twice
      ret.nodes.push({
        id: id,
        label: n.label,
        title: n.key,
        color: colour.node[n.typeString()]
      })
      ret.node_ids.push(id)
      return id
    }
    function pushWord(ret, w: Word): {c_id:string, m_id:string} {
      let p_id = pushNode(ret, w.p())
      let c_id = pushNode(ret, w.c())
      let m_id = pushNode(ret, w.m())
      ret.edges.push({from: p_id, to: m_id, arrows:'to', color: colour.link.PCM})
      ret.edges.push({from: p_id, to: c_id, color: colour.link.PCM})
      ret.edges.push({from: c_id, to: m_id, color: colour.link.PCM})
      return {c_id:c_id, m_id:m_id}
    }

    for (let j of this.junctions) {
      let lw = pushWord(ret, j.left.word)
      let rw = pushWord(ret, j.right.word)
      let r_id = pushNode(ret, j.rule.r())

      // CRC
      ret.edges.push({from: lw.c_id, to: rw.c_id, arrows:'to', color: colour.link.CRC})
      ret.edges.push({from: lw.c_id, to: r_id, color: colour.link.CRC})
      ret.edges.push({from: rw.c_id, to: r_id, color: colour.link.CRC})

      // MRM
      ret.edges.push({from: lw.m_id, to: rw.m_id, arrows:'to', color: colour.link.MRM})
      ret.edges.push({from: lw.m_id, to: r_id, color: colour.link.MRM})
      ret.edges.push({from: rw.m_id, to: r_id, color: colour.link.MRM})
    }

    delete ret.node_ids
    return ret
  }
}
