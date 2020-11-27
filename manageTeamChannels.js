/** @format */

const Discord = require('discord.js');
const client = new Discord.Client();

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { spreadsheetId } = require('./config/sheets.json');
const doc = new GoogleSpreadsheet(spreadsheetId);

// FOR PRODUCTION
const SERVER_ID = '768521009253974028';
const everyoneId = '768521009253974028';
const mentorId = '772015137535557652';
const guId = '777895848575107122';
client.login(process.env.TOKEN);

// FOR test SERVER
// client.login(process.env.TOKEN_TEST);
// const SERVER_ID = '771685808825958410';
// const everyoneId = '771685808825958410';
// const mentorId = '778156745641689148';
// const guId = '776448815980871742';

let guild;

client.on('ready', async () => {
	console.log('ready as', client.user.tag);
	guild = client.guilds.cache.get(SERVER_ID);

    // cache all user data 
    await guild.members.fetch();

	await doc.useServiceAccountAuth(require('./config/oauth.json'));
	await doc.loadInfo();
	console.log('[+] loaded sheet ', doc.title);
	const sheet = doc.sheetsByTitle['FinalTeams'];
	const mentorSheet = doc.sheetsByTitle['mentors'];

	const rows = await sheet.getRows();
	console.log('loaded data');
	const rowsMentor = await mentorSheet.getRows();

	const final = rows.filter(el => el['pos'] !== '--');

	let current = { pos: '1', team: 'F maxxxx', roleId: '', lastCreated: '0' };

	await Promise.all(final.map(async (val, itr) => {
	    // const val = final[itr];
	    console.log('on ', val['pos'], val['team'], val['name'])
	    const name = ('Team ' + current.pos + ' - ' + current.team).slice(0, 32);

	    //make channels for first team
	    if(val['pos'].trim() === current.pos.trim() && current.roleId === '') {
	        console.log('creating channels for ' + name)
	        const {catId, textId, voiceId, roleId} = await script(name, val['id'], val)
	        val['textId'] = textId
	        val['catId'] = catId
	        val['roleId'] = roleId
	        console.log('created channel for', val['pos'])
	        current.lastCreated = val['pos']
	        current.roleId = roleId
	        await val.save()
	    }

	    //moving to new team condition
	    if(val['pos'].trim() !== current.pos.trim()) {
	        current.pos = val['pos'].trim()
	        current.team = val['team'].trim()

	        val['finalName'] = name
	        //create channel + give first guy role
	        const {catId, textId, voiceId, roleId} = await script(name, val['id'], val)
	        //assign role --> will do later
	        val['textId'] = textId
	        val['catId'] = catId
	        val['roleId'] = roleId
	        console.log('created channel for', val['pos'])
	        current.lastCreated = val['pos']
	        //this will be returned from the script
	        current.roleId = 'role id for ' + name
	        current.pos = val['pos']
	        await val.save()

	        return
	    }
	    // if(current.lastCreated.trim() !== val['pos'].trim()) {
	    //     //create channel script which returns the role id
	    //     //change current.lastcreated
	    //     //store the role id
	    //     console.log('created channel for', val['pos'])
	    //     current.lastCreated = val['pos']
	    //     //this will be returned from the script
	    //     current.roleId = 'role id for team ' + val['pos'] + ' - ' + val['team']

	    //     //assign the first dude the role in the script itselft so i can return loop here
	    //     // console.log('assigned role to ', val['name'], 'of team', val['team'])
	    //     return
	    // }
	}))

	async function assignRolesToEveryone() {
		try {
			const d = await Promise.all(
				final.map(async (val, itr) => {
					// if(!(typeof val['finalName'] === 'string' && val['finalName'].length > 5)) {
					//     return 'nop' + val['name'] + val['finalName'] + 'for final name'
					// }
					// if(!(typeof val['textId'] === 'string' && val['textId'].length > 5)) {
					//     return 'nop' + val['name'] + val['finalName'] + 'for text channel id'
					// }
					if (
						!(typeof val['roleId'] === 'string' && val['roleId'].length > 5)
					) {
						return 'nop' + val['name'] + val['finalName'] + 'for role id';
					}

					const role = await guild.roles.cache.find(
						r => r.id === val['roleId']
					);
					// if(!role) return 'nop' + val['name'] + val['finalName'] + 'for role id' + val['roleId']

					const user = await guild.members.fetch({ user: val['id'] });
					user.roles.add(role);

					console.log('ONN', itr);
				})
			);

			console.log(d);
		} catch (err) {
			console.log(err);
		}
	}

	// await assignRolesToEveryone()

	const toSend2 = new Discord.MessageEmbed()
		.setColor('#FF0000')
		.setTitle(`Mentor Allocation Form`)
		.setURL('https://bit.ly/idea_mentoring')
		.setThumbnail('https://i.imgur.com/R4B1q3U.png')
		.setDescription(
			`**The following form is mandatory for each team.**
    
    As we believe, hackathons are all about briding the ideas viz mentoring.
    We are here to help you get paired up with the right mentor for your project.
    
    As per the rules, if the team hasn't filled the form the project will not be considered for evaluation and prizes.
    You are requested to fill the trailing form, so that, we could come up with the best combination possible and beneficial to you.
    
    Link: https://bit.ly/idea_mentoring`
		)
		.setTimestamp();

	const toTBD = new Discord.MessageEmbed()
		.setColor('#FF0000')
		.setTitle(`Hey Team`)
		.setURL('https://hackforshe.devfolio.co')
		.setThumbnail('https://i.imgur.com/R4B1q3U.png')
		.setDescription(
			`**This team has been formed based on Responses on the form. Welcome!**

    **Important:*** You are all requested to coordinate with each other and join a single team on devfolio.

    If this is not done by the tomorrow, 19th November 11:50 PM, your submission would not be valid.

    Once you have done this, kindly PM any of the <@768803391357976607> to update this channel's team name and our records.

    You are then requested to **fill the mentor allocation form**.
    
    `
		)
		.setTimestamp();

    const spamAllChannelScript = async (toSendEmbed) => {
        guild.channels.cache.forEach(channel => {
            if(channel.isText() && channel.name.startsWith('team')) {
                console.log('on ' + channel.name)
                channel.send(toSendEmbed)
            }
        })
    }
    // await spamAllChannelScript(toSend)

	//create team channel one at a time
	const oneByOneScript = async (fullname, teamName) => {
		const { catId, textId, voiceId, roleId } = await script(fullname);
		console.log(catId, textId, voiceId, roleId);
		const finalo = final.filter(o => o['team'].trim() === teamName);
		console.log(finalo[0]['name']);
		finalo.forEach(async val => {
			const role = await guild.roles.cache.find(r => r.id === roleId);
			// if(!role) return 'nop' + val['name'] + val['finalName'] + 'for role id' + val['roleId']

			const user = await guild.members.fetch({ user: val['id'] });
			user.roles.add(role);
			if (user && user.tag) console.log('done for ', user.tag);
			val['roleId'] = roleId;
			val['textId'] = textId;
			val['finalName'] = fullname;
			await val.save();
		});

		const cha = await client.channels.fetch(textId);
		console.log(cha.name);
		cha.send(toSend);
		// cha.send(toSend2)
		// cha.send(toenac)
	};

	// await oneByOneScript('Team 37 - goes.into.spam', 'goes.into.spam')

	// final.forEach(async val => {


	// const dd = []
	// guild.roles.cache.get('772015137535557652').members.forEach(async mem => {
	//     console.log(mem.nickname, mem.id)
	//     dd.push({mentor: mem.nickname, id: mem.id})
	// })

	// mentorSheet.addRows(dd).then(console.log)



	const getChannelId = teamName => {
		for (const val of rows) {
			if (
				!(
					(typeof val['team'] === 'string' && val['team'] === '') ||
					val['team'] === undefined
				)
			) {
				// console.log('HERE', val['team'])
				if (
					val['team'].trim().toLowerCase() === teamName.trim().toLowerCase()
				) {
					console.log(val['textId']);
					return val['textId'];
				}
			}
		}
	};

	const getMentorMessage = (mentorName, mentorId) => {
		return `Hey Team!\nBased on your form response, and the mentor's prevalent tech stack, the following mentor has been assigned.\n\nFeel free to use this server to ping them & have a discussion!

        ${mentorName} - <@${mentorId}>
        `;
	};


	const announceMentors = async () => {
		rowsMentor.forEach(async (val, itr) => {
			try {
				// if(!((typeof val['TeamName'] === 'string' && val['TeamName'] === '') || val['TeamName'] === undefined)) {
				console.log('ON', itr);
				const textId = getChannelId(val['TeamName']);
				if (typeof textId !== 'string') {
					console.log(' oh no', itr, val['TeamName']);
					return;
				}
				const channel = guild.channels.cache.get(textId);
				const msg = getMentorMessage(val['MentorAlloted'], val['MentorId']);

				console.log(
					itr,
					val['TeamName'],
					channel.id,
					val['MentorAlloted'],
					val['MentorId']
				);
			} catch (err) {
				console.log(err);
			}
		});
	};

	// announceMentors()

	//MENTOR -- 772015137535557652
});

client.on('message', async message => {

	//purge all channels, use only in text
	if (message.content === 'purge') {
		message.guild.channels.cache.forEach(channel => {
			if(
				// channel.isText() &&
				channel.name.startsWith('Team')
			) channel.delete()
		});
	}
});

// Creates Channel & Role, And Returns RoleId
const script = async (name, memberId, row) => {
	const toSend = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle(`Welcome Team`)
		.setURL('https://discord.js.org/')
		.setThumbnail('https://i.imgur.com/R4B1q3U.png')
		.setDescription(
			`Hope the festivities treated you well!
    Its finally time to kick off this hack season.
    
    In case of any descrepancies, feel free to ask us in <#772060337574903828>.
    If there is any teammate who has not been added to this channel do let us know on the above channel.
    
    Let the hacking begin!
    
    Following are how we are gonna proceed:`
		)
		.setTimestamp()
		.addField(
			'1.',
			`As our whole hackathon is hosted on Devfolio, make sure each member of your team is registered under same team on Devfolio and Discord Server. The ratio criteria will be verified on both the platforms, only then your team will be eligible for any benefits.`,
			false
		)
		.addField(
			'2.',
			`Every team member has to be present on the Discord Server, for the evaluations and mentoring sessions.`,
			false
		)
		.addField(
			'3.',
			`This thread is only visible to you and your team members, feel free to discuss over these text and voice channels. They are for your benefit only.`,
			false
		)
		.addField(
			'4.',
			`Mentors will be dropping in your threads shortly, according to the tech stack you have filled in [this form](https://bit.ly/idea_mentoring). More on this in the subsequent message.`,
			false
		);

	const toSend2 = new Discord.MessageEmbed()
		.setColor('#FF0000')
		.setTitle(`Mentor Allocation Form`)
		.setURL('https://bit.ly/idea_mentoring')
		.setThumbnail('https://i.imgur.com/R4B1q3U.png')
		.setDescription(
			`**The following form is mandatory for each team.**
    
    As we believe, hackathons are all about briding the ideas viz mentoring.
    We are here to help you get paired up with the right mentor for your project.
    
    As per the rules, if the team hasn't filled the form the project will not be considered for evaluation and prizes.
    You are requested to fill the trailing form, so that, we could come up with the best combination possible and beneficial to you.
    
    Link: https://bit.ly/idea_mentoring`
		)
		.setTimestamp();

	const role = await guild.roles.create({
		data: {
			name: name,
		},
		reason: 'for team ' + name,
	});
	console.log(name, 'Role created', role.id);
	// const member = await client.users.cache.find(u => u.tag.toLowerCase() === cap.tag.toLowerCase())
	// const user = await guild.members.fetch({user: memberId})
	// await user.roles.add(role)

	const cat = await guild.channels.create(name, {
		type: 'category',
		permissionOverwrites: [
			{
				type: 'role',
				id: role.id,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'],
			},
			{
				type: 'role',
				id: everyoneId,
				deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
			},
			{
				type: 'role',
				id: mentorId,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'],
			},
			{
				type: 'role',
				id: guId,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'],
			},
		],
	});

	console.log(name, 'Cat created', cat.id);

	const textChannel = await guild.channels.create(name, {
		type: 'text',
		parent: cat.id,
		permissionOverwrites: [
			{
				type: 'role',
				id: role.id,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'],
			},
			{
				type: 'role',
				id: everyoneId,
				deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
			},
			{
				type: 'role',
				id: mentorId,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'],
			},
			{
				type: 'role',
				id: guId,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'],
			},
		],
	});

	const voiceChannel = await guild.channels.create(name, {
		type: 'voice',
		parent: cat.id,
		permissionOverwrites: [
			{
				type: 'role',
				id: role.id,
				allow: [
					'VIEW_CHANNEL',
					'SEND_MESSAGES',
					'EMBED_LINKS',
					'CONNECT',
					'SPEAK',
				],
			},
			{
				type: 'role',
				id: everyoneId,
				deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
			},
			{
				type: 'role',
				id: mentorId,
				allow: [
					'VIEW_CHANNEL',
					'SEND_MESSAGES',
					'EMBED_LINKS',
					'CONNECT',
					'SPEAK',
				],
			},
			{
				type: 'role',
				id: guId,
				allow: [
					'VIEW_CHANNEL',
					'SEND_MESSAGES',
					'EMBED_LINKS',
					'CONNECT',
					'SPEAK',
				],
			},
		],
	});

	console.log(name, 'Voice created', voiceChannel.id);

	return {
		catId: cat.id,
		textId: textChannel.id,
		voiceId: voiceChannel.id,
		roleId: role.id,
	};
};

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
