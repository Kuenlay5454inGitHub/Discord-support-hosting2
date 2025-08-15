const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { getGuildConfig } = require('../config/storage');
const { createEmbed } = require('../utils/embedBuilder');
const { handleReportModal, handleAppealModal } = require('./modalHandler');

async function handleGeneralSupport(interaction) {
    const config = getGuildConfig(interaction.guild.id);
    
    try {
        // Create general support ticket channel
        const ticketChannel = await interaction.guild.channels.create({
            name: `support-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: config.supportCategoryId || null,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
            ],
        });

        const supportEmbed = createEmbed(
            'General Support Ticket',
            `Support ticket created for ${interaction.user.tag}`,
            'support'
        );

        supportEmbed.addFields(
            { name: '👤 User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
            { name: '📅 Created', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
            { name: '💬 Status', value: 'Open', inline: true },
            { name: '📝 Instructions', value: 'Please describe your issue and our support team will assist you shortly.', inline: false }
        );

        // Ping support role if configured
        let pingMessage = '';
        if (config.supportRoleId) {
            pingMessage = `<@&${config.supportRoleId}>`;
        } else {
            pingMessage = '<@&1393825551730610398>'; // Default role ID from request
        }

        await ticketChannel.send({ content: pingMessage, embeds: [supportEmbed] });

        await interaction.reply({ 
            content: `✅ Your support ticket has been created! Please check ${ticketChannel} for assistance.`, 
            ephemeral: true 
        });

    } catch (error) {
        console.error('Error creating support ticket:', error);
        await interaction.reply({ 
            content: '❌ There was an error creating your support ticket. Please try again later.', 
            ephemeral: true 
        });
    }
}

async function handlePermissionSetup(interaction, permissionType) {
    const config = getGuildConfig(interaction.guild.id);
    
    const roles = interaction.guild.roles.cache
        .filter(role => role.name !== '@everyone')
        .map(role => `${role.name} - ${role.id}`)
        .slice(0, 10) // Limit to first 10 roles for embed field limit
        .join('\n');

    const setupEmbed = createEmbed(
        `Setup ${permissionType} Permissions`,
        `Configure which roles can use ${permissionType.toLowerCase()} permissions.`,
        'info'
    );

    setupEmbed.addFields(
        { name: '📋 Available Roles', value: roles || 'No roles found', inline: false },
        { name: '⚙️ Instructions', value: `Please contact an administrator to manually configure ${permissionType} permissions for the desired roles.`, inline: false }
    );

    await interaction.reply({ embeds: [setupEmbed], ephemeral: true });
}

module.exports = {
    async handleButtonInteraction(interaction) {
        const customId = interaction.customId;

        switch (customId) {
            case 'report_user':
                await handleReportModal(interaction);
                break;

            case 'appeal_punishment':
                await handleAppealModal(interaction);
                break;

            case 'general_support':
                await handleGeneralSupport(interaction);
                break;

            case 'setup_timeout_perms':
                await handlePermissionSetup(interaction, 'Timeout');
                break;

            case 'setup_warn_perms':
                await handlePermissionSetup(interaction, 'Warn');
                break;

            case 'setup_ban_perms':
                await handlePermissionSetup(interaction, 'Ban');
                break;

            case 'setup_kick_perms':
                await handlePermissionSetup(interaction, 'Kick');
                break;

            case 'setup_role_perms':
                await handlePermissionSetup(interaction, 'Role');
                break;

            case 'setup_nickname_perms':
                await handlePermissionSetup(interaction, 'Nickname');
                break;

            default:
                await interaction.reply({ 
                    content: '❌ Unknown button interaction.', 
                    ephemeral: true 
                });
        }
    }
};
