const handleError = require('../../util/error');

module.exports = {
	name: 'register',
	help: '!register <Full Name>, <Email Address>, <Team Name(optional)>',
	desc: 'Give HackPending role and add to db',
	exec: async (message, client) => {
		const sheet = client.db.get('main');
		const {
			prefix,
			RegisterChannelName,
			HackAcceptedRole,
			HackPendingRole,
		} = client.config;

		let RegisterChannelId;
		const args = message.content
			.replace(`${prefix} register`, `${prefix}register`)
			.replace(`${prefix}register`, '')
			.trim()
			.split(',');

		if (RegisterChannelName === '') {
			console.warn('Registration Channel Name not set.');
			RegisterChannelName = 'RegistrationCheck';
			RegisterChannelId = '771989234822414347';
		}

		// const id = message.guild.channels.cache.find(el => el.name === RegisterChannelName)
		// if(!id) {
		//     console.warn('Channel Name Incorrect.')
		// }

		if (message.channel.name !== RegisterChannelName)
			return handleError(
				'Wrong channel registration.',
				message,
				`Wrong channel! Head over to <#${RegisterChannelId}>`
			);

		if (
			message.member.roles.cache.find(r =>
				[HackAcceptedRole, HackPendingRole].includes(r.name)
			)
		) {
			handleError(
				'Smartie',
				message,
				`You are already registered. Please message <@${FallenDerl}> if you need help.`
			);
			return;
		}

		if (!message.content.includes(','))
			return handleError(
				'Edge case',
				message,
				'Please use the correct format: `!register <Full Name>, <Email Address>, <Team Name(optional)>`. \nNote the `,`(comma) is important.\nThere is no space(` `) between `!` and `register`.'
			);

		if (args[0].includes('register')) args[0] = args[0].replace('register', '');

		if (!args[1].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)) {
			message.delete({ timeout: 1000 });
			message
				.reply(
					'Please enter a valid email address. \nUse the correct format: `!register <Full Name>, <Email Address>, <Team Name(optional)>`. \nNote the `,`(comma) is important.'
				)
				.then(msg => {
					msg.delete({ timeout: 5000 });
				});
			return;
		}

		const data = {
			DiscordTag: message.author.tag,
			DiscordId: message.author.id,
			Name: args[0].trim(),
			Email: args[1].trim(),
			Time: new Date().toUTCString(),
			TeamName: args[2] ? args[2].trim() : '',
			Logs: message.content,
		};
		message.delete({ timeout: 1000 });

		try {
			await sheet.addRow(data);
			//assign HackPending role
			const proRole = message.member.guild.roles.cache.find(
				role => role.name === HackPendingRole
			);

			message.member.roles.add(proRole);
			// .catch(console.log);

			message.member.setNickname(
				`${args[0].trim()} ${args[2] ? '| ' + args[2].trim() : ''}`.slice(0, 32)
			);

			console.log(`Registered ${data.DiscordTag}.`);

			message.author.send(
				`You have registered for the hackathon! You have been assigned the HackPending role, once we verify your registration this role will be updated to HackParticipant! If you made any mistake or want to change something, please message any of the Organisers.`
			);
		} catch (err) {
			handleError(err, message);
		}
	},
};
