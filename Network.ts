import { Node, PNode, MNode, CNode, RNode } from "./Node"
import { Link, LinkStatus, Word, RuleParent, Rule, CSwitch, Delivery } from "./Link"

export class Junction {
  pos: number // index in input string
  token: string // actual token concerned
  left: Word // PCM
  right: Word // PCM
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
      nodes: [],
      edges: []
    }

    function pushNode(ret, n: Node): string {
      let id = n.key
      ret.nodes.push({
        id: id,
        label: n.label,
        color: colour.node[n.typeString()]
      })
      return id
    }
    function pushWord(ret, w: Word): {C:string, M:string} {
      let p_id = pushNode(ret, w.p())
      let c_id = pushNode(ret, w.c())
      let m_id = pushNode(ret, w.m())
      ret.edges.push({from: p_id, to: m_id, arrows:'to', color: colour.link.PCM})
      ret.edges.push({from: p_id, to: c_id, color: colour.link.PCM})
      ret.edges.push({from: c_id, to: m_id, color: colour.link.PCM})
      return {C:c_id, M:m_id}
    }

    for (let j of this.junctions) {
      // TODO
      let lw = pushWord(ret, j.left)
      let rw = pushWord(ret, j.right)

      let r_id = ret.nodes.push({
        id: j.rule.r().key,
        label: j.rule.r().label,
        color: colour.node.R
      })

      // CRC
      ret.edges.push({from: lw.C, to: rw.C, arrows:'to', color: colour.link.CRC})
      ret.edges.push({from: lw.C, to: r_id, color: colour.link.CRC})
      ret.edges.push({from: rw.C, to: r_id, color: colour.link.CRC})

      // MRM
      ret.edges.push({from: lw.M, to: rw.M, arrows:'to', color: colour.link.MRM})
      ret.edges.push({from: lw.M, to: r_id, color: colour.link.MRM})
      ret.edges.push({from: rw.M, to: r_id, color: colour.link.MRM})
    }

    return ret
  }
}
