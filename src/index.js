const { readdirSync } = require('fs');
const { Client, Collection } = require('discord.js');
const config = require('./config/config.json');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const handleSubmission = require('./util/submission')

const client = new Client();
client.commands = new Collection();
client.cooldowns = new Collection();
client.db = new Collection();
client.config = config;

const { prefix, token, emojiId, spreadsheetId } = config;

const commandFolders = readdirSync('./commands/');

for (const folder of commandFolders) {
	const commandFiles = readdirSync(`./commands/${folder}`).filter(file =>
		file.endsWith('.js')
	);
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

client.once('ready', async () => {
	console.log('[+] ready as', client.user.tag);
	const doc = new GoogleSpreadsheet(spreadsheetId);

	try {
		await doc.useServiceAccountAuth(require('./config/oauth.json'));
		await doc.loadInfo();
	} catch (err) {
		console.warn('Unable to connect to db', err.message);
	}

	console.log('[+] loaded sheet', doc.title);

	const main = doc.sheetsByTitle['Main'],
		giveaway = doc.sheetsByTitle['Giveaway'],
		meme = doc.sheetsByTitle['Meme'],
		final = doc.sheetsByTitle['FinalTeams'];

	client.db.set('main', main);
	client.db.set('giveaway', giveaway);
	client.db.set('meme', meme);
	client.db.set('final', final);

	const constants = {};
	if (emojiId === '') {
		console.warn('EmojiId not set');
		constants.emojiId = '💥';
	} else constants.emojiId = emojiId;

	constants.memeTopic = '';

	client.constants = constants;
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	if (message.attachments.size > 0 && message.channel.name === config.MemeChannelName)
		return handleSubmission(message, client);

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName);

	if (!command) return;

	try {
		command.exec(message, client);
	} catch (error) {
		console.error(error);
		message.reply('unable to execute!');
	}
});

client.login(token);
