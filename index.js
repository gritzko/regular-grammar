"use strict";

const rules = {

    "NUMBER":       "\\d+(\\.\\d+([eE]-?\\d+)?)?",
    "STRING":       '"(\\\\.|[^"])*"',
    "EMPTY":        "",
    "BASE":         "[0-9A-Za-z_~]+",
    "INT":          "[0-9A-Za-z_~]{1,10}",

    "ID":           "INT +%-INT?",
    "SPEC":         "ID? .ID? @ID? :ID?",
    "CONSTANT":     "( NUMBER | STRING | EMPTY )",
    "VALUE":        "=CONSTANT | >SPEC",

    "RUN":          "ID /BASE?",
    "CONSTRUN":     "CONSTANT /BASE?",
    "IDS":          "RUN ,RUN*",
    "SPECS":        "IDS .IDS? @IDS? :IDS?",
    "CONSTANTS":    "CONSTRUN ,CONSTRUN*",
    "BLOCK":        "/INT? IDS? :IDS? =CONSTANTS? >SPECS?",
    "OPS":          "BLOCK ;BLOCK*",

    "EVENT":        "#SPEC VALUE?",
    "ON":           "?SPEC VALUE?",
    "STATE":        "!SPEC |OPS?",

    "FRAME_UP":     "ON* EVENT*",
    "FRAME_DOWN":   "STATE* EVENT*"

};

const re_built = {};

const re_parsers = {};

function expand (safe, expr, marker, name, quant) {
    if (!re_built[name])
        build(name);
    const reb = re_built[name];
    const re = safe ? reb.replace(/\(/g, '(?:') : reb;
    let re_marker = '';
    if (marker) {
        re_marker = marker.length==1 ? '\\'+marker :
            '[' + marker.replace(/./g, '\\$&') + ']';
    }
    return '(' + re_marker + re + ')' + quant;
}

const expand_clean = expand.bind(null, false);
const expand_safe = expand.bind(null, true);

function build (key) {
    const rule = rules[key];
    const RE_EXPR = /([^A-Za-z0-9\s]*)([A-Z][A-Z0-9_]+)([\*\+\?]{0,1})/g;
    const clean = rule.replace( RE_EXPR, expand_clean );
    const safe =  rule.replace( RE_EXPR, expand_safe ).replace(/\s+/g, '\\s*');
    re_built[key] = clean;
    re_parsers[key] = new RegExp('^'+safe+'$', 'm');
}

function test (string) {
    const ret = [];
    for(let key in re_parsers) {
        const parser = re_parsers[key];
        parser.lastIndex = 0;
        const m = parser.exec(string);
        if (m && m[0].length===string.length) {
            ret.push(key);
        }
    }
    return ret;
}

build('FRAME_UP');
build('FRAME_DOWN');

module.exports = {
    parsers: re_parsers,
    test_string: test,
};
