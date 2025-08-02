> [!NOTE]
> This project has been moved to [eric-livezey/void-bot](https://github.com/eric-livezey/void-bot)

# Void Bot

Void Bot is a Discord bot that will play the audio from YouTube videos in voice calls. It uses [discord.js](https://discord.js.org) for Discord's API and <s>a YouTube downloader that I created</s> [ytdl-core](https://github.com/distubejs/ytdl-core). Because of issues with streaming audio directly from YouTube, the bot dowloads every YouTube track by default. Because of this, it keeps every audio file in it's directory for caching which may lead to a large file size of the directory with many audio files. The `audio` folder can always be deleted whenever the cache gets too big.

# Usage

To run it you would need to have a bot created with discord. If you do not already have one you can create one [here](https://discord.com/developers/applications). You will also need to have [Node.js](https://nodejs.org) installed.

Then should then clone the repository

    git clone https://github.com/eric-livezey/void-bot.js.git

You should then navigate to the directory of the repository and run

    npm install

This should install the necessary dependencies.

Now you should create a file called `env.json` in the directory of the repository. The file should have a structure that looks like so
    
    {
      "TOKEN": "YOUR_BOTS_TOKEN"
    }

You can find your bot's token on it's application page.

You can also optionally specify the bot owner's id in the same file using the `"OWNER"` field.

Now all that's left is to run it. Assuming all the previous steps are done properly you should be able to run `main.js` with node which should launch the bot.

    node ./main.js

A list of available commands can be seen by typing `.help` in a channel.
