const tape = require('tape');
const Grammar = require('..');

// TODO
// 1. EMPTY preset
// 2. {EMPTY -> {
// 3. {1,10}
// 4. parser tests
// 5. local |
// 6. "symbol"RULE?

tape('grammar.02.A EMPTY', (tap) => {
    const BRCKETED = new Grammar({
        WORD: /\w+/,
        ANY: '{EMPTY WORD* }EMPTY',
    });

    tap.ok(BRCKETED.is('{something}', 'ANY'));

    tap.ok(BRCKETED.is('{some thing }', 'ANY'));
    tap.ok(BRCKETED.is('{ something}', 'ANY'));
    tap.ok(BRCKETED.is('{}', 'ANY'));
    tap.ok(BRCKETED.is(' { }', 'ANY'));

    tap.notOk(BRCKETED.is(' { wo}rd', 'ANY'));
    tap.notOk(BRCKETED.is(' { word', 'ANY'));
    tap.notOk(BRCKETED.is(' word }', 'ANY'));
    tap.notOk(BRCKETED.is(' }{', 'ANY'));

    tap.end();
});
