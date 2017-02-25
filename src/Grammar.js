/** The class generates regex _parsers for simple regular languages
 *  based on grammar rules */
class Grammar {

    constructor (rules) {
        this._triplets = Object.create(null);
        this._rules = rules;
        // {RULE: regex_str}
        this._parsers = Object.create(null);
        this._patterns = Object.create(null);
        for (const key in rules) {
            if (rules[key].constructor === RegExp) {
                this._patterns[key] = rules[key].source;
            }
        }
        this._splitters = Object.create(null);
    }

    /** Tells whether a text matches a grammar rule.
     *  @returns {Boolean} */
    is (text, rule) {
        const splitter = this.parser(rule);
        if (!splitter) throw new Error('rule unknown');
        splitter.lastIndex = 0;
        const m = splitter.exec(text);
        return m && m[0].length === text.length;
    }

    hasRule (name) {
        return name in this._rules;
    }

    triplets (rule_name) {
        if (rule_name in this._triplets) { return this._triplets[rule_name]; }
        const ret = [];
        this._triplets[rule_name] = ret;
        const rule = this._rules[rule_name];
        if (rule === undefined) { throw new Error('unknown rule: ' + rule_name); }
        Grammar.TRIPLET_RE.lastIndex = 0;
        let m = null;
        while (m = Grammar.TRIPLET_RE.exec(rule)) {
            const triplet = {
                formula: m[0],
                marker: m[1] || '',
                rule: m[2],
                quantifier: m[3] || '',
                repeating: m[3] === '*' || m[3] === '+',
            };
            ret.push(triplet);
        }
        return ret;
    }


    parser (rule_name) {
        if (rule_name in this._parsers) { return this._parsers[rule_name]; }
        const pattern = this.pattern(rule_name);
        const re = new RegExp('^\\s*' + pattern + '\\s*$', 'm');
        this._parsers[rule_name] = re;
        return re;
    }


    splitter (triplet) {
        const t = triplet;
        if (this._splitters[t.formula]) { return this._splitters[t.formula]; }
        let p = (t.marker.length === 1 ? '\\' : '') + t.marker;
        p += '(' + this.pattern(t.rule) + ')';
        const splitter = new RegExp(p, 'g');
        this._splitters[t.formula] = splitter;
        return splitter;
    }


    pattern (rule_name) {
        if (rule_name in this._patterns) { return this._patterns[rule_name]; }
        const triplets = this.triplets(rule_name);
        const is_chain = triplets.every(t => t.quantifier !== '|');
        const pattern = triplets.map((t) => {
            let ret = sterilize(this.pattern(t.rule));
            if (t.marker.length > 1) {
                ret = t.marker + ret;
            }
            if (!t.repeating) { ret = '(' + ret + ')'; }
            if (t.marker.length === 1) {
                ret = '\\' + t.marker + ret;
            }
            if (t.quantifier && t.quantifier !== '|') {
                ret = '(?:' + ret + ')' + t.quantifier;
            }
            if (t.repeating) {
                ret = '(' + ret + ')';
            }
            return ret;
        });
        this._patterns[rule_name] = pattern.join(is_chain ? '\\s*' : '|');

        return this._patterns[rule_name];
    }

    /** Splits the text into parts according to the rule, clears whitespace
     *  and punctuation.
     *  @returns {Array} an aray of parts; single-occurrence parts as strings,
     *  repeated parts as arrays of strings */
    split (text, rule_name) {
        const ret = [];
        const parser = this.parser(rule_name);
        if (!parser) throw new Error('unknown rule');
        const triplets = this.triplets(rule_name);
        parser.lastIndex = 0;
        const m = parser.exec(text);
        if (!m) { throw new Error('grammar violation'); }
        for (let i = 0; i < triplets.length; i++) {
            const triplet = triplets[i];
            const match = m[i + 1];
            if (triplet.repeating) {
                const splitter = this.splitter(triplet);
                const items = [];
                ret.push(items);
                let s = null;
                splitter.lastIndex = 0;
                while (s = splitter.exec(match)) { items.push(s[1]); }
            } else {
                ret.push(match);
            }
        }
        return ret;
    }

    /** test the text against this grammar
     * @returns {Array} an array of rule names this text matches */
    test (text) {
        return Object.keys(this._rules).filter(rule => this.is(text, rule));
    }

}

Grammar.TRIPLET_RE = /(\[.*?\]|[^A-Za-z0-9\s]?)([A-Z][A-Z0-9_]+)([*+?|]?)/g;

function sterilize (pattern) {
    return pattern.replace(/\((\?:)?/g, '(?:');
}

module.exports = Grammar;
