const tape = require('tape');
const Grammar = require('..');


tape('grammar.03.A JSON', (tap) => {

    const INVENTORY_JSON = new Grammar({
        FLOAT: /\d+(\.\d{1,15})?/,
        INT:   /\d+/,
        STRING: /"(\\.|[^"])*"/,
        IDKV:  '"\\"id\\"" :STRING',
        NAMEKV:'"\\"name\\"" :STRING',
        QUANTKV:'"\\"quantity\\"" :INT',
        PRICEKV:'"\\"price\\"" :FLOAT',
        ENTRY: '{ IDKV ,NAMEKV? ,QUANTKV? ,PRICEKV? }',
        LIST:  '[ENTRY ,ENTRY* ]'
    });

    tap.ok( INVENTORY_JSON.is( '{"id":"A123"}', 'ENTRY' ) );
    tap.ok(INVENTORY_JSON.is(''+Math.PI, 'FLOAT'));
    const bears = '{"id":"A345", "name":"teddy bear", "price": 5.45}';
    tap.ok( INVENTORY_JSON.is(bears, 'ENTRY') );
    tap.ok( INVENTORY_JSON.is('[{"id":"A"}]', 'LIST') );
    tap.notOk(INVENTORY_JSON.is('{"id":123}', 'ENTRY'));

    tap.end();

});


tape('grammar.03.A SQL', (tap) => {
    tap.end();
});
