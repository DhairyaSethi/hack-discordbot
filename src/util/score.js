async function getScore (found, message, emojiId) {
    const score = found.map(async (val, itr) => {
        try {
            if (val['MessageId'] === '-') return;
            console.time('fetching msg' + itr);
            const msg = await message.channel.messages.fetch(val['MessageId']);
            console.timeEnd('fetching msg' + itr);
            const rx = msg.reactions.cache.filter(r => r.emoji === emojiId || r.emoji.id === emojiId);
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
 
    return score;
};

module.exports = getScore;