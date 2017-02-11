const grammar = require('./');

function test (string) {
    const matches = grammar.test_string(string);
    matches.forEach( form => console.log(string, 'is', form) );
}

console.log('---tests---');
test('');
test('0');
test('"some string"');
test('0+0');
test('10-Z0');
test('Sl0v0');
test('12345+origin');
test('L0Ngl0nG01%HASHHASH00');
test('notanumbertoolong');
test('0BjeKtID+author.genfn@12time+origin:l0cat10n+origin');
test(':l0cat10n');
test('3.1415');
test('"string"');
test('0/~');
test('0/~,~/0');
test('1,2,3');
test('=1,2,3');
test('#object+author.json@1time+origin:field =1');
test('#object+author.json@1time+origin:field ="some so-called \\"string\\""');
test('#object+author.json@1time+origin:field >another+object');
test('!no+changes');
test('?object+author');
test('?I?want+to@read?all%that?0bjects.now');
test('!object+author.json@1time+origin:0 | :one,two,three,four,five =1,2,3,"hello world" >0/4,object+ref');
test(':field1="value1"; :field2=2; :field3>some+object');
test('!empty+state |');
test('#empty+ref >');
test('#empty+constant =');

const re_e = grammar.parsers.EVENT;
console.log(re_e.test('#object+author.json@sometime+origin:field="value"'));
