"use strict";
const grammar = require('..');
const tap = require('tape');

tap ('grammar.01.A triplets', function (tap)  {

    tap.deepEqual( grammar.triplets('ID'), [
        {
            marker: '',
            rule:   'INT',
            quantifier: ''
        },
        {
            marker: '[+%-]',
            rule:   'INT',
            quantifier: '?'
        }
    ] );
    tap.end();

});

tap ('grammar.01.B vanilla', function (tap) {

    tap.ok( grammar.is('1', 'NUMBER') );
    tap.ok( grammar.is('1', 'INT') );
    tap.ok( grammar.is('1', 'ID'), '1 is ID' );
    tap.notOk( grammar.is('$1', 'ID'), '$1 is not ID' );
    tap.notOk( grammar.is('1', 'VALUE') );
    tap.ok( grammar.is('1.23e4', 'NUMBER') );
    tap.notOk( grammar.is('1.23e4', 'INT') );
    tap.ok( grammar.is('12.3E-4', 'SPEC') );
    tap.notOk( grammar.is('0+0', 'CONSTANT') );

    tap.end();

});

tap ('grammar.01.D grammar.is', function(tap){

    tap.deepEqual(grammar.test('').sort(), ["SPEC","EMPTY","CONSTANT","FRAME_UP","CONSTRUN","CONSTANTS","BLOCK","OPS","FRAME_DOWN"].sort());
    tap.deepEqual(grammar.test('0').sort(), ["INT","ID","SPEC","NUMBER","CONSTANT","BASE","RUN","IDS","CONSTRUN","CONSTANTS","SPECS","BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('1.23e4').sort(), ["SPEC","NUMBER","CONSTANT","CONSTRUN","CONSTANTS","SPECS"].sort());
    tap.deepEqual(grammar.test('12.3E-4').sort(), ["SPEC","NUMBER","CONSTANT","CONSTRUN","CONSTANTS","SPECS"].sort());
    tap.deepEqual(grammar.test('\"some string\"').sort(), ["STRING","CONSTANT","CONSTRUN","CONSTANTS"].sort());
    tap.deepEqual(grammar.test('0+0').sort(), ["ID","SPEC","RUN","IDS","SPECS","BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('10-Z0').sort(), ["ID","SPEC","RUN","IDS","SPECS","BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('Sl0v0').sort(), ["INT","ID","SPEC","BASE","RUN","IDS","SPECS","BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('12345+origin').sort(), ["ID","SPEC","RUN","IDS","SPECS","BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('L0Ngl0nG01%HASHHASH00').sort(), ["ID","SPEC","RUN","IDS","SPECS","BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('notanumbertoolong').sort(), ["BASE"].sort());
    tap.deepEqual(grammar.test('0BjeKtID+author.genfn@12time+origin:l0cat10n+origin').sort(), ["SPEC","SPECS"].sort());
    tap.deepEqual(grammar.test(':l0cat10n').sort(), ["SPEC","BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('3.1415').sort(), ["SPEC","NUMBER","CONSTANT","CONSTRUN","CONSTANTS","SPECS"].sort());
    tap.deepEqual(grammar.test('\"string\"').sort(), ["STRING","CONSTANT","CONSTRUN","CONSTANTS"].sort());
    tap.deepEqual(grammar.test('0/~').sort(), ["RUN","IDS","CONSTRUN","CONSTANTS","SPECS","BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('0/~,~/0').sort(), ["IDS","SPECS","BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('1,2,3').sort(), ["IDS","CONSTANTS","SPECS","BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('=1,2,3').sort(), ["BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('#object+author.json@1time+origin:field =1').sort(), ["EVENT","FRAME_UP","FRAME_DOWN"].sort());
    tap.deepEqual(grammar.test('#object+author.json@1time+origin:field =\"some so-called \\"string\\"\"').sort(), ["EVENT","FRAME_UP","FRAME_DOWN"].sort());
    tap.deepEqual(grammar.test('#object+author.json@1time+origin:field >another+object').sort(), ["EVENT","FRAME_UP","FRAME_DOWN"].sort());
    tap.deepEqual(grammar.test('!no+changes').sort(), ["STATE","FRAME_DOWN"].sort());
    tap.deepEqual(grammar.test('?object+author').sort(), ["ON","FRAME_UP"].sort());
    tap.deepEqual(grammar.test('?I?want+to@read?all%that?0bjects.now').sort(), ["FRAME_UP"].sort());
    tap.deepEqual(grammar.test('!object+author.json@1time+origin:0 | :one,two,three,four,five =1,2,3,\"hello world\" >0/4,object+ref').sort(), ["STATE","FRAME_DOWN"].sort());
    tap.deepEqual(grammar.test(':field1=\"value1\"; :field2=2; :field3>some+object').sort(), ["OPS"].sort());
    tap.deepEqual(grammar.test('!empty+state |').sort(), ["STATE","FRAME_DOWN"].sort());
    tap.deepEqual(grammar.test('#empty+ref >').sort(), ["EVENT","FRAME_UP","FRAME_DOWN"].sort());
    tap.deepEqual(grammar.test('#empty+constant =').sort(), ["EVENT","FRAME_UP","FRAME_DOWN"].sort());
    tap.deepEqual(grammar.test('/8').sort(), ["CONSTRUN","CONSTANTS","BLOCK","OPS"].sort());
    tap.deepEqual(grammar.test('/8 :1,2,3,4,5,6,7,8 =/8').sort(), ["BLOCK","OPS"].sort());

    tap.end();

});

tap ('grammar.01.E benchmark', function(tap){

    const re_e = grammar.parser("EVENT");
    const event_str = '#object+author.json@sometime+origin:field="value"';
    let mln_str = "";
    const ev_count = 100000;
    for(let i=0; i<ev_count; i++)
        mln_str += event_str;
    const re_frame = grammar._parsers.FRAME_UP;
    const start_ms = new Date().getTime();
    const is_frame = re_frame.test(mln_str);
    const end_ms = new Date().getTime();
    tap.ok(is_frame);
    // TODO performance degradation, likely due to excessive bracketing
    // this should be >1MHz on a laptop
    console.log(1.0*(end_ms-start_ms)/ev_count, 'ms or',
        1000/(end_ms-start_ms)*ev_count/1000000, 'MHz');

    tap.end();
} );