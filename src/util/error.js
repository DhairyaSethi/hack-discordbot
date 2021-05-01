const handleError = (
	error,
	message,
	text = 'Please try again. Use the correct format: `!register <Full Name>, <Email Address>, <Team Name(optional)>`.\n Please note the `,` (comma) is important.'
) => {
	console.log('[-] Error', error);
	message.delete({ timeout: 3000 });
	message.reply(text).then(msg => {
		msg.delete({ timeout: 7000 });
	});
};

module.exports = handleError;