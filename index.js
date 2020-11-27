/** @format */

const Discord = require('discord.js');
const client = new Discord.Client();

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { spreadsheetId } = require('./config/sheets.json');
const doc = new GoogleSpreadsheet(spreadsheetId);

//not necessary, better for response time
const SERVER_ID = '768521009253974028';
const HACK_PENDING_ROLE = 'Hacker(Under Review)';
const HACK_ACCEPTED_ROLE = 'Hacker(Eligible)';
const MemeChannelId = '772085529713049600';
const organiserRole = '768795745951416320';

//@required
const emojiID = '776426491570683914';
//global constants
let memeSheet;
let memeTopic = '';
let sheet;
let sheet1;
let finalSheet;
let HackPendingId;
let HackAcceptedId;
let myGuild;

const isNumber = n => {
	return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
};

client.once('ready', async () => {
	console.log('[+] ready as ', client.user.tag);
	await doc.useServiceAccountAuth(require('./config/oauth.json'));
	await doc.loadInfo();
	console.log('[+] loaded sheet ', doc.title);
	sheet = doc.sheetsByTitle['Main'];
	sheet1 = doc.sheetsByTitle['Giveaway'];
	memeSheet = doc.sheetsByTitle['Meme'];
	finalSheet = doc.sheetsByTitle['FinalTeams'];

	myGuild = client.guilds.cache.get(SERVER_ID);

	// x(myGuild)
	try {
		HackPendingId = myGuild.roles.cache.find(r => r.name === HACK_PENDING_ROLE)
			.id;
		HackAcceptedId = myGuild.roles.cache.find(r => r.name === HACK_ACCEPTED_ROLE)
			.id;
		console.log('[+] Found Role Ids', HackPendingId, HackAcceptedId);
	} catch (err) {
		console.log('[-] Couldnt get role IDs', err);
	}
});

const prefix = '!';
const FallenDerl = '587987091535953930';
const RegisterChannelId = '771989234822414347';

client.on('message', async message => {
	if (message.attachments.size > 0 && message.channel.id === MemeChannelId)
		return handleSubmission(message);
	// if(message.author.id === '693149593097076739' && message.channel.id === '772413969225875476') message.react('✨')
	if (message.content.includes('GG')) handleEaster(message, client, '✨'); // redacted further easter eggs

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	let args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();

	switch (command) {
		case 'register': {
			args = message.content
				.replace(`${prefix} register`, `${prefix}register`)
				.replace(`${prefix}register`, '')
				.trim()
				.split(',');

			if (message.channel.id !== RegisterChannelId)
				return handleError(
					'Wrong channel registration.',
					message,
					`Wrong channel! Head over to <#${RegisterChannelId}>`
				);

			if (
				message.member.roles.cache.has(HackPendingId) ||
				message.member.roles.cache.has(HackAcceptedId)
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
					role => role.name === HACK_PENDING_ROLE
				);

				message.member.roles.add(proRole);
				// .catch(console.log);

				message.member.setNickname(
					`${args[0].trim()} ${args[2] ? '| ' + args[2].trim() : ''}`.slice(0, 32)
				);

				console.log(`Registered ${data.DiscordTag}.`);

				message.author.send(
					`You have registered for the hackathon! You have been assigned the HackPending role, once we verify your registration this role will be updated to HackParticipant! If you made any mistake or want to change something, please message <@${FallenDerl}>`
				);
			} catch (err) {
				handleError(err, message);
			}
			break;
		}

		case 'unregister': {
			args = message.content.replace(`${prefix}unregister`, '').trim().split(',');

			if (message.channel.id !== RegisterChannelId)
				return handleError(
					'Wrong channel registration.',
					message,
					`Wrong channel! Head over to <#${RegisterChannelId}>`
				);

			try {
				const proRole = message.member.guild.roles.cache.find(
					role => role.name === HACK_PENDING_ROLE
				);

				if (message.member.roles.cache.has(HackPendingId)) {
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
					`Please try again or contact <@${FallenDerl}> for support.`
				);
			}

			break;
		}

		case 'update-team': {
			args = message.content
				.replace(`${prefix} update-team`, `${prefix}update-team`)
				.replace(`${prefix}update-team`, '')
				.trim();
			try {
				if (
					!(
						message.member.roles.cache.has(HackPendingId) ||
						message.member.roles.cache.has(HackAcceptedId)
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
					console.log('Updated team ', row['TeamName'], 'for', message.author.tag);
					const dataNew = {
						DiscordTag: message.author.tag,
						DiscordId: message.author.id,
						Name: row['Name'].trim(),
						Email: row['Email'].trim(),
						Time: new Date().toUTCString(),
						TeamName: args ? args : '',
						Logs: 'MOFO UPDATED',
					};
					await sheet.addRow(dataNew);
					message.delete({ timeout: 2000 });
					message.reply('Successful!').then(msg => msg.delete({ timeout: 3000 }));
				}
			} catch (err) {
				handleError(
					err,
					message,
					`Please try again or contact <@${FallenDerl}> for support.`
				);
			}
			break;
		}

		case 'faqs': {
			args = message.content.replace(`${prefix}faqs`, '').trim().split(',');

			break;
		}

		case 'startmeme': {
			try {
				if (message.channel.id !== MemeChannelId)
					return handleError(
						'wrong channel for memes',
						message,
						`Can only call this on <#${MemeChannelId}>.`
					);
			} catch (err) {
				console.log('Error checking channel', err);
			}
			args = message.content.replace(`${prefix}startmeme`, '').trim();
			try {
				if (!message.member.roles.cache.has(organiserRole))
					return handleError(
						'meme command spam',
						message,
						'Only organiser can call this command.'
					);
				memeTopic = args;
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
			break;
		}

		case 'stopmeme': {
			try {
				if (!message.member.roles.cache.has(organiserRole))
					return handleError(
						'meme command spam',
						message,
						'Only organiser can call this function'
					);

				try {
					if (message.channel.id !== MemeChannelId)
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
						: memeTopic;
					memeTopic = '';

					const found = rows.filter(row => row['Topic'] === currentTopic);
					if (found.length === 0) {
						return handleError(
							'No stuff found for' + currentTopic,
							message,
							'No existing contest found! Please contact mods for support.'
						);
					}
					const score = await getScore(found, message);
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

			break;
		}

		case 'enter-giveaway': {
			return handleError(
				'Giveaway over',
				message,
				'Sorry, but the giveaway is over now!'
			);

			try {
				message.delete({ timeout: 1000 });

				if (message.channel.id !== '772693685249900574')
					return handleError(
						'Wrong channel for giveaway.',
						message,
						`Wrong channel! Head over to <#772693685249900574> to run the giveaway command.`
					);

				const data = await sheet1.getRows();
				if (data.find(o => o.DiscordTag === message.author.tag)) {
					message
						.reply(
							'You have already entered the giveaway! Contact any of the mods if you need support.'
						)
						.then(msg => {
							msg.delete({ timeout: 3000 });
						});
				} else {
					message.author.send(
						'To enter the giveaway, follow this link https://docs.google.com/forms/d/e/1FAIpQLSfm9ZXtIn4C8wiVPeCZp1rR_pPj4QAeEC8HzyqhpC1sPgtwnA/viewform and get a chance to win $50 amazon giftcards!'
					);
					await sheet1.addRow({
						DiscordTag: message.author.tag,
						Time: new Date().toUTCString(),
					});
				}
			} catch (err) {
				handleError(
					err,
					message,
					'Please try again. If the problem persists, please contact mods.'
				);
			}
			break;
		}

		case 'update': {
			if (!message.member.roles.cache.has(organiserRole))
				return handleError(
					'eligible team command spam',
					message,
					'Only organiser can call this command.'
				);
			const args = message.content.replace(`${prefix}update`, '').trim();
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
					r => r.name === HACK_ACCEPTED_ROLE
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
					if (!isNumber(teamNumber)) {
						teamNumber = '---';
					} else {
						teamNumber = Number(teamNumber) + 1;
					}
					const toPut = [];
					team.forEach(val => {
						toPut.push({
							tag: val['DiscordTag'],
							id: val['DiscordId'],
							name: val['Name'] ? val['Name'].trim() : val['Name'],
							team: val['TeamName'] ? val['TeamName'].trim() : val['TeamName'],
							pos: teamNumber,
						});
					});
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
		}
	}
});

const getScore = async (found, message) => {
	const score = await Promise.all(
		found.map(async (val, itr) => {
			try {
				if (val['MessageId'] === '-') return;
				console.time('fetching msg' + itr);
				const msg = await message.channel.messages.fetch(val['MessageId']);
				console.timeEnd('fetching msg' + itr);
				const rx = msg.reactions.cache.filter(r => r.emoji.id === emojiID);
				const count = rx && rx.first() ? rx.first().count : 0;
				return {
					count: count,
					id: val['UserId'],
					url: msg.url,
				};
			} catch (err) {
				console.log('Could not get ', val['MessageId'], err);
			}
		})
	);

	return score;
};

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

const handleEaster = (message, client, emoji) => {
	//function redacted
	return message.react(emoji);
};

const handleSubmission = async message => {
	try {
		message.react(emojiID);
		if (message.member.roles.cache.has(organiserRole))
			return console.log('Organiser Meme.');
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
	} catch (err) {
		console.log(
			'ERROR at submission',
			message.author.tag,
			new Date().toUTCString()
		);
	}
};

client.login(process.env.TOKEN);
