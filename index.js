const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Initialize collections
client.commands = new Collection();
client.slashCommands = new Collection();

// Load command files
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if (command.data) {
            client.slashCommands.set(command.data.name, command);
        }
    }
}

// Load event files
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

// Register slash commands
async function deployCommands() {
    const commands = [];
    client.slashCommands.forEach(command => {
        commands.push(command.data.toJSON());
    });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || 'your_bot_token_here');

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID || 'your_client_id_here'),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

// Login to Discord
client.login(process.env.DISCORD_TOKEN || 'your_bot_token_here').then(() => {
    deployCommands();
}).catch(console.error);

module.exports = client;
