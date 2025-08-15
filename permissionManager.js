const { PermissionFlagsBits } = require('discord.js');
const { getGuildConfig, setGuildConfig } = require('../config/storage');

class PermissionManager {
    static hasPermission(member, permission) {
        const config = getGuildConfig(member.guild.id);
        const permissionRoles = config.permissions[permission] || [];
        
        // Check if user has any of the required roles
        return member.roles.cache.some(role => permissionRoles.includes(role.id)) ||
               member.permissions.has(PermissionFlagsBits.Administrator);
    }

    static addPermissionRole(guildId, permission, roleId) {
        const config = getGuildConfig(guildId);
        
        if (!config.permissions[permission]) {
            config.permissions[permission] = [];
        }
        
        if (!config.permissions[permission].includes(roleId)) {
            config.permissions[permission].push(roleId);
            setGuildConfig(guildId, config);
            return true;
        }
        
        return false;
    }

    static removePermissionRole(guildId, permission, roleId) {
        const config = getGuildConfig(guildId);
        
        if (config.permissions[permission]) {
            const index = config.permissions[permission].indexOf(roleId);
            if (index > -1) {
                config.permissions[permission].splice(index, 1);
                setGuildConfig(guildId, config);
                return true;
            }
        }
        
        return false;
    }

    static getPermissionRoles(guildId, permission) {
        const config = getGuildConfig(guildId);
        return config.permissions[permission] || [];
    }

    static getAllPermissions(guildId) {
        const config = getGuildConfig(guildId);
        return config.permissions || {};
    }

    static canTimeout(member) {
        return this.hasPermission(member, 'timeout') || 
               member.permissions.has(PermissionFlagsBits.ModerateMembers);
    }

    static canWarn(member) {
        return this.hasPermission(member, 'warn') || 
               member.permissions.has(PermissionFlagsBits.ManageMessages);
    }

    static canBan(member) {
        return this.hasPermission(member, 'ban') || 
               member.permissions.has(PermissionFlagsBits.BanMembers);
    }

    static canKick(member) {
        return this.hasPermission(member, 'kick') || 
               member.permissions.has(PermissionFlagsBits.KickMembers);
    }

    static canManageRoles(member) {
        return this.hasPermission(member, 'role') || 
               member.permissions.has(PermissionFlagsBits.ManageRoles);
    }

    static canManageNicknames(member) {
        return this.hasPermission(member, 'nickname') || 
               member.permissions.has(PermissionFlagsBits.ManageNicknames);
    }

    static isStaff(member) {
        const config = getGuildConfig(member.guild.id);
        
        // Check if user has any staff permissions
        const staffPermissions = ['timeout', 'warn', 'ban', 'kick', 'role', 'nickname'];
        
        return staffPermissions.some(permission => this.hasPermission(member, permission)) ||
               member.permissions.has(PermissionFlagsBits.ManageGuild) ||
               member.permissions.has(PermissionFlagsBits.Administrator);
    }

    static canAccessTickets(member) {
        return this.isStaff(member) || 
               member.permissions.has(PermissionFlagsBits.ManageChannels);
    }
}

module.exports = PermissionManager;
