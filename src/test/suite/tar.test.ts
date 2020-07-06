import * as assert from 'assert';

import {octal_ascii_to_int} from '../../tar/tar';

suite('tar extraction test suite', () => {
	test('test octal ascii to int', () => {
		// arrange
		var buf = Buffer.from([52, 50, 54, 51]); // "4263"
		var num = 0o4263;

		// act
		var result = octal_ascii_to_int(buf);

		// assert
		assert.equal(num, result);
	});
});