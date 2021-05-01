# Hackathon Discord Bot
A discord bot to facilitate organizing your hackathon. Initial Release for [HACK4SHE '20](https://hackforshe.tech). Built on DiscordJS, Google Sheets db.
Extremely simple to manage with google sheets as a databse for efficient collaboration.

Features include 
- Handle registrations, assign pending role, nickname and store data in google sheets.
- Host meme contests and tally scores.
- Create individual roles and channels for each team.

## Commands
- `register` - gives HackPendingRole to participant and records their email and team name in the sheets db. Additional `unregister`, `update-team` for quality of life.
- `meme-start/meme-stop` 
    ![image alt](https://i.imgur.com/6Ng18pE.png "title" =525x327)


## Setup
### Installation
After cloning, use the following command to install all dependencies & run locally.
_Note_: replace `pnpm` with your preferred package manager like `npm` or `yarn`.

```
pnpm install
pnpm run dev
```
OR
[Docker Image](https://hub.docker.com/repository/docker/cjamie/hack-discordbot)
Build and Run your local image using `docker-compose up`
### Configuration
- Your database looks something like this:
    ![Sheets DB](https://i.imgur.com/f0dSoOc.png "sheets")
    
    - You can get this template from [here](https://docs.google.com/spreadsheets/d/1waquiM6SbBbP5ocyIQ5z5EPZBgBJ2ID0-_3n8EkfnWE).
- Get oauth 2.0 token to make edits to this file by creating a client, instructions at this [FAQ page](https://support.google.com/cloud/answer/6158849?hl=en). Save your credentials from the `oauth.json` file you get in the `config/` folder.
- Add a `config/config.json` file (`mv config/config.example.json config/config.json`)
```json
{
    "spreadsheetId": "", //Database Google Spreadsheet id
    "token": "", //Discord Login Token
    "prefix": "!", //Bot Prefix for commands
    "emojiId": "",
    "HackPendingRole": "Hacker(Under Review)", //Name of the Role
    "HackAcceptedRole": "Hacker(Eligible)", 
    "OrganiserRole": "Organiser",
    "RegisterChannelId": "",
    "RegisterChannelName": "✅-registration-check", //Channel Name where user registration will happen
    "MemeChannelName": "💥memes" //Channel name for the meme contest
}
```

- Select permissions for the bot [here](https://discordapi.com/permissions.html) (do include `Manage Channels` & `Manage Roles`), enter your discord `Client Id` and add the bot to your server.

## Hosting
1. [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
    - Note: `Procfile` is set up. Caveat is free tier dynos last around 22 days.
2. Deploy to [Platform.sh](https://platform.sh)
    - Configuration files are set up. Offers free one month VM credits.


## LICENSE

[MIT LICENSE](http://www.tldrlegal.com/license/mit-license)
