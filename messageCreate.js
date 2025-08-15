const { getGuildConfig } = require('../config/storage');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Ignore messages without content
        if (!message.content) return;

        const config = getGuildConfig(message.guild?.id);
        const prefix = 't!';

        // Check if message starts with prefix
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        try {
            switch (commandName) {
                case 'enablesupport':
                    await handleEnableSupport(message, config);
                    break;

                case 'sendreportmessage':
                    await handleSendReportMessage(message, args);
                    break;

                case 'sendappealmessage':
                    await handleSendAppealMessage(message, args);
                    break;

                case 'sendsupportmessage':
                    await handleSendSupportMessage(message, args);
                    break;

                case 'help':
                    await handleHelpCommand(message);
                    break;

                default:
                    // Don't respond to unknown commands to avoid spam
                    break;
            }
        } catch (error) {
            console.error(`Error executing prefix command ${commandName}:`, error);
            await message.reply('❌ An error occurred while executing this command.');
        }
    },
};

async function handleEnableSupport(message, config) {
    // Check if user has manage guild permissions
    if (!message.member.permissions.has('ManageGuild')) {
        return await message.reply('❌ You need **Manage Server** permissions to use this command.');
    }

    const { setGuildConfig } = require('../config/storage');
    
    config.supportEnabled = true;
    config.supportGuildId = message.guild.id;
    setGuildConfig(message.guild.id, config);

    await message.reply('✅ Support system has been enabled for this server! Use `/setup` for more configuration options.');
}

async function handleSendReportMessage(message, args) {
    // Check permissions
    if (!message.member.permissions.has('ManageGuild')) {
        return await message.reply('❌ You need **Manage Server** permissions to use this command.');
    }

    // Check if channel is provided
    if (args.length === 0) {
        return await message.reply('⚠️ Please provide a channel. Usage: `t!sendreportmessage #channel`');
    }

    const channelMention = args[0];
    const channelId = channelMention.replace(/[<>#]/g, '');
    const channel = message.guild.channels.cache.get(channelId);

    if (!channel) {
        return await message.reply('❌ Invalid channel provided. Please mention a valid channel.');
    }

    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const { createEmbed } = require('../utils/embedBuilder');

    const reportEmbed = createEmbed(
        'Report a User',
        'Click the button below to report a user for misconduct.',
        'report'
    );

    const reportButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('report_user')
                .setLabel('📝 Report User')
                .setStyle(ButtonStyle.Danger)
        );

    await channel.send({ embeds: [reportEmbed], components: [reportButton] });
    await message.reply(`✅ Report message sent to ${channel}`);
}

async function handleSendAppealMessage(message, args) {
    // Check permissions
    if (!message.member.permissions.has('ManageGuild')) {
        return await message.reply('❌ You need **Manage Server** permissions to use this command.');
    }

    // Check if channel is provided
    if (args.length === 0) {
        return await message.reply('⚠️ Please provide a channel. Usage: `t!sendappealmessage #channel`');
    }

    const channelMention = args[0];
    const channelId = channelMention.replace(/[<>#]/g, '');
    const channel = message.guild.channels.cache.get(channelId);

    if (!channel) {
        return await message.reply('❌ Invalid channel provided. Please mention a valid channel.');
    }

    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const { createEmbed } = require('../utils/embedBuilder');

    const appealEmbed = createEmbed(
        'Appeal a Punishment',
        'Click the button below to appeal a punishment you received.',
        'appeal'
    );

    const appealButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('appeal_punishment')
                .setLabel('⚖️ Appeal Punishment')
                .setStyle(ButtonStyle.Secondary)
        );

    await channel.send({ embeds: [appealEmbed], components: [appealButton] });
    await message.reply(`✅ Appeal message sent to ${channel}`);
}

async function handleSendSupportMessage(message, args) {
    // Check permissions
    if (!message.member.permissions.has('ManageGuild')) {
        return await message.reply('❌ You need **Manage Server** permissions to use this command.');
    }

    // Check if channel is provided
    if (args.length === 0) {
        return await message.reply('⚠️ Please provide a channel. Usage: `t!sendsupportmessage #channel`');
    }

    const channelMention = args[0];
    const channelId = channelMention.replace(/[<>#]/g, '');
    const channel = message.guild.channels.cache.get(channelId);

    if (!channel) {
        return await message.reply('❌ Invalid channel provided. Please mention a valid channel.');
    }

    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const { createEmbed } = require('../utils/embedBuilder');

    const supportEmbed = createEmbed(
        'General Support',
        'Click the button below to get general support from our staff team.',
        'support'
    );

    const supportButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('general_support')
                .setLabel('🎫 Get Support')
                .setStyle(ButtonStyle.Primary)
        );

    await channel.send({ embeds: [supportEmbed], components: [supportButton] });
    await message.reply(`✅ Support message sent to ${channel}`);
}

async function handleHelpCommand(message) {
    const { createEmbed } = require('../utils/embedBuilder');

    const helpEmbed = createEmbed(
        'Support Bot Commands',
        'Here are all the available commands for the support bot:',
        'info'
    );

    helpEmbed.addFields(
        { name: '🔧 Setup Commands', value: '`/setup enable` - Enable support system\n`/setup report #channel` - Setup report system\n`/setup appeal #channel` - Setup appeal system\n`/setup support #channel` - Setup general support\n`/setup permissions` - Configure permissions', inline: false },
        { name: '📝 Legacy Commands', value: '`t!enablesupport` - Enable support system\n`t!sendreportmessage #channel` - Send report message\n`t!sendappealmessage #channel` - Send appeal message\n`t!sendsupportmessage #channel` - Send support message', inline: false },
        { name: '🎫 Ticket Features', value: '• Modal-based forms for detailed submissions\n• Automatic ticket channel creation\n• User information retrieval\n• Role-based permission system\n• Evidence link validation', inline: false },
        { name: '⚠️ Requirements', value: 'You need **Manage Server** permissions to use setup commands.', inline: false }
    );

    await message.reply({ embeds: [helpEmbed] });
}
