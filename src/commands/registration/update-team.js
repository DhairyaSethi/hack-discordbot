const handleError = require('../../util/error');

module.exports = {
	name: 'update-team',
	help: '!update-team <team name>',
	desc: 'Update team on db',
	exec: async (message, client) => {
		const {
			prefix,
			RegisterChannelName,
			HackAcceptedRole,
			HackPendingRole,
		} = client.config;

		const sheet = client.db.get('main');

		const args = message.content
			.replace(`${prefix} update-team`, `${prefix}update-team`)
			.replace(`${prefix}update-team`, '')
			.trim();

		if (args.length < 1)
			return handleError(
				'Empty team name entered',
				message,
				'Empty team name entered.'
			);
		try {
			if (RegisterChannelName === '') {
				console.warn('Registration Channel Name not set.');
				RegisterChannelName = 'RegistrationCheck';
				RegisterChannelId = '771989234822414347';
			}
			if (
				!message.member.roles.cache.find(r =>
					[HackAcceptedRole, HackPendingRole].includes(r.name)
				)
			) {
				handleError(
					'Need to be registered',
					message,
					'You need to be registered first in order to call this command!'
				);
			} else {
				const data = await sheet.getRows();
				const row = data.find(o => o.DiscordId === message.author.id);
				if (row === undefined)
					return handleError(
						'Need to be registered',
						message,
						'You need to be registered first in order to call this command!'
					);
				if (row.Name.trim().length + args.length + 2 > 32)
					return handleError(
						'Exceeded',
						message,
						'Too long! Your name + team name cannot exceed 32 characters. Please try again'
					);
				row['TeamName'] = args.trim();
				row['Logs'] = `${row['Logs']} + ${message.content}`;
				message.member.setNickname(`${row.Name.trim()} | ${args}`.slice(0, 32));
				await row.save();
				const dataNew = {
					DiscordTag: message.author.tag,
					DiscordId: message.author.id,
					Name: row['Name'].trim(),
					Email: row['Email'].trim(),
					Time: new Date().toUTCString(),
					TeamName: args ? args : '',
					Logs: 'UPDATED',
				};
				await sheet.addRow(dataNew);
				message.delete({ timeout: 2000 });
				message.reply('Successful!').then(msg => msg.delete({ timeout: 3000 }));
			}
		} catch (err) {
			console.log(err);
			handleError(
				'Need to be registered',
				message,
				'You need to be registered first in order to call this command!'
			);
		}
	},
};
