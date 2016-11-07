var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("Node", ["require", "exports"], function (require, exports) {
    "use strict";
    var Node = (function () {
        function Node(t, k, l) {
            this.type = t;
            this.key = k;
            this.label = l;
        }
        Node.prototype.typeString = function () {
            return NodeType[this.type];
        };
        return Node;
    }());
    exports.Node = Node;
    (function (NodeType) {
        NodeType[NodeType["P"] = 0] = "P";
        NodeType[NodeType["M"] = 1] = "M";
        NodeType[NodeType["C"] = 2] = "C";
        NodeType[NodeType["R"] = 3] = "R"; // relationship
    })(exports.NodeType || (exports.NodeType = {}));
    var NodeType = exports.NodeType;
    /**
     * A phonological string
     */
    var PNode = (function (_super) {
        __extends(PNode, _super);
        function PNode(key, label) {
            _super.call(this, NodeType.P, key, label);
        }
        return PNode;
    }(Node));
    exports.PNode = PNode;
    /**
     * A meaning
     */
    var MNode = (function (_super) {
        __extends(MNode, _super);
        function MNode(key, label) {
            _super.call(this, NodeType.M, key, label);
        }
        return MNode;
    }(Node));
    exports.MNode = MNode;
    /**
     * A category
     */
    var CNode = (function (_super) {
        __extends(CNode, _super);
        function CNode(key, label) {
            _super.call(this, NodeType.C, key, label);
        }
        return CNode;
    }(Node));
    exports.CNode = CNode;
    /**
     * A relationship
     */
    var RNode = (function (_super) {
        __extends(RNode, _super);
        function RNode(key, label) {
            _super.call(this, NodeType.R, key, label);
        }
        return RNode;
    }(Node));
    exports.RNode = RNode;
});
define("Link", ["require", "exports"], function (require, exports) {
    "use strict";
    var Link = (function () {
        function Link(t, q, r, s) {
            this.type = t;
            this.quo = q;
            this.rel = r;
            this.sic = s;
            this.status = LinkStatus.InUse;
        }
        Link.prototype.setStatusStr = function (status) {
            this.status = LinkStatus[status];
        };
        Link.prototype.typeString = function () {
            switch (this.type) {
                case LinkType.Word: return 'PCM';
                case LinkType.Rule: return 'CRC';
                case LinkType.CSwitch: return 'CCC';
                case LinkType.Delivery: return 'MRM';
            }
        };
        return Link;
    }());
    exports.Link = Link;
    (function (LinkType) {
        LinkType[LinkType["Word"] = 0] = "Word";
        LinkType[LinkType["Rule"] = 1] = "Rule";
        LinkType[LinkType["CSwitch"] = 2] = "CSwitch";
        LinkType[LinkType["Delivery"] = 3] = "Delivery"; // MRM
    })(exports.LinkType || (exports.LinkType = {}));
    var LinkType = exports.LinkType;
    (function (LinkStatus) {
        LinkStatus[LinkStatus["InUse"] = 0] = "InUse";
        LinkStatus[LinkStatus["Deleted"] = 1] = "Deleted";
        LinkStatus[LinkStatus["ProvisionalNotUsedYet"] = 2] = "ProvisionalNotUsedYet";
        LinkStatus[LinkStatus["ProvisionalJunction"] = 3] = "ProvisionalJunction"; // Z
    })(exports.LinkStatus || (exports.LinkStatus = {}));
    var LinkStatus = exports.LinkStatus;
    /**
     * A word in the NG sense: P used as C means M
     * P/C/M
     */
    var Word = (function (_super) {
        __extends(Word, _super);
        function Word(p, c, m) {
            _super.call(this, LinkType.Word, p, c, m);
        }
        Word.prototype.p = function () { return this.quo; };
        Word.prototype.c = function () { return this.rel; };
        Word.prototype.m = function () { return this.sic; };
        return Word;
    }(Link));
    exports.Word = Word;
    (function (RuleParent) {
        RuleParent[RuleParent["Quo"] = 0] = "Quo";
        RuleParent[RuleParent["Sic"] = 1] = "Sic"; // S
    })(exports.RuleParent || (exports.RuleParent = {}));
    var RuleParent = exports.RuleParent;
    /**
     * A rule of combination: a word as C1 followed in a sentence by another as C2 may be joined with R
     * C/R/C
     */
    var Rule = (function (_super) {
        __extends(Rule, _super);
        function Rule(c1, r, c2) {
            _super.call(this, LinkType.Rule, c1, r, c2);
            this.parent = RuleParent.Quo;
        }
        Rule.prototype.setParentQuo = function () { this.parent = RuleParent.Quo; };
        Rule.prototype.setParentSic = function () { this.parent = RuleParent.Sic; };
        Rule.prototype.isParentQuo = function () { return this.parent === RuleParent.Quo; };
        Rule.prototype.isParentSic = function () { return this.parent === RuleParent.Sic; };
        Rule.prototype.getParent = function () {
            return (this.parent === RuleParent.Quo) ? this.quo : this.sic;
        };
        Rule.prototype.getDependent = function () {
            return (this.parent === RuleParent.Quo) ? this.sic : this.quo;
        };
        Rule.prototype.c1 = function () { return this.quo; };
        Rule.prototype.r = function () { return this.rel; };
        Rule.prototype.c2 = function () { return this.sic; };
        return Rule;
    }(Link));
    exports.Rule = Rule;
    /**
     * A C-switch: the category for a word C1 is switched to C3 when the word is processed by a rule C1/R/C3
     * C/C/C
     */
    var CSwitch = (function (_super) {
        __extends(CSwitch, _super);
        function CSwitch(c1, c2, c3) {
            _super.call(this, LinkType.CSwitch, c1, c2, c3);
        }
        CSwitch.prototype.c1 = function () { return this.quo; };
        CSwitch.prototype.c2 = function () { return this.rel; };
        CSwitch.prototype.c3 = function () { return this.sic; };
        return CSwitch;
    }(Link));
    exports.CSwitch = CSwitch;
    /**
     * Delivery of a proposition: concepts M1 and M2 are related as R
     * M/R/M
     */
    var Delivery = (function (_super) {
        __extends(Delivery, _super);
        function Delivery(m1, r, m2) {
            _super.call(this, LinkType.Delivery, m1, r, m2);
        }
        return Delivery;
    }(Link));
    exports.Delivery = Delivery;
});
define("Network", ["require", "exports"], function (require, exports) {
    "use strict";
    var Junction = (function () {
        function Junction() {
        }
        return Junction;
    }());
    exports.Junction = Junction;
    var Network = (function () {
        function Network(input) {
            this.junctions = [];
            this.input = input;
        }
        /**
         * Export to vis.js
         */
        Network.prototype.toVisJS = function () {
            // Palette: https://coolors.co/8bc3e4-aadaba-fba2a6-fdd892-eeebdd
            var colour = {
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
            };
            var ret = {
                node_ids: [],
                nodes: [],
                edges: []
            };
            function pushNode(ret, n) {
                var id = n.key;
                if (ret.node_ids.indexOf(id) > -1)
                    return id; // avoid adding same node twice
                ret.nodes.push({
                    id: id,
                    label: n.label,
                    title: n.key,
                    color: colour.node[n.typeString()]
                });
                ret.node_ids.push(id);
                return id;
            }
            function pushWord(ret, w) {
                var p_id = pushNode(ret, w.p());
                var c_id = pushNode(ret, w.c());
                var m_id = pushNode(ret, w.m());
                ret.edges.push({ from: p_id, to: m_id, arrows: 'to', color: colour.link.PCM });
                ret.edges.push({ from: p_id, to: c_id, color: colour.link.PCM });
                ret.edges.push({ from: c_id, to: m_id, color: colour.link.PCM });
                return { c_id: c_id, m_id: m_id };
            }
            for (var _i = 0, _a = this.junctions; _i < _a.length; _i++) {
                var j = _a[_i];
                var lw = pushWord(ret, j.left.word);
                var rw = pushWord(ret, j.right.word);
                var r_id = pushNode(ret, j.rule.r());
                // CRC
                ret.edges.push({ from: lw.c_id, to: rw.c_id, arrows: 'to', color: colour.link.CRC });
                ret.edges.push({ from: lw.c_id, to: r_id, color: colour.link.CRC });
                ret.edges.push({ from: rw.c_id, to: r_id, color: colour.link.CRC });
                // MRM
                ret.edges.push({ from: lw.m_id, to: rw.m_id, arrows: 'to', color: colour.link.MRM });
                ret.edges.push({ from: lw.m_id, to: r_id, color: colour.link.MRM });
                ret.edges.push({ from: rw.m_id, to: r_id, color: colour.link.MRM });
            }
            delete ret.node_ids;
            return ret;
        };
        return Network;
    }());
    exports.Network = Network;
});
/**
 * Functions for converting from raw JSON to actual objects
 */
define("DataConverter", ["require", "exports", "Node", "Link"], function (require, exports, Node_1, Link_1) {
    "use strict";
    // ---------------------------------------------------------------------------
    // -- Generic make functions
    function mkNode(data) {
        switch (data.type) {
            case 'P': return mkPNode(data);
            case 'C': return mkCNode(data);
            case 'M': return mkMNode(data);
            case 'R': return mkRNode(data);
            default:
                console.error("Cannot convert item: " + JSON.stringify(data));
                return null;
        }
    }
    exports.mkNode = mkNode;
    function mkLink(data, nodeDict) {
        switch (data.type) {
            case 'PCM': return mkWord(data, nodeDict);
            case 'CRC': return mkRule(data, nodeDict);
            case 'CCC': return mkCSwitch(data, nodeDict);
            case 'MRM': return mkDelivery(data, nodeDict);
            default:
                console.error("Cannot convert item: " + JSON.stringify(data));
                return null;
        }
    }
    exports.mkLink = mkLink;
    // ---------------------------------------------------------------------------
    // -- Making Nodes
    /**
     * Make a PNode object from raw data
     */
    function mkPNode(data) {
        if (data.type && data.type !== "P") {
            console.error("Cannot convert to PNode: " + JSON.stringify(data));
            return null;
        }
        return new Node_1.PNode(data.key, data.label);
    }
    exports.mkPNode = mkPNode;
    /**
     * Make a CNode object from raw data
     */
    function mkCNode(data) {
        if (data.type && data.type !== "C") {
            console.error("Cannot convert to CNode: " + JSON.stringify(data));
            return null;
        }
        return new Node_1.CNode(data.key, data.label);
    }
    exports.mkCNode = mkCNode;
    /**
     * Make a PNode object from raw data
     */
    function mkMNode(data) {
        if (data.type && data.type !== "M") {
            console.error("Cannot convert to MNode: " + JSON.stringify(data));
            return null;
        }
        return new Node_1.MNode(data.key, data.label);
    }
    exports.mkMNode = mkMNode;
    /**
     * Make a RNode object from raw data
     */
    function mkRNode(data) {
        if (data.type && data.type !== "R") {
            console.error("Cannot convert to RNode: " + JSON.stringify(data));
            return null;
        }
        return new Node_1.RNode(data.key, data.label);
    }
    exports.mkRNode = mkRNode;
    // ---------------------------------------------------------------------------
    // -- Making Links
    /**
     * Make a Word object from raw data
     */
    function mkWord(data, nodeDict) {
        if (data.type && data.type !== "PCM") {
            console.error("Cannot convert to Word: " + JSON.stringify(data));
            return null;
        }
        var o = new Link_1.Word(nodeDict[data.quo.key], nodeDict[data.rel.key], nodeDict[data.sic.key]);
        o.setStatusStr(data.status);
        return o;
    }
    exports.mkWord = mkWord;
    /**
     * Make a Rule object from raw data
     */
    function mkRule(data, nodeDict) {
        if (data.type && data.type !== "CRC") {
            console.error("Cannot convert to Rule: " + JSON.stringify(data));
            return null;
        }
        var o = new Link_1.Rule(nodeDict[data.quo.key], nodeDict[data.rel.key], nodeDict[data.sic.key]);
        o.setStatusStr(data.status);
        if (data.quo.parent)
            o.setParentQuo();
        else if (data.sic.parent)
            o.setParentSic();
        return o;
    }
    exports.mkRule = mkRule;
    /**
     * Make a CSwitch object from raw data
     */
    function mkCSwitch(data, nodeDict) {
        if (data.type && data.type !== "CCC") {
            console.error("Cannot convert to CSwitch: " + JSON.stringify(data));
            return null;
        }
        var o = new Link_1.CSwitch(nodeDict[data.quo.key], nodeDict[data.rel.key], nodeDict[data.sic.key]);
        o.setStatusStr(data.status);
        return o;
    }
    exports.mkCSwitch = mkCSwitch;
    /**
     * Make a Delivery object from raw data
     */
    function mkDelivery(data, nodeDict) {
        if (data.type && data.type !== "MRM") {
            console.error("Cannot convert to Delivery: " + JSON.stringify(data));
            return null;
        }
        var o = new Link_1.Delivery(nodeDict[data.quo.key], nodeDict[data.rel.key], nodeDict[data.sic.key]);
        o.setStatusStr(data.status);
        return o;
    }
    exports.mkDelivery = mkDelivery;
    // ---------------------------------------------------------------------------
    // -- Un-making Nodes/Links into serialisable JSON objects
    /**
     * Serialise Node to JSON object
     */
    function serNode(node) {
        return {
            type: Node_1.NodeType[node.type],
            key: node.key,
            label: node.label
        };
    }
    exports.serNode = serNode;
    /**
     * Serialise Link to JSON object
     */
    function serLink(link) {
        var obj = {
            type: null,
            quo: { key: link.quo.key },
            rel: { key: link.rel.key },
            sic: { key: link.sic.key },
            status: Link_1.LinkStatus[link.status]
        };
        switch (link.type) {
            case Link_1.LinkType.Word:
                obj.type = "PCM";
                break;
            case Link_1.LinkType.Rule:
                obj.type = "CRC";
                break;
            case Link_1.LinkType.CSwitch:
                obj.type = "CCC";
                break;
            case Link_1.LinkType.Delivery:
                obj.type = "MRM";
                break;
        }
        if (link.type === Link_1.LinkType.Rule) {
            if (link.isParentQuo()) {
                obj.quo['parent'] = true;
            }
            else {
                obj.rel['parent'] = true;
            }
        }
        return obj;
    }
    exports.serLink = serLink;
});
/**
 * A static, synchronous data layer where all data is hardcoded
 * Just for prototyping purposes
 */
define("DataLayerSync", ["require", "exports", "Node", "Link", "DataConverter"], function (require, exports, Node_2, Link_2, DC) {
    "use strict";
    // --------------------------------------------------------------------------
    var DataLayerSync = (function () {
        function DataLayerSync(data) {
            this.nodes = [];
            this.links = [];
            var nodesJSON = data.nodes;
            var linksJSON = data.links;
            // Convert JSON lists into lists of actual JS objects
            // One instance for every DB entry
            // Links point to Node instances
            var nodeDict = {};
            for (var _i = 0, nodesJSON_1 = nodesJSON; _i < nodesJSON_1.length; _i++) {
                var n = nodesJSON_1[_i];
                var node = DC.mkNode(n);
                this.nodes.push(node);
                nodeDict[n.key] = node;
            }
            this.links = linksJSON.map(function (l) {
                return DC.mkLink(l, nodeDict);
            });
        }
        // --------------------------------------------------------------------------
        // --- Nodes
        /**
         * Find a PNode by its label.
         * This is something like a lexicon lookup.
         */
        DataLayerSync.prototype.findPNode = function (label) {
            for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
                var node = _a[_i];
                if (node.type === Node_2.NodeType.P && node.label === label) {
                    return node;
                }
            }
            return null;
        };
        // --------------------------------------------------------------------------
        // --- Links
        /**
         * Find Words (P/C/M) for given nodes
         */
        DataLayerSync.prototype.findWords = function (quo, rel, sic) {
            var words = [];
            for (var _i = 0, _a = this.links; _i < _a.length; _i++) {
                var link = _a[_i];
                if (link.type === Link_2.LinkType.Word)
                    if (!quo || link.quo === quo) {
                        if (!rel || link.rel === rel) {
                            if (!sic || link.sic === sic) {
                                words.push(link);
                            }
                        }
                    }
            }
            return words;
        };
        /**
         * Find a Word (P/C/M) for a given PNode and CNode
         */
        DataLayerSync.prototype.findWord = function (pnode, cnode) {
            var words = [];
            for (var _i = 0, _a = this.links; _i < _a.length; _i++) {
                var link = _a[_i];
                if (link.type === Link_2.LinkType.Word && link.quo === pnode && link.rel === cnode) {
                    words.push(link);
                }
            }
            if (words.length === 0) {
                console.error('No words found for: ' + pnode.key + ' / ' + cnode.key);
                return null;
            }
            else if (words.length > 1) {
                console.error('More than one word found for: ' + pnode.key + ' / ' + cnode.key);
                return words[0];
            }
            else {
                return words[0];
            }
        };
        /**
         * Find Rules (C/R/C) for given nodes
         */
        DataLayerSync.prototype.findRules = function (quo, rel, sic) {
            var rules = [];
            for (var _i = 0, _a = this.links; _i < _a.length; _i++) {
                var link = _a[_i];
                if (link.type === Link_2.LinkType.Rule)
                    if (!quo || link.quo === quo) {
                        if (!rel || link.rel === rel) {
                            if (!sic || link.sic === sic) {
                                rules.push(link);
                            }
                        }
                    }
            }
            return rules;
        };
        /**
         * Find a (single) C-Switch (C/C/C) for 2 given CNodes
         */
        DataLayerSync.prototype.findCSwitch = function (quo, sic) {
            for (var _i = 0, _a = this.links; _i < _a.length; _i++) {
                var link = _a[_i];
                if (link.type === Link_2.LinkType.CSwitch && link.quo === quo && link.sic === sic) {
                    return link;
                }
            }
            return null;
        };
        /**
         * Find Deliveries (M/R/M) where either (but not both) QUO or SIC is in a list of M keys
         */
        DataLayerSync.prototype.findDeliveries = function (ms) {
            var dels = [];
            var in_ms = function (x) {
                for (var _i = 0, ms_1 = ms; _i < ms_1.length; _i++) {
                    var m = ms_1[_i];
                    if (x === m)
                        return true;
                }
                return false;
            };
            for (var _i = 0, _a = this.links; _i < _a.length; _i++) {
                var link = _a[_i];
                var quo_in_ms = in_ms(link.quo);
                var sic_in_ms = in_ms(link.sic);
                if (link.type === Link_2.LinkType.Delivery && (quo_in_ms != sic_in_ms)) {
                    dels.push(link);
                }
            }
            return dels;
        };
        /**
         * Get all provisional rules and words
         * NOTE This is probably not good design and should be avoided
         */
        DataLayerSync.prototype.getProvisionalLinks = function () {
            var obj = {
                rules: [],
                words: []
            };
            for (var _i = 0, _a = this.links; _i < _a.length; _i++) {
                var link = _a[_i];
                if (link.status === Link_2.LinkStatus.ProvisionalJunction || link.status === Link_2.LinkStatus.ProvisionalNotUsedYet) {
                    if (link.type === Link_2.LinkType.Rule) {
                        obj.rules.push(link);
                    }
                    if (link.type === Link_2.LinkType.Word) {
                        obj.words.push(link);
                    }
                }
            }
            return obj;
        };
        return DataLayerSync;
    }());
    exports.DataLayerSync = DataLayerSync;
});
define("Parser", ["require", "exports", "Link", "Network", "DataLayerSync"], function (require, exports, Link_3, Network_1, DataLayerSync_1) {
    "use strict";
    // --------------------------------------------------------------------------
    var ParseState = (function () {
        function ParseState(input) {
            this.tokens = input.split(' ');
            this.list = [];
            // this.dlist = []
            this.network = new Network_1.Network(this.tokens);
            this.stack = [];
            this.left = null;
            this.right = null;
            this.rule = null;
        }
        ParseState.prototype.setLeft = function (lx) {
            this.lx = lx;
            this.left = this.stack[lx];
        };
        ParseState.prototype.setRight = function (rx) {
            this.rx = rx;
            this.right = this.stack[rx];
        };
        return ParseState;
    }());
    var StackItem = (function () {
        function StackItem() {
        }
        return StackItem;
    }());
    var Flag;
    (function (Flag) {
        Flag[Flag["DoesNotFit"] = 0] = "DoesNotFit";
        Flag[Flag["NotYetParticipated"] = 1] = "NotYetParticipated";
        Flag[Flag["OnlyParticipatedAsParent"] = 2] = "OnlyParticipatedAsParent";
        Flag[Flag["ActivationUsed"] = 3] = "ActivationUsed"; // 3
    })(Flag || (Flag = {}));
    // --------------------------------------------------------------------------
    /** Some general notes, relating to NGD 1.0 document **
    
    p_seq = i
    p_string = tokens[i]
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
    var Parser = (function () {
        //
        function Parser(data) {
            this.DB = new DataLayerSync_1.DataLayerSync(data);
            // NOTE: this is probably bad design
            this.provisionals = this.DB.getProvisionalLinks();
            this.logs = {
                'default': [],
                'output': []
            };
        }
        /**
         * Add message to log
         */
        Parser.prototype.log = function (s0, s1) {
            var whichLog;
            var logThing;
            if (typeof s0 === 'string') {
                if (this.logs.hasOwnProperty(s0)) {
                    whichLog = s0;
                    logThing = s1;
                }
                else {
                    whichLog = 'default';
                    logThing = s0;
                }
            }
            else {
                whichLog = 'default';
                logThing = s0;
            }
            if (typeof logThing === 'string') {
                this.logs[whichLog].push(logThing);
            }
            else {
                this.logs[whichLog].push(JSON.stringify(logThing, null, 2));
            }
        };
        /**
         * Get entire log as single string
         */
        Parser.prototype.getLog = function (whichLog) {
            if (whichLog && this.logs.hasOwnProperty(whichLog)) {
                return this.logs[whichLog].join("\n");
            }
            else {
                return this.logs['default'].join("\n");
            }
        };
        /**
         * Single parse iteration
         */
        Parser.prototype.parse = function (input, callback) {
            // NOTE: maybe we don't want to pass this about, but instead make it a class instance?
            var st = new ParseState(input);
            this.log("INPUT: " + input);
            this.log('--------------------');
            // For each p_string
            for (var i in st.tokens) {
                var token = st.tokens[i];
                // Get PNode corresponding to token
                var pnode = this.DB.findPNode(token);
                if (!pnode) {
                    return callback("Cannot find PNode for: " + token);
                }
                // Find Words where quo == PNode
                var words = this.DB.findWords(pnode);
                if (!words || words.length === 0) {
                    return callback("Cannot find any Words for PNode: " + pnode.key);
                }
                // For each matching word, add to stack
                for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
                    var word = words_1[_i];
                    // w_status == 'W' or 'Y'
                    if (word.status !== Link_3.LinkStatus.InUse && word.status !== Link_3.LinkStatus.ProvisionalNotUsedYet) {
                        continue;
                    }
                    var item = new StackItem();
                    item.cnode = word.c();
                    item.pnode = pnode;
                    item.pos = parseInt(i);
                    item.token = token;
                    item.status = word.status;
                    item.flag = Flag.NotYetParticipated;
                    st.stack.push(item);
                }
                // 4. Pair entries in stack where left flag == 1 or 2
                for (var rx = st.stack.length - 1; rx >= 0; rx--) {
                    st.setRight(rx);
                    if (st.right.flag !== Flag.NotYetParticipated)
                        continue;
                    for (var lx = rx - 1; lx >= 0; lx--) {
                        st.setLeft(lx);
                        if (st.left.flag !== Flag.NotYetParticipated && st.left.flag !== Flag.OnlyParticipatedAsParent)
                            continue;
                        this.log("PAIR₁: " + st.left.token + "___" + st.right.token);
                        this.pairOfCs(st);
                        this.log('--------------------');
                    }
                }
                // Pair again where left flag == 3
                for (var rx = st.stack.length - 1; rx >= 0; rx--) {
                    st.setRight(rx);
                    if (st.right.flag !== Flag.NotYetParticipated)
                        continue;
                    for (var lx = rx - 1; lx >= 0; lx--) {
                        st.setLeft(lx);
                        if (st.left.flag !== Flag.ActivationUsed)
                            continue;
                        this.log("PAIR₂: " + st.left.token + "___" + st.right.token);
                        this.pairOfCs(st);
                        this.log('--------------------');
                    }
                }
            }
            this.sentenceEnd(st);
            // We're done
            return callback(null, {
                // output: st.dlist,
                network: st.network,
                // parseState: st,
                provisionals: this.provisionals,
                log: this.getLog('default'),
                output: this.getLog('output')
            });
        };
        /**
         * Run on each pair of C's
         */
        Parser.prototype.pairOfCs = function (st) {
            var rules = this.DB.findRules(st.left.cnode, null, st.right.cnode);
            if (!rules || rules.length === 0)
                return;
            var last_used_rule = null;
            // ----------------------------
            this.log("STACK");
            for (var _i = 0, _a = st.stack; _i < _a.length; _i++) {
                var item = _a[_i];
                this.log("- CNode: " + item.cnode.key + " " + item.cnode.label);
                this.log("  PNode: " + item.pnode.key + " " + item.pnode.label + " (" + item.pos + ")");
                this.log("   Stat: " + Link_3.LinkStatus[item.status]);
                this.log("   Flag: " + Flag[item.flag] + " (" + item.flag + ")");
            }
            this.log("RULES");
            for (var _b = 0, rules_1 = rules; _b < rules_1.length; _b++) {
                var rule = rules_1[_b];
                this.log("- Quo: " + rule.quo.key + " " + rule.quo.label);
                if (rule.rel) {
                    this.log("  Rel: " + rule.rel.key + " " + rule.rel.label);
                }
                else {
                    this.log("  Rel: undefined");
                }
                this.log("  Sic: " + rule.sic.key + " " + rule.sic.label);
                this.log(" Stat: " + Link_3.LinkStatus[rule.status]);
                this.log("  Par: " + (rule.isParentQuo() ? 'Q' : 'S'));
            }
            // ----------------------------
            for (var _c = 0, rules_2 = rules; _c < rules_2.length; _c++) {
                var rule = rules_2[_c];
                st.rule = rule;
                // r_status != W or Y
                if (rule.status !== Link_3.LinkStatus.InUse && rule.status !== Link_3.LinkStatus.ProvisionalNotUsedYet) {
                    continue;
                }
                // r_parent == Q and s_fleft == 3
                if (rule.isParentQuo() && st.left.flag === Flag.ActivationUsed) {
                    continue;
                }
                last_used_rule = rule;
                // Discard any other C's for these words
                for (var x = st.stack.length - 1; x >= 0; x--) {
                    if (x === st.lx || x === st.rx)
                        continue;
                    if (st.stack[x].flag === Flag.NotYetParticipated &&
                        (st.stack[x].pos === st.left.pos || st.stack[x].pos === st.right.pos)) {
                        st.stack[x].flag = Flag.DoesNotFit;
                    }
                }
                // if r_status == Y, r_status = Z
                if (rule.status === Link_3.LinkStatus.ProvisionalNotUsedYet) {
                    rule.status = Link_3.LinkStatus.ProvisionalJunction;
                }
                // if s_sright == Y, s_sright = Z
                if (st.right.status === Link_3.LinkStatus.ProvisionalNotUsedYet) {
                    st.right.status = Link_3.LinkStatus.ProvisionalJunction;
                }
                // if s_sleft == Y, s_left = Z
                if (st.left.status === Link_3.LinkStatus.ProvisionalNotUsedYet) {
                    st.left.status = Link_3.LinkStatus.ProvisionalJunction;
                }
                if (!rule.rel) {
                    this.switchCs(st);
                }
                else {
                    // if r_parent == S, s_fright = 2 and s_fleft = 3
                    if (rule.parent === Link_3.RuleParent.Sic) {
                        st.right.flag = Flag.OnlyParticipatedAsParent; // 2
                        st.left.flag = Flag.ActivationUsed; // 3
                    }
                    // if r_parent == Q, s_fright = 3 and unless s_fleft already == 3, s_fleft = 2
                    if (rule.parent === Link_3.RuleParent.Quo) {
                        st.right.flag = Flag.ActivationUsed; // 3
                        if (st.left.flag !== Flag.ActivationUsed) {
                            st.left.flag = Flag.OnlyParticipatedAsParent; // 2
                        }
                    }
                    this.displayProposition(st);
                }
            } // for rule of rules
            if (last_used_rule !== null) {
                st.rule = last_used_rule;
                this.switchCs(st);
            }
        };
        /**
         * Switch-Cs function
         */
        Parser.prototype.switchCs = function (st) {
            // this.log('> in switchCs')
            // NOTE: what if there's more than one matching C-switch?
            var cswitch1 = this.DB.findCSwitch(st.rule.c1(), st.rule.c2()); // r_quonode + r_sicnode + ***
            if (cswitch1 && cswitch1.status === Link_3.LinkStatus.InUse) {
                st.left.cnode = cswitch1.c3(); // s_node = c_sicnode
            }
            var cswitch2 = this.DB.findCSwitch(st.rule.c2(), st.rule.c1()); // r_sicnode + r_quonode + ***
            if (cswitch2 && cswitch2.status === Link_3.LinkStatus.InUse) {
                st.right.cnode = cswitch2.c3(); // s_node = c_sicnode
            }
        };
        /**
         * Display proposition function
         */
        Parser.prototype.displayProposition = function (st) {
            // this.log('> in displayProposition')
            // The parent and dependent words are identified in the stack.
            // The higher entry in the stack gives the parent word if the successful RULE record has r_parent = ‘S’, or dependent if r_parent = ‘Q’.
            // The lower entry gives the other word in the junction.
            var par;
            var dep;
            if (st.rule.isParentSic()) {
                par = st.right;
                dep = st.left;
            }
            else {
                par = st.left;
                dep = st.right;
            }
            var parW = this.DB.findWord(par.pnode, par.cnode);
            var depW = this.DB.findWord(dep.pnode, dep.cnode);
            var parM = parW.m(); // first n_label in MRM
            var depM = depW.m(); // third n_label in MRM
            st.list.push(parM);
            st.list.push(depM);
            var r = st.rule.r();
            var d = new Link_3.Delivery(parM, r, depM);
            // st.dlist.push(d)
            // TODO: left/right VS par/dep
            var j = new Network_1.Junction();
            j.left = {
                word: parW,
                pos: par.pos,
                token: par.token
            };
            j.right = {
                word: depW,
                pos: dep.pos,
                token: dep.token
            };
            j.rule = st.rule;
            j.delivery = d;
            st.network.junctions.push(j);
            this.log('PROPOSITION: ' + parM.key + ' ' + parM.label + ' / ' + r.key + ' ' + r.label + ' / ' + depM.key + ' ' + depM.label);
        };
        /**
         * At sentence end function
         */
        Parser.prototype.sentenceEnd = function (st) {
            // this.log('> in sentenceEnd')
            var entries = [];
            // Work top-down through the stack looking for entries with s_flag == 1
            for (var x = st.stack.length - 1; x >= 0; x--) {
                if (st.stack[x].flag === Flag.NotYetParticipated) {
                    entries.push(st.stack[x]);
                }
            }
            // If there are no such entries
            if (entries.length === 0) {
                for (var _i = 0, _a = this.provisionals.rules; _i < _a.length; _i++) {
                    var rule = _a[_i];
                    // Make permanent any provisional rule that contributed to the successful parse
                    if (rule.status === Link_3.LinkStatus.ProvisionalJunction) {
                        rule.status = Link_3.LinkStatus.InUse;
                    }
                    // Delete any provisional rule that did not contribute to the successful parse
                    if (rule.status === Link_3.LinkStatus.ProvisionalNotUsedYet) {
                        rule.status = Link_3.LinkStatus.Deleted;
                    }
                }
                for (var _b = 0, _c = st.stack; _b < _c.length; _b++) {
                    var item = _c[_b];
                    if (item.status === Link_3.LinkStatus.ProvisionalJunction || item.status === Link_3.LinkStatus.ProvisionalNotUsedYet) {
                        // Get word for token
                        var itemW = this.DB.findWord(item.pnode, item.cnode);
                        // Make permanent any provisional word that contributed to the successful parse
                        // These words should already be in this.provisional.words
                        if (item.status === Link_3.LinkStatus.ProvisionalJunction) {
                            if (itemW.status === Link_3.LinkStatus.ProvisionalJunction) {
                                itemW.status = Link_3.LinkStatus.InUse;
                            }
                        }
                        // Delete any provisional word that did not contribute to the successful parse
                        // These words should already be in this.provisional.words
                        if (item.status === Link_3.LinkStatus.ProvisionalNotUsedYet) {
                            if (itemW.status === Link_3.LinkStatus.ProvisionalNotUsedYet) {
                                itemW.status = Link_3.LinkStatus.Deleted;
                            }
                        }
                    }
                }
                this.log('output', 'Sentence is grammatical');
            }
            else {
                // Delete all provisional rules
                for (var _d = 0, _e = this.provisionals.rules; _d < _e.length; _d++) {
                    var rule = _e[_d];
                    rule.status = Link_3.LinkStatus.Deleted;
                }
                // Delete all provisional words
                for (var _f = 0, _g = this.provisionals.words; _f < _g.length; _f++) {
                    var word = _g[_f];
                    word.status = Link_3.LinkStatus.Deleted;
                }
                // See which token positions are involved
                var poss = [];
                for (var _h = 0, entries_1 = entries; _h < entries_1.length; _h++) {
                    var entry = entries_1[_h];
                    if (poss.indexOf(entry.pos) === -1) {
                        poss.push(entry.pos);
                    }
                }
                poss.sort();
                // If there are two or more such entries with different s_seq values
                if (poss.length >= 2) {
                    // for each of these s_seq values
                    for (var _j = 0, poss_1 = poss; _j < poss_1.length; _j++) {
                        var pos = poss_1[_j];
                        // Display a line with the p_string for s_seq followed by ‘ungrammatical: string cannot be linked’.
                        this.log('output', 'Ungrammatical: token "' + st.tokens[pos] + '" cannot be linked');
                    }
                }
                else if (poss.length == 1) {
                    // If there is only one orphan p_string (only one s_seq value occurs with s_flag = ‘1’)
                    this.log('output', 'Token "' + poss[0] + '" cannot be linked');
                    this.log('output', 'Trying to infer new links');
                    this.inferringLinks(poss[0], st);
                }
                else {
                    // This is a HARD error
                    console.error("Unexpected length for poss.length: " + poss.length);
                }
            }
        };
        /**
         * Infer links function
         */
        Parser.prototype.inferringLinks = function (orphan_pos, st) {
            // this.log('> in inferringLinks')
            var orphanP = this.DB.findPNode(st.tokens[orphan_pos]);
            // let x_key = orphanP.key
            // For each record in DELIVERY with d_quonode or d_sicnode, but not both, matching an l_list entry
            var dels = this.DB.findDeliveries(st.list);
            for (var _i = 0, dels_1 = dels; _i < dels_1.length; _i++) {
                var del = dels_1[_i];
                // For each p_string in the sentence except the orphan
                for (var i = st.tokens.length; i < st.tokens.length && i != orphan_pos; i++) {
                    // let x_orphan
                    // if (i < orphan_pos) x_orphan = "L"
                    // else x_orphan = "R"
                    var orphanLeft = (i < orphan_pos);
                    var p = this.DB.findPNode(st.tokens[i]);
                    // Try same thing both ways round
                    for (var _a = 0, _b = [del.quo, del.sic]; _a < _b.length; _a++) {
                        var x_sicnode = _b[_a];
                        var words = this.DB.findWords(p, null, x_sicnode);
                        for (var _c = 0, words_2 = words; _c < words_2.length; _c++) {
                            var word = words_2[_c];
                            var x_relnode = word.rel;
                            // Find C_b instances
                            var words_3 = this.DB.findWords(orphanP, null, x_sicnode);
                            for (var _d = 0, words_4 = words_3; _d < words_4.length; _d++) {
                                var word_1 = words_4[_d];
                                // Provisional rule
                                var quo = void 0;
                                var rel = void 0;
                                var sic = void 0;
                                if (!orphanLeft) {
                                    // x_orphan == R
                                    quo = word_1.rel;
                                    rel = del.rel;
                                    sic = x_relnode;
                                }
                                else {
                                    // x_orphan == L
                                    quo = x_relnode;
                                    rel = del.rel;
                                    sic = word_1.rel;
                                }
                                if (this.DB.findRules(quo, rel, sic).length == 0) {
                                    var rule1 = new Link_3.Rule(quo, rel, sic);
                                    rule1.status = Link_3.LinkStatus.ProvisionalNotUsedYet;
                                    rule1.setParentQuo();
                                    this.provisionals.rules.push(rule1);
                                    var rule2 = new Link_3.Rule(quo, rel, sic);
                                    rule2.status = Link_3.LinkStatus.ProvisionalNotUsedYet;
                                    rule2.setParentSic();
                                    this.provisionals.rules.push(rule2);
                                }
                            }
                            // Find C_c instances
                            var rules = this.DB.findRules(word.rel, del.rel, null);
                            for (var _e = 0, rules_3 = rules; _e < rules_3.length; _e++) {
                                var rule = rules_3[_e];
                                // Provisional word
                                var word_2 = new Link_3.Word(orphanP, x_relnode, x_sicnode);
                                word_2.status = Link_3.LinkStatus.ProvisionalNotUsedYet;
                                this.provisionals.words.push(word_2);
                            }
                        }
                    }
                }
            }
        };
        return Parser;
    }());
    exports.Parser = Parser;
});
