const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ ${client.user.tag} is now online and ready!`);
        console.log(`📊 Serving ${client.guilds.cache.size} guilds with ${client.users.cache.size} users`);
        
        // Set bot activity/status
        client.user.setActivity({
            name: 'support tickets | /setup',
            type: ActivityType.Watching
        });

        // Log guild information
        console.log('\n📋 Connected Guilds:');
        client.guilds.cache.forEach(guild => {
            console.log(`   • ${guild.name} (${guild.id}) - ${guild.memberCount} members`);
        });

        // Set up periodic activity updates
        setInterval(() => {
            const activities = [
                { name: 'support tickets | /setup', type: ActivityType.Watching },
                { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
                { name: 'for reports and appeals', type: ActivityType.Listening },
                { name: 'ticket management', type: ActivityType.Playing }
            ];
            
            const activity = activities[Math.floor(Math.random() * activities.length)];
            client.user.setActivity(activity);
        }, 300000); // Change activity every 5 minutes

        console.log('\n🎫 Support Bot Features:');
        console.log('   • Report System - Users can report misconduct');
        console.log('   • Appeal System - Users can appeal punishments');
        console.log('   • General Support - Create support tickets');
        console.log('   • Permission Management - Role-based permissions');
        console.log('   • Modal Forms - Detailed submission forms');
        console.log('   • Ticket Channels - Automatic channel creation');
        console.log('\n🚀 Bot is fully operational!');
    },
};
