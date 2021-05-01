const handleError = require('../../util/error');
const getScore = require('../../util/score');

module.exports = {
	name: 'stop-meme',
	help: '!stop-meme',
	desc: 'Stop contest',
	exec: async (message, client) => {
		const { MemeChannelName, OrganiserRole } = client.config;

		const channel = message.guild.channels.cache.find(
			ch => ch.name === MemeChannelName
		);
		const MemeChannelId = channel ? channel.id : '837991326175461377';
		const memeSheet = client.db.get('meme');
		const { emojiId } = client.constants;
		try {
			if (!message.member.roles.cache.find(OrganiserRole))
				return handleError(
					'meme command spam',
					message,
					'Only organiser can call this function'
				);

			try {
				if (message.channel.name !== MemeChannelName)
					return handleError(
						'wrong channel for memes',
						message,
						`Can only call this on <#${MemeChannelId}>.`
					);
			} catch (err) {
				console.log('Error checking channel', err);
			}
			//RESET DB??

			const sentMsg = await message.channel.send('Fetching results...');
			try {
				const rows = await memeSheet.getRows();
				const currentTopic = rows[rows.length - 1]['Topic']
					? rows[rows.length - 1]['Topic']
					: client.constants.memeTopic;
				client.constants.memeTopic = '';

				const found = rows.filter(row => row['Topic'] === currentTopic);
				if (found.length === 0) {
					return handleError(
						'No stuff found for' + currentTopic,
						message,
						'No existing contest found! Please contact mods for support.'
					);
				}
				const score = await getScore(found, message, emojiId);
				// console.log('score', score)
				const sorted = score
					.sort((a, b) => Number(b.count) - Number(a.count))
					.filter(a => !!a)
					.filter(a => Number(a.count) !== 1);
				console.log('sorted', sorted);
				console.log('current topic', currentTopic);
				const toSend = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle(`Meme Contest LeaderBoard`)
					.setURL('https://discord.js.org/')
					.setThumbnail('https://i.imgur.com/cVhGJjz.png')
					.setTimestamp();
				if (currentTopic) toSend.setDescription('Topic ' + currentTopic);
				if (sorted.length === 0) {
					toSend.addField('*', ':( no votes.', false);
				} else {
					for (let i = 0; i < 5; i++) {
						const val = sorted[i];
						if (val === undefined) continue;
						toSend.addField(
							`${i + 1}.`,
							`<@${val.id}> with **${val.count}** upvotes for [this post](${val.url}).`,
							false
						);
					}
				}
				await sentMsg.delete({ timeout: 100 });
				message.channel.send(toSend);
			} catch (err) {
				console.log(
					'[-] Error Could not get count.',
					err,
					'Oops. Was not able to get scores.'
				);
				await sentMsg.delete({ timeout: 100 });
				message
					.reply('Oops. Was not able to get scores.')
					.then(msg => msg.delete({ timeout: 3000 }));
			}
		} catch (err) {
			handleError('At stop meme', err, 'Oop. Please try again or contact mods.');
		}
	},
};
