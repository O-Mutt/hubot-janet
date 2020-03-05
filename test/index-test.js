/* eslint-env node, mocha */

const Helper = require('hubot-test-helper');

const helper = new Helper('../src/index.js');
const assert = require('assert');

function equal (actual, expected) {
	try {
		assert.equal(actual, expected);
		return Promise.resolve();
	} catch (err) {
		return Promise.reject(err);
	}
}

function msgEqual (actual, expected) {
	return equal(actual[0], expected[0])
			.then(() => equal(actual[1], expected[1]));
}

function lastMessage (room) {
	return room.messages[room.messages.length - 1];
}

describe('hubot-respond', function () {
	let room;

	describe('Add new responds', function () {

		before(function () {
			room = helper.createRoom({ httpd: false });
		});

		after(function () {
			room.destroy();
		});

		it('should add respond', function () {
			return room.user.say('alice', '@hubot respond to foo with bar')
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', '@alice Respond added'];

					return msgEqual(actual, expected);
				});
		});

		it('should add another response', function () {
			return room.user.say('bob', '@hubot respond to lorem with ipsum')
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', '@bob Respond added'];

					return msgEqual(actual, expected);
				});
		});
	});

	describe('Responds to matching message', function () {
		beforeEach(function () {
			room = helper.createRoom({ httpd: false });
			return room.user.say('alice', '@hubot respond to foo with bar');
		});

		afterEach(function () {
			room.destroy();
		});

		it('should respond if the message is just the matching text', () => {
			return room.user.say('alice', '@hubot respond to foo with bar')
				.then(() => room.user.say('john', 'foo'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'bar'];

					return msgEqual(actual, expected);
				});
		});

		it('should respond if the message is part of a longer message', () => {
			return room.user.say('john', 'This is a message, where the foo text is embedded somewhere')
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'bar'];

					return msgEqual(actual, expected);
				});
		});

		it('should not respond if the text is not a word in the message', () => {
			let len = room.messages.length;

			return room.user.say('john', 'This is a message, where the fooish text is embedded somewhere')
				.then(() => equal(room.messages.length, len + 1));
		});

		it('should respond if letter cases don\'t match',  () => {
			return room.user.say('alice', '@hubot respond to lOrEm with ipsum')
				.then(() => room.user.say('john', 'LoReM'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'ipsum'];

					return msgEqual(actual, expected);
				});
		});

		it('should respond to unicode characters', () => {
			return room.user.say('alice', '@hubot respond to ❇ with flower')
				.then(() => room.user.say('john', '❇'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'flower'];

					return msgEqual(actual, expected);
				});
		});

		it('should respond to unicode characters', () => {
			return room.user.say('alice', '@hubot respond to ❇ with flower')
				.then(() => room.user.say('john', '-❇"'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'flower'];

					return msgEqual(actual, expected);
				});
		});

		it('should respond with multiline messages', () => {
			return room.user.say('alice', '@hubot respond to hi with hi\\nthere')
				.then(() => room.user.say('john', 'hi"'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'hi\nthere'];

					return msgEqual(actual, expected);
				});
		});

		it('should match to the first with keyword and keep the others', () => {
			return room.user.say('alice', '@hubot respond to hi with hi there with more with')
				.then(() => room.user.say('john', 'hi'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'hi there with more with'];

					return msgEqual(actual, expected);
				});
		});
	});

	describe('Respond with dynamic content', function () {
		beforeEach(function () {
			room = helper.createRoom({ httpd: false });
		});
		afterEach(function () {
			room.destroy();
		});

		it('should respond with sender\'s username', () => {
			return room.user.say('alice', '@hubot respond to hi with Hi {sender}')
				.then(()=> room.user.say('john', 'hi'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'Hi john'];

					return msgEqual(actual, expected);
				});
		});

		it('should respond with room name', () => {
			return room.user.say('alice', '@hubot respond to hi with Welcome in {room}')
				.then(()=> room.user.say('john', 'hi'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', `Welcome in ${room.name}`];

					return msgEqual(actual, expected);
				});
		});

		it('should respond with room and sender name', () => {
			return room.user.say('alice', '@hubot respond to hi with Welcome @{sender} in {room}')
				.then(()=> room.user.say('john', 'hi'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', `Welcome @john in ${room.name}`];

					return msgEqual(actual, expected);
				});
		});

		describe('multi room', () => {
			let room2;
			beforeEach(() => {
				room2 = helper.createRoom({ name: 'room2', httpd: false });
			});
			afterEach(() => room2.destroy());

			it('sould respond only in room', () => {
				return Promise.all([
					room.user.say('alice', '@hubot here respond to helo with Helo1'),
					room2.user.say('alice', '@hubot here respond to helo with Helo2'),
				])
					.then(() => room.user.say('john', 'helo'))
					.then(() => {
						const actual = lastMessage(room);
						const expected = ['hubot', 'Helo1'];

						return msgEqual(actual, expected);
					})
					.then(() => room2.user.say('jim', 'helo'))
					.then(() => {
						const actual = lastMessage(room2);
						const expected = ['hubot', 'Helo2'];

						return msgEqual(actual, expected);
					});
			});

			it('should respond with the first room message', () => {
				room.user.say('alice', '@hubot respond to helo with Helo0')
					.then(() => room.user.say('alice', '@hubot here respond to helo with Helo1'))
					.then(() => room.user.say('john', 'helo'))
					.then(() => {
						const actual = lastMessage(room);
						const expected = ['hubot', 'Helo1'];

						return msgEqual(actual, expected);
					});
			});

			// this can not be tested with the current hubot-test-helper
			// because it creates a new robot for each room, however our robot
			// can listen on many room as one instance
			// https://github.com/mtsmfm/hubot-test-helper/issues/32
			it.skip('should respond with the global message if no match in room', () => {
				return room.user.say('alice', '@hubot respond to helo with Helo0')
					.then(() => room.user.say('alice', '@hubot here respond to helo with Helo1'))
					.then(() => room.user.say('john', 'helo'))
					.then(() => {
						const actual = lastMessage(room2);
						const expected = ['hubot', 'Helo0'];

						return msgEqual(actual, expected);
					});
			});

			it('sould delete from room', () => {
				return Promise.all([
					room.user.say('alice', '@hubot respond to helo with Helo0'),
					room.user.say('alice', '@hubot here respond to helo with Helo1'),
					room2.user.say('alice', '@hubot here respond to helo with Helo2'),
				])
					.then(() => room.user.say('alice', '@hubot from here delete respond to helo'))
					.then(() => room2.user.say('jim', 'helo'))
					.then(() => {
						const actual = lastMessage(room2);
						const expected = ['hubot', 'Helo2'];

						return msgEqual(actual, expected);
					})
					.then(() => room.user.say('jon', 'helo'))
					.then(() => {
						const actual = lastMessage(room);
						const expected = ['jon', 'helo'];

						return msgEqual(actual, expected);
					});
			});
		});
	});

	describe('Delete respond', function () {
		beforeEach(function () {
			room = helper.createRoom({ httpd: false });
			return room.user.say('alice', '@hubot respond to foo with bar');
		});

		afterEach(function () {
			room.destroy();
		});

		it('should say that respond deleted', () => {
			return room.user.say('alice', '@hubot delete respond to foo')
				.then(() => equal(room.messages.length, 4))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', '@alice respond to foo deleted'];

					return msgEqual(actual, expected);
				});
		});

		it('should not respond to text anymore', () => {
			return room.user.say('alice', '@hubot delete respond to foo')
				.then(() => room.user.say('alice', 'foo'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['alice', 'foo'];

					return msgEqual(actual, expected);
				});
		});
	});

	describe('Update respond', function () {
		beforeEach(function () {
			room = helper.createRoom({ httpd: false });
			return room.user.say('alice', '@hubot respond to foo with bar');
		});

		afterEach(function () {
			room.destroy();
		});

		it('should say that the respond updated', () => {
			return room.user.say('alice', '@hubot respond to foo with baz')
				.then(() => equal(room.messages.length, 4))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', '@alice Respond updated'];

					return msgEqual(actual, expected);
				});
		});

		it('should answer with the new respond to the text', () => {
			return room.user.say('alice', '@hubot respond to foo with baz')
				.then(() => room.user.say('alice', 'foo'))
				.then(() => {
					const actual = lastMessage(room);
					const expected = ['hubot', 'baz'];

					return msgEqual(actual, expected);
				});
		});
	});

	describe('List responds', function () {
		beforeEach(function () {
			room = helper.createRoom({ httpd: false });
			return room.user.say('alice', '@hubot respond to foo with bar')
				.then(() => room.user.say('bob', '@hubot respond to lorem with ipsum'));
		});

		afterEach(function () {
			room.destroy();
		});

		it('should list all responds', () => {
			return room.user.say('bob', '@hubot list responds')
				.then(() => equal(room.messages.length, 6))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', '@bob respond to foo with bar\nrespond to lorem with ipsum'];

					return msgEqual(actual, expected);
				});
		});
	});
});
