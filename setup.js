const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getGuildConfig, setGuildConfig } = require('../config/storage');
const { createEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the support ticket system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable the support system for this server'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('report')
                .setDescription('Setup report system')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel to send the report message')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('appeal')
                .setDescription('Setup appeal system')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel to send the appeal message')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('support')
                .setDescription('Setup general support system')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel to send the support message')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('permissions')
                .setDescription('Configure moderation permissions'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        let config = getGuildConfig(guildId);

        switch (subcommand) {
            case 'enable':
                config.supportEnabled = true;
                config.supportGuildId = guildId;
                setGuildConfig(guildId, config);
                
                const enableEmbed = createEmbed(
                    'Support System Enabled',
                    'The support ticket system has been successfully enabled for this server.',
                    'success'
                );
                
                await interaction.reply({ embeds: [enableEmbed], ephemeral: true });
                break;

            case 'report':
                const reportChannel = interaction.options.getChannel('channel');
                
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
                
                await reportChannel.send({ embeds: [reportEmbed], components: [reportButton] });
                
                config.reportChannelId = reportChannel.id;
                setGuildConfig(guildId, config);
                
                await interaction.reply({ 
                    content: `Report system setup completed in ${reportChannel}`, 
                    ephemeral: true 
                });
                break;

            case 'appeal':
                const appealChannel = interaction.options.getChannel('channel');
                
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
                
                await appealChannel.send({ embeds: [appealEmbed], components: [appealButton] });
                
                config.appealChannelId = appealChannel.id;
                setGuildConfig(guildId, config);
                
                await interaction.reply({ 
                    content: `Appeal system setup completed in ${appealChannel}`, 
                    ephemeral: true 
                });
                break;

            case 'support':
                const supportChannel = interaction.options.getChannel('channel');
                
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
                
                await supportChannel.send({ embeds: [supportEmbed], components: [supportButton] });
                
                config.supportChannelId = supportChannel.id;
                setGuildConfig(guildId, config);
                
                await interaction.reply({ 
                    content: `General support system setup completed in ${supportChannel}`, 
                    ephemeral: true 
                });
                break;

            case 'permissions':
                const permissionEmbed = createEmbed(
                    'Permission Setup',
                    'Use the buttons below to configure moderation permissions for different roles.',
                    'info'
                );
                
                const permissionButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('setup_timeout_perms')
                            .setLabel('Timeout Permissions')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('setup_warn_perms')
                            .setLabel('Warn Permissions')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('setup_ban_perms')
                            .setLabel('Ban Permissions')
                            .setStyle(ButtonStyle.Secondary)
                    );
                
                const permissionButtons2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('setup_kick_perms')
                            .setLabel('Kick Permissions')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('setup_role_perms')
                            .setLabel('Role Permissions')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('setup_nickname_perms')
                            .setLabel('Nickname Permissions')
                            .setStyle(ButtonStyle.Secondary)
                    );
                
                await interaction.reply({ 
                    embeds: [permissionEmbed], 
                    components: [permissionButtons, permissionButtons2], 
                    ephemeral: true 
                });
                break;
        }
    },
};
