// In-memory storage for guild configurations
const guildConfigs = new Map();

// Default configuration for new guilds
const defaultConfig = {
    supportEnabled: false,
    supportGuildId: null,
    mainGuildId: null,
    reportChannelId: null,
    appealChannelId: null,
    supportChannelId: null,
    reportCategoryId: null,
    appealCategoryId: null,
    supportCategoryId: null,
    supportRoleId: null,
    permissions: {
        timeout: [],
        warn: [],
        ban: [],
        kick: [],
        role: [],
        nickname: []
    },
    ticketCounter: 0,
    activeTickets: new Map()
};

function getGuildConfig(guildId) {
    if (!guildConfigs.has(guildId)) {
        guildConfigs.set(guildId, { ...defaultConfig });
    }
    return guildConfigs.get(guildId);
}

function setGuildConfig(guildId, config) {
    guildConfigs.set(guildId, config);
    return config;
}

function updateGuildConfig(guildId, updates) {
    const config = getGuildConfig(guildId);
    const updatedConfig = { ...config, ...updates };
    setGuildConfig(guildId, updatedConfig);
    return updatedConfig;
}

function deleteGuildConfig(guildId) {
    return guildConfigs.delete(guildId);
}

function getAllGuildConfigs() {
    return Array.from(guildConfigs.entries());
}

function addActiveTicket(guildId, channelId, ticketData) {
    const config = getGuildConfig(guildId);
    config.activeTickets.set(channelId, {
        ...ticketData,
        createdAt: Date.now(),
        status: 'open'
    });
    setGuildConfig(guildId, config);
}

function getActiveTicket(guildId, channelId) {
    const config = getGuildConfig(guildId);
    return config.activeTickets.get(channelId);
}

function updateActiveTicket(guildId, channelId, updates) {
    const config = getGuildConfig(guildId);
    const ticket = config.activeTickets.get(channelId);
    if (ticket) {
        config.activeTickets.set(channelId, { ...ticket, ...updates });
        setGuildConfig(guildId, config);
        return true;
    }
    return false;
}

function removeActiveTicket(guildId, channelId) {
    const config = getGuildConfig(guildId);
    const result = config.activeTickets.delete(channelId);
    setGuildConfig(guildId, config);
    return result;
}

function getNextTicketNumber(guildId) {
    const config = getGuildConfig(guildId);
    config.ticketCounter += 1;
    setGuildConfig(guildId, config);
    return config.ticketCounter;
}

// Storage statistics
function getStorageStats() {
    const stats = {
        totalGuilds: guildConfigs.size,
        totalTickets: 0,
        activeTickets: 0
    };

    for (const [guildId, config] of guildConfigs) {
        stats.totalTickets += config.ticketCounter;
        stats.activeTickets += config.activeTickets.size;
    }

    return stats;
}

// Clean up old closed tickets (optional cleanup function)
function cleanupOldTickets(guildId, maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    const config = getGuildConfig(guildId);
    const now = Date.now();
    let cleaned = 0;

    for (const [channelId, ticket] of config.activeTickets) {
        if (ticket.status === 'closed' && (now - ticket.createdAt) > maxAge) {
            config.activeTickets.delete(channelId);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        setGuildConfig(guildId, config);
    }

    return cleaned;
}

module.exports = {
    getGuildConfig,
    setGuildConfig,
    updateGuildConfig,
    deleteGuildConfig,
    getAllGuildConfigs,
    addActiveTicket,
    getActiveTicket,
    updateActiveTicket,
    removeActiveTicket,
    getNextTicketNumber,
    getStorageStats,
    cleanupOldTickets
};
