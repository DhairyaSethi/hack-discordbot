async function handleSubmission (message, client) {
	try {
        const memeSheet = client.db.get('memeSheet');
        const { memeTopic, emojiID } = client.constants;
        
		message.react(emojiID);
		// if (message.member.roles.cache.has(organiserRole))
		// 	return console.log('Organiser Meme.');
		if (memeTopic === '' || !memeTopic) {
			const rows = await memeSheet.getRows();
			memeTopic = rows[rows.length - 1]['Topic'];
		}
		const data = {
			Topic: memeTopic,
			Date: new Date().toDateString(),
			Time: new Date().toTimeString(),
			UserId: message.author.id,
			UserTag: message.author.tag,
			MessageId: message.id,
			Score: '0',
		};

		await memeSheet.addRow(data);

        client.memeTopic = memeTopic;
	} catch (err) {
		console.log(
			'ERROR at submission',
			message.author.tag,
			new Date().toUTCString()
		);
	}
};

module.exports = handleSubmission;