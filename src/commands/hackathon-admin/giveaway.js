const handleError = require('../../util/error');

module.exports = {
	name: 'enter-giveaway',
    help: '!enter-giveaway',
	desc: 'Enter participant in giveaway and DM details',
	exec(message, client, args) {
        try {
            message.delete({ timeout: 100 });
            
            const giveawaySheet = client.db.get('giveaway');

            if (message.channel.name !== client.config.GiveawayChannelName)
                return handleError(
                    'Wrong channel for giveaway.',
                    message,
                    `Wrong channel! Head over to <#772693685249900574> to run the giveaway command.`
                );
        
            const data = await giveawaySheet.getRows();
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
                await giveawaySheet.addRow({
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
    }
};


