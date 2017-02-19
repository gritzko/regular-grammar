"use strict";

/** The class generates regex _parsers for simple regular languages
 *  based on grammar rules */
class Grammar {

    constructor (rules) {
        this._triplets = Object.create(null);
        this._rules = rules;
        // {RULE: regex_str}
        this._parsers = Object.create(null);
        this._patterns = Object.create(null);
        for(let key in rules)
            if (rules[key].constructor===RegExp) {
                this._patterns[key] = rules[key].source;
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
        return m && m[0].length===text.length;
    }

    triplets (rule_name) {
        if (rule_name in this._triplets)
            return this._triplets[rule_name];
        const ret = this._triplets[rule_name] = [];
        const rule = this._rules[rule_name];
        if (rule===undefined)
            throw new Error('unknown rule: '+rule_name);
        Grammar.TRIPLET_RE.lastIndex = 0;
        let m = null;
        while(m=Grammar.TRIPLET_RE.exec(rule)) {
            ret.push ({
                marker:     m[1]||'',
                rule:       m[2],
                quantifier: m[3]||''
            });
        }
        return ret;
    }


    parser (rule_name) {
        if (rule_name in this._parsers)
            return this._parsers[rule_name];
        const pattern = this.pattern(rule_name);
        return this._parsers[rule_name] = new RegExp('^\\s*'+pattern+'\\s*$', 'm');
    }


    pattern (rule_name) {
        if (rule_name in this._patterns)
            return this._patterns[rule_name];
        const triplets = this.triplets(rule_name);
        const is_chain = triplets.every( t => t.quantifier!=='|' );
        const pattern = triplets.map( t => {
            const repeat = t.quantifier in repeat_quantifiers;
            let ret = sterilize(this.pattern(t.rule));
            if (!repeat)
                ret = '(' + ret + ')';
            if (t.marker) {
                ret = (t.marker.length===1 ? '\\':'') + t.marker + ret;
            }
            if (t.quantifier && t.quantifier!=='|') {
                ret = '(?:' + ret + ')' + t.quantifier;
            }
            if (repeat) {
                ret = '(' + ret + ')';

            }
            return ret;

        } );
        this._patterns[rule_name] = pattern.join(is_chain ? '\\s*' : '|');

        return this._patterns[rule_name];
    }

    /** Splits the text into parts according to the rule, clears whitespace
     *  and punctuation.
     *  @returns {Array} an aray of parts; single-occurrence parts as strings,
     *  repeated parts as arrays of strings */
    split (rule_name, text) {
        const ret = [];
        const parser = this.parser(rule_name);
        if (!parser) throw new Error('unknown rule');
        const triplets = this.triplets(rule_name);
        parser.lastIndex = 0;
        const m = parser.exec(text);
        if (!m) throw new Error('grammar violation');
        for(let i=0; i<triplets.length; i++) {
            const match = m[i+1];
            if (triplets[i].quantifier in repeat_quantifiers) {
                const items = match.split(triplets[i].marker);
                items.shift();
                ret.push(items);
            } else {
                ret.push(match);
            }
        }
        return ret;
    }

    /** test the text against this grammar
     * @returns {Array} an array of rule names this text matches */
    test (text) {
        return Object.keys(this._rules).filter(rule => this.is(text, rule) );
    }

}

Grammar.TRIPLET_RE =  /(\[.*?\]|[^A-Za-z0-9\s]?)([A-Z][A-Z0-9_]+)([\*\+\?\|]?)/g;

function sterilize (pattern) {
    return pattern.replace(/\((\?\:)?/g, '(?:');
}

const repeat_quantifiers = {'+':true, '*':true};

module.exports = Grammar;
