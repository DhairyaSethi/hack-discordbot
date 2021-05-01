const handleError = require('../../util/error');

module.exports = {
	name: 'update',
	help: '!update <team name>',
	desc: 'Gives Hack Accepted Role to entire team.',
	exec: async (message, client) => {
		const { prefix, HackAcceptedRole, OrganiserRole } = client.config;
		const sheet = client.db.get('main');
		const finalSheet = client.db.get('final');

		const args = message.content.replace(`${prefix}update`, '').trim();

		if (!message.member.roles.cache.find(r => r.name === OrganiserRole))
			return handleError(
				'eligible team command spam',
				message,
				'Only organiser can call this command.'
			);
		try {
			console.log('updating team for eligible', args);
			const rows = await sheet.getRows();
			const team = [];
			const cord = [];
			for (let i = 0; i < rows.length; i++) {
				if (
					rows[i]['TeamName'] &&
					rows[i]['TeamName'].trim().toLowerCase() === args.toLowerCase()
				) {
					team.push(rows[i]);
					cord.push(i);
				}
			}
			const eligibleRole = myGuild.roles.cache.find(
				r => r.name === HackAcceptedRole
			);
			// let text = '--'
			const text = await Promise.all(
				team.map(async (el, i) => {
					try {
						const user = await myGuild.members.fetch({
							user: el['DiscordId'],
						});
						await user.roles.add(eligibleRole);
						return ' + for ' + el['DiscordTag'] + ',';
					} catch (err) {
						console.log('bye ', text);
						return ' - for ' + el['DiscordTag'] + ',';
					}
				})
			);
			let symbol = '-- ' + Math.floor(Math.random() * 100).toString() + ' --';

			for (const i of cord) {
				try {
					rows[i]['Registration Status'] = symbol;
					await rows[i].save();
				} catch (err) {
					console.log('Couldnt update for', rows[i]['Name']);
				}
			}
			let teamNumber;
			try {
				const final = await finalSheet.getRows();
				teamNumber = final[final.length - 1]['pos'];
				const isNumber = n => {
					return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
				};
				if (!isNumber(teamNumber)) {
					teamNumber = '---';
				} else {
					teamNumber = Number(teamNumber) + 1;
				}
				const toPut = [];
				for (const val of team) {
					toPut.push({
						tag: val['DiscordTag'],
						id: val['DiscordId'],
						name: val['Name'] ? val['Name'].trim() : val['Name'],
						team: val['TeamName'] ? val['TeamName'].trim() : ' ',
						pos: teamNumber,
					});
				}
				await finalSheet.addRows(toPut);
				console.log('added to final sheet team number', teamNumber);
			} catch (err) {
				console.log('Cound not update final team sheet', err);
			}

			console.log(text);
			message.reply(`Successful ${text.join(' ')} of team number ${teamNumber}`);
		} catch (err) {
			handleError(
				'Unable to update team' + err,
				message,
				'Automation failed :/ Try again ig?'
			);
		}
	},
};
