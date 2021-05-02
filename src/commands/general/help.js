module.exports = {
	name: 'help',
    help: '!help <command name>',
	desc: 'Display command usage or list all commands',
	exec(message, client, args) {
		let data = [];
		const { commands } = message.client;

		if (!args.length) {
			data = commands.map(c => {
                return `${c.name} - ${c.desc}`
            });
			data.push(`\nYou can send \`${client.config.prefix}help <cmd name>\` for usage.`);

			return message.channel.send(data, { split: true })
				.catch(error => {
					console.error(`Could not send help.`, error);
				});
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name);

		if (!command) {
			return message.reply('that\'s not a valid command.');
		}

		data.push(`**Name:** ${command.name}`);

		if (command.desc) data.push(`**Description:** ${command.desc}`);
		if (command.help) data.push(`**Usage:** ${prefix}${command.name} ${command.help}`);

		message.channel.send(data, { split: true });
	},
};