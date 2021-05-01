const handleError = require('../../util/error');

module.exports = {
	name: 'start-meme',
	help: '!start-meme <topic name>',
	desc: 'Start contest under give topic',
	exec: async (message, client) => {
        const { prefix, MemeChannelName, OrganiserRole } = client.config;
		const channel = message.guild.channels.cache.find(
			ch => ch.name === MemeChannelName
		);
		let MemeChannelId = '837991326175461377';
		const memeSheet = client.db.get('meme');

		if (channel) MemeChannelName = channel.id;
		try {
			if (message.channel.id !== MemeChannelName)
				return handleError(
					'wrong channel for memes',
					message,
					`Can only call this on <#${MemeChannelId}>.`
				);
		} catch (err) {
			console.log('Error checking channel', err);
		}
		let args = message.content.replace(`${prefix}startmeme`, '').trim();
		const { memeTopic } = client.constants;

		try {
			if (!message.member.roles.cache.find(r => r.name === OrganiserRole))
				return handleError(
					'meme command spam',
					message,
					'Only organiser can call this command.'
				);
			client.constants.memeTopic = args;
			console.log('Starting with topic', memeTopic, args);
			const data = {
				Topic: memeTopic,
				Date: new Date().toDateString(),
				Time: new Date().toTimeString(),
				UserId: '-',
				UserTag: message.author.tag,
				MessageId: '-',
				// Score: '0'
			};
			await memeSheet.addRow(data);
			message.react('🧇');
		} catch (err) {
			handleError('At start meme', err, 'Oop. Please try again or contact mods.');
		}
	},
};
