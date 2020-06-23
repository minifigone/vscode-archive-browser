import * as assert from 'assert';

import {array_to_int} from '../../zip/zip';

suite('zip extraction test suite', () =>{
	test('test array to int', () => {
		// arrange
		var buf = Buffer.from([0x3f, 0x7a, 0x91, 0x10]);
		var num = 0x10917a3f;

		// act
		var result = array_to_int(buf);

		// assert
		assert.equal(num, result);
	});
});