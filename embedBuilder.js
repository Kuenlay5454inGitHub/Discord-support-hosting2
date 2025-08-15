const { EmbedBuilder } = require('discord.js');

const embedColors = {
    success: 0x00ff00,  // Green
    error: 0xff0000,    // Red
    warning: 0xffff00,  // Yellow
    info: 0x0099ff,     // Blue
    report: 0xff6b6b,   // Light red
    appeal: 0xffa500,   // Orange
    support: 0x4ecdc4   // Teal
};

const embedEmojis = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    report: '📝',
    appeal: '⚖️',
    support: '🎫'
};

function createEmbed(title, description, type = 'info') {
    const embed = new EmbedBuilder()
        .setTitle(`${embedEmojis[type] || ''} ${title}`)
        .setDescription(description)
        .setColor(embedColors[type] || embedColors.info)
        .setTimestamp()
        .setFooter({ 
            text: 'Support Ticket System',
            iconURL: 'https://cdn.discordapp.com/emojis/849803925702819860.png' // Example emoji URL
        });

    return embed;
}

function createTicketEmbed(type, user, data) {
    const embed = createEmbed(
        `${type.charAt(0).toUpperCase() + type.slice(1)} Ticket`,
        `New ${type} ticket created by ${user.tag}`,
        type
    );

    embed.addFields(
        { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: '💬 Status', value: 'Open', inline: true }
    );

    if (data) {
        for (const [key, value] of Object.entries(data)) {
            if (value && value.trim()) {
                embed.addField(key, value, false);
            }
        }
    }

    return embed;
}

function createUserInfoEmbed(user, member = null) {
    const embed = createEmbed(
        'User Information',
        `Information about ${user.tag}`,
        'info'
    );

    embed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
    
    embed.addFields(
        { name: '👤 Username', value: user.tag, inline: true },
        { name: '🆔 User ID', value: user.id, inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false }
    );

    if (member) {
        embed.addFields(
            { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
            { name: '🎭 Roles', value: member.roles.cache.map(role => role.name).slice(0, 10).join(', ') || 'None', inline: false }
        );
    }

    return embed;
}

function createErrorEmbed(title, description) {
    return createEmbed(title, description, 'error');
}

function createSuccessEmbed(title, description) {
    return createEmbed(title, description, 'success');
}

function createWarningEmbed(title, description) {
    return createEmbed(title, description, 'warning');
}

module.exports = {
    createEmbed,
    createTicketEmbed,
    createUserInfoEmbed,
    createErrorEmbed,
    createSuccessEmbed,
    createWarningEmbed,
    embedColors,
    embedEmojis
};
