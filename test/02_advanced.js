const tape = require('tape');
const Grammar = require('..');

// TODO
// 5. local |

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

tape('grammar.02.B COUNTS', (tap) => {

    const THREE_WORD = new Grammar({
        WORD:     /\w+/,
        SENTENCE: ' WORD{1,3} '
    });

    tap.ok(THREE_WORD.is('what a grammar', 'SENTENCE'));
    tap.ok(THREE_WORD.is(' not a word', 'SENTENCE'));
    tap.ok(THREE_WORD.is('attention', 'SENTENCE'));
    tap.notOk(THREE_WORD.is('you talk too much', 'SENTENCE'));

    tap.end();

});

tape('grammar.02.C QUOTES', (tap) => {

    const CONCRETE = new Grammar({
        WORD:     /\w+/,
        SENTENCE: '"the"WORD+'
    });

    tap.ok(CONCRETE.is(' the dog', 'SENTENCE'));
    console.log(CONCRETE);
    tap.ok(CONCRETE.is(' the cat the dog', 'SENTENCE'));
    tap.ok(CONCRETE.is('there', 'SENTENCE'));
    tap.notOk(CONCRETE.is('a cat', 'SENTENCE'));

    tap.end();

});
