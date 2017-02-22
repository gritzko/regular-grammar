const Grammar = require('./src/Grammar');

const SWARM_GRAMMAR_RULES = {

    NUMBER: /\d+(\.\d+([eE]-?\d+)?)?/,
    STRING: /"(\\.|[^"])*"/,
    EMPTY: '',
    BASE: /[0-9A-Za-z_~]+/,
    INT: /[0-9A-Za-z_~]{1,10}/,

    ID: 'INT [+%-]INT?',
    SPEC: 'ID? .ID? @ID? :ID?',
    CONSTANT: 'NUMBER| STRING| EMPTY|',
    VALUE: '=CONSTANT| >SPEC|',

    RUN: 'ID /BASE?',
    CONSTRUN: 'CONSTANT /BASE?',
    IDS: 'RUN ,RUN*',
    SPECS: 'IDS .IDS? @IDS? :IDS?',
    CONSTANTS: 'CONSTRUN ,CONSTRUN*',
    BLOCK: '/INT? IDS? :IDS? =CONSTANTS? >SPECS?',
    OPS: 'BLOCK ;BLOCK*',

    EVENT: '#SPEC VALUE?',
    ON: '?SPEC VALUE?',
    STATE: '!SPEC |OPS?',

    FRAME_UP: 'ON* EVENT*',
    FRAME_DOWN: 'STATE* EVENT*',

};

module.exports = new Grammar(SWARM_GRAMMAR_RULES);
