const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { getGuildConfig } = require('../config/storage');
const { createEmbed } = require('../utils/embedBuilder');

async function handleReportModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('report_modal')
        .setTitle('Report a User');

    const userIdInput = new TextInputBuilder()
        .setCustomId('report_userid')
        .setLabel('User ID (Required)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter the user ID (enable developer mode)')
        .setRequired(true)
        .setMaxLength(20);

    const misconductInput = new TextInputBuilder()
        .setCustomId('report_misconduct')
        .setLabel('Accused Misconduct (Required)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Describe the misconduct (e.g., racial slurs in DMs)')
        .setRequired(true)
        .setMaxLength(1000);

    const evidenceInput = new TextInputBuilder()
        .setCustomId('report_evidence')
        .setLabel('Evidence (Required)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Provide evidence links (we accept catbox.moe!)')
        .setRequired(true)
        .setMaxLength(1000);

    const moreInfoInput = new TextInputBuilder()
        .setCustomId('report_moreinfo')
        .setLabel('Additional Information (Optional)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Any additional information that would help our team')
        .setRequired(false)
        .setMaxLength(1000);

    const firstActionRow = new ActionRowBuilder().addComponents(userIdInput);
    const secondActionRow = new ActionRowBuilder().addComponents(misconductInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(evidenceInput);
    const fourthActionRow = new ActionRowBuilder().addComponents(moreInfoInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

    await interaction.showModal(modal);
}

async function handleAppealModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('appeal_modal')
        .setTitle('Appeal a Punishment');

    const userIdInput = new TextInputBuilder()
        .setCustomId('appeal_userid')
        .setLabel('Your User ID (Required)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter your user ID (enable developer mode)')
        .setRequired(true)
        .setMaxLength(20);

    const punishmentReasonInput = new TextInputBuilder()
        .setCustomId('appeal_reason')
        .setLabel('Punishment Reason (Required)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('What were you punished for? (timeout, ban, warn, etc.)')
        .setRequired(true)
        .setMaxLength(1000);

    const whyWrongInput = new TextInputBuilder()
        .setCustomId('appeal_whywrong')
        .setLabel('Why do you think it\'s wrong? (Required)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Explain why you believe the punishment was incorrect')
        .setRequired(true)
        .setMaxLength(1000);

    const moreInfoInput = new TextInputBuilder()
        .setCustomId('appeal_moreinfo')
        .setLabel('Additional Information (Optional)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Any additional info that would increase your chances')
        .setRequired(false)
        .setMaxLength(1000);

    const firstActionRow = new ActionRowBuilder().addComponents(userIdInput);
    const secondActionRow = new ActionRowBuilder().addComponents(punishmentReasonInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(whyWrongInput);
    const fourthActionRow = new ActionRowBuilder().addComponents(moreInfoInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

    await interaction.showModal(modal);
}

async function processReportSubmission(interaction) {
    const userId = interaction.fields.getTextInputValue('report_userid');
    const misconduct = interaction.fields.getTextInputValue('report_misconduct');
    const evidence = interaction.fields.getTextInputValue('report_evidence');
    const moreInfo = interaction.fields.getTextInputValue('report_moreinfo') || 'None provided';

    const config = getGuildConfig(interaction.guild.id);
    
    // Validate user ID
    if (!/^\d{17,19}$/.test(userId)) {
        return await interaction.reply({ 
            content: '❌ Invalid user ID format. Please provide a valid Discord user ID.', 
            ephemeral: true 
        });
    }

    // Validate evidence links (basic URL validation)
    if (!evidence.includes('http') && !evidence.includes('catbox.moe')) {
        return await interaction.reply({ 
            content: '❌ Please provide valid evidence links (we accept catbox.moe links).', 
            ephemeral: true 
        });
    }

    try {
        // Create ticket channel
        const ticketChannel = await interaction.guild.channels.create({
            name: `report-${userId}`,
            type: ChannelType.GuildText,
            parent: config.reportCategoryId || null,
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

        // Get user info if possible
        let targetUser;
        let userInGuild = false;
        try {
            targetUser = await interaction.client.users.fetch(userId);
            userInGuild = !!(await interaction.guild.members.fetch(userId).catch(() => null));
        } catch (error) {
            targetUser = null;
        }

        const reportEmbed = createEmbed(
            'New User Report',
            `A new report has been submitted by ${interaction.user.tag}`,
            'report'
        );

        reportEmbed.addFields(
            { name: '👤 Reported User ID', value: userId, inline: true },
            { name: '👤 Reported User', value: targetUser ? `${targetUser.tag}` : 'User not found', inline: true },
            { name: '📍 In Support Server', value: userInGuild ? '✅ Yes' : '❌ No', inline: true },
            { name: '⚠️ Misconduct', value: misconduct, inline: false },
            { name: '📋 Evidence', value: evidence, inline: false },
            { name: '📝 Additional Info', value: moreInfo, inline: false },
            { name: '👮 Reporter', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false }
        );

        // Ping support role if configured
        let pingMessage = '';
        if (config.supportRoleId) {
            pingMessage = `<@&${config.supportRoleId}>`;
        } else {
            pingMessage = '<@&1393825551730610398>'; // Default role ID from request
        }

        await ticketChannel.send({ content: pingMessage, embeds: [reportEmbed] });

        await interaction.reply({ 
            content: `✅ Your report has been submitted successfully! Please check ${ticketChannel} for updates.`, 
            ephemeral: true 
        });

    } catch (error) {
        console.error('Error creating report ticket:', error);
        await interaction.reply({ 
            content: '❌ There was an error creating your report ticket. Please try again later.', 
            ephemeral: true 
        });
    }
}

async function processAppealSubmission(interaction) {
    const userId = interaction.fields.getTextInputValue('appeal_userid');
    const punishmentReason = interaction.fields.getTextInputValue('appeal_reason');
    const whyWrong = interaction.fields.getTextInputValue('appeal_whywrong');
    const moreInfo = interaction.fields.getTextInputValue('appeal_moreinfo') || 'None provided';

    const config = getGuildConfig(interaction.guild.id);
    
    // Validate user ID
    if (!/^\d{17,19}$/.test(userId)) {
        return await interaction.reply({ 
            content: '❌ Invalid user ID format. Please provide a valid Discord user ID.', 
            ephemeral: true 
        });
    }

    try {
        // Create ticket channel
        const ticketChannel = await interaction.guild.channels.create({
            name: `appeal-${userId}`,
            type: ChannelType.GuildText,
            parent: config.appealCategoryId || null,
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

        // Get user info if possible
        let targetUser;
        let userInGuild = false;
        try {
            targetUser = await interaction.client.users.fetch(userId);
            userInGuild = !!(await interaction.guild.members.fetch(userId).catch(() => null));
        } catch (error) {
            targetUser = null;
        }

        const appealEmbed = createEmbed(
            'New Punishment Appeal',
            `A new appeal has been submitted by ${interaction.user.tag}`,
            'appeal'
        );

        appealEmbed.addFields(
            { name: '👤 Appealing User ID', value: userId, inline: true },
            { name: '👤 Appealing User', value: targetUser ? `${targetUser.tag}` : 'User not found', inline: true },
            { name: '📍 In Support Server', value: userInGuild ? '✅ Yes' : '❌ No', inline: true },
            { name: '⚖️ Punishment Reason', value: punishmentReason, inline: false },
            { name: '🤔 Why They Think It\'s Wrong', value: whyWrong, inline: false },
            { name: '📝 Additional Info', value: moreInfo, inline: false },
            { name: '👮 Appellant', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false }
        );

        // Ping support role if configured
        let pingMessage = '';
        if (config.supportRoleId) {
            pingMessage = `<@&${config.supportRoleId}>`;
        } else {
            pingMessage = '<@&1393825551730610398>'; // Default role ID from request
        }

        await ticketChannel.send({ content: pingMessage, embeds: [appealEmbed] });

        await interaction.reply({ 
            content: `✅ Your appeal has been submitted successfully! Please check ${ticketChannel} for updates.`, 
            ephemeral: true 
        });

    } catch (error) {
        console.error('Error creating appeal ticket:', error);
        await interaction.reply({ 
            content: '❌ There was an error creating your appeal ticket. Please try again later.', 
            ephemeral: true 
        });
    }
}

module.exports = {
    handleReportModal,
    handleAppealModal,
    processReportSubmission,
    processAppealSubmission
};
