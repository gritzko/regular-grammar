const grammar = require('./');

function test (string) {
    const matches = grammar.test_string(string);
    matches.forEach( form => console.log(string, 'is', form) );
}

console.log('---tests---');
test('');
test('0');
test('1.23e4');
test('12.3E-4');
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
test('/8');
test('/8 :1,2,3,4,5,6,7,8 =/8');

const re_e = grammar.parsers.EVENT;
const event_str = '#object+author.json@sometime+origin:field="value"';
console.log(re_e.test(event_str));
let mln_str = "";
const ev_count = 100000;
for(let i=0; i<ev_count; i++)
    mln_str += event_str;
const re_frame = grammar.parsers.FRAME_UP;
const start_ms = new Date().getTime();
const is_frame = re_frame.test(mln_str);
const end_ms = new Date().getTime();
console.log(is_frame, 1.0*(end_ms-start_ms)/ev_count, 'ms or', 
        1000/(end_ms-start_ms)*ev_count/1000000, 'MHz');
