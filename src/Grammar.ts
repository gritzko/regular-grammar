import {Rules, Triplet} from './Types';

/** The class generates regex _parsers for simple regular languages
 *  based on grammar rules */
class Grammar {
    static readonly TRIPLET_RE = /(\[\S*?\]|("(?:\\.|[^"])*")|[^A-Za-z0-9\s])?([A-Z][A-Z0-9_]*)?([*+?|]|{\d+(?:,\d+)?})?/g;

    private _triplets = Object.create(null);
    private _rules: Rules & {EMPTY: RegExp};
    private _parsers: {[key: string]: RegExp} = Object.create(null);
    private _patterns: {[key: string]: string} = Object.create(null);
    private _splitters: {[key: string]: RegExp} = Object.create(null);

    constructor (rules: Rules) {
        this._rules = rules as (Rules & {EMPTY: RegExp});
        this._rules.EMPTY = new RegExp('');
        // {RULE: regex_str}
        for (const key in rules) {
            const rule = rules[key];
            if (rule instanceof RegExp) {
                this._patterns[key] = rule.source;
            }
        }
        this._patterns.EMPTY = '';
    }

    /** Tells whether a text matches a grammar rule.
     *  @returns {Boolean} */
    is (text: string, rule: string): boolean {
        const splitter = this.parser(rule);
        if (!splitter) throw new Error('rule unknown');
        splitter.lastIndex = 0;
        const m = splitter.exec(text);
        return m !== null && m[0].length === text.length;
    }

    hasRule (name: string): boolean {
        return name in this._rules;
    }

    triplets (rule_name: string): Triplet[] {
        if (rule_name in this._triplets) { return this._triplets[rule_name]; }
        const ret: Triplet[] = [];
        this._triplets[rule_name] = ret;
        const rule = this._rules[rule_name];
        if (rule === undefined) { throw new Error('unknown rule: ' + rule_name); }
        Grammar.TRIPLET_RE.lastIndex = 0;
        let m: RegExpExecArray;
        while (m = Grammar.TRIPLET_RE.exec(rule as string)!) {
            if (m[0].length === 0) {
                Grammar.TRIPLET_RE.lastIndex = m.index + 1;
                continue;
            }
            const formula = m[0];
            const marker = m[2] ? JSON.parse(m[2]) : (m[1] || '');
            const rule = m[3] || 'EMPTY';
            const quantifier = m[4] || '';
            const repeating = m[4] !== undefined && (m[4] === '*' || m[4] === '+' || m[4][0] === '{');
            const triplet = {
                formula,
                marker,
                rule,
                quantifier,
                repeating,
                empty: rule==='EMPTY'
            };
            ret.push(triplet);
        }
        return ret;
    }


    parser (rule_name: string): RegExp {
        if (rule_name in this._parsers) { return this._parsers[rule_name]; }
        const pattern = this.pattern(rule_name);
        const re = new RegExp('^\\s*' + pattern + '\\s*$', 'm');
        this._parsers[rule_name] = re;
        return re;
    }


    splitter (triplet: Triplet): RegExp {
        const t = triplet;
        if (this._splitters[t.formula]) { return this._splitters[t.formula]; }
        let p = (t.marker.length === 1 ? '\\' : '') + t.marker + '\\s*';
        p += '(' + this.pattern(t.rule) + ')';
        const splitter = new RegExp(p, 'g');
        this._splitters[t.formula] = splitter;
        return splitter;
    }


    triplet_re (t: Triplet): string {
        let ret = sterilize(this.pattern(t.rule));
        const q = t.quantifier === '?' ? '?' : '';
        let m = t.marker;
        if (m.length === 1) {
            m = '\\' + m;
        }
        if (!t.repeating) {
            if (t.marker.length > 1) {
                ret = '(' + m + '\\s*' + ret + ')' + q;
            } else if (q === '?') {
                ret = '(?:' + (m ? m + '\\s*' : '') + '(' + ret + '))' + q;
            } else {
                ret = m + '\\s*(' + ret + ')';
            }
        } else {
            ret = '((?:' + m + '\\s*' + ret + '\\s*)' + t.quantifier + ')';
        }
        return ret;
    }


    pattern (rule_name: string): string {
        if (rule_name in this._patterns) { return this._patterns[rule_name]; }
        const triplets = this.triplets(rule_name);
        // detect chains, strip |, make regex
        let joined = '';
        let chain = true;
        triplets.forEach((t) => {
            const p = this.triplet_re(t);
            if (chain) {
                if (t.quantifier === '|') {
                    joined += '(?:';
                    chain = false;
                } else {
                    if (joined) {
                        joined += '\\s*';
                    }
                }
                joined += p;
            } else {
                joined += '|' + p;
                if (t.quantifier !== '|') {
                    joined += ')';
                    chain = true;
                }
            }
        });

        joined = joined.replace(/\\s\*(\(+\?:|\(+|\)+)\\s\*/g, '\\s*$1');
        joined = joined.replace(/\((\?\:)?\)/g, "");
        joined = joined.replace(/(\\s\*)+/g, "\\s*");
        // TODO test: no capture group for bodyless triplets
        // TODO no \\s* for them too
        //console.log(rule_name, joined)

        this._patterns[rule_name] = joined;

        return this._patterns[rule_name];
    }

    /** Splits the text into parts according to the rule, clears whitespace
     *  and punctuation.
     *  @returns {Array} an aray of parts; single-occurrence parts as strings,
     *  repeated parts as arrays of strings */
    split (text: string, rule_name: string): (string | string[])[] {
        const ret: (string | string[])[] = [];
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
                const items: string[] = [];
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
    test (text: string): string[] {
        return Object.keys(this._rules).filter(rule => this.is(text, rule));
    }

}

function sterilize (pattern: string): string {
    return pattern.replace(/\((\?:)?/g, '(?:');
}

export = Grammar;
