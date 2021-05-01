const handleError = require('../../util/error');

module.exports = {
	name: 'unregister',
	help: '!register',
	desc: 'Reset HackPending roles to register again',
	exec: async (message, client) => {
		const sheet = client.db.get('main');
		const { prefix, RegisterChannelName, HackPendingRole } = client.config;

		let RegisterChannelId;
		const args = message.content
			.replace(`${prefix}unregister`, '')
			.trim()
			.split(',');

		if (RegisterChannelName === '') {
			console.warn('Registration Channel Name not set.');
			RegisterChannelName = 'RegistrationCheck';
			RegisterChannelId = '771989234822414347';
		}

		if (message.channel.name !== RegisterChannelName)
			return handleError(
				'Wrong channel registration.',
				message,
				`Wrong channel! Head over to <#${RegisterChannelId}>`
			);

		try {
			const proRole = message.member.guild.roles.cache.find(
				role => role.name === HackPendingRole
			);

			if (message.member.roles.cache.find(r => r.name === HackPendingRole)) {
				message.member.roles.remove(proRole);
				message.delete({ timeout: 2000 });
				message
					.reply(
						'Successful! Try to register again using the format specified above.'
					)
					.then(msg => msg.delete({ timeout: 3000 }));
			} else {
				handleError(
					'Already registered calling unregister',
					message,
					`You are not registered! First do that sire.`
				);
			}
		} catch (err) {
			handleError(
				err,
				message,
				`Please try again or contact any of the organisers for support.`
			);
		}
	},
};
