const { InteractionType } = require('discord.js');
const { handleButtonInteraction } = require('../handlers/buttonHandler');
const { processReportSubmission, processAppealSubmission } = require('../handlers/modalHandler');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            // Handle slash commands
            if (interaction.type === InteractionType.ApplicationCommand) {
                const command = interaction.client.slashCommands.get(interaction.commandName);

                if (!command) {
                    return await interaction.reply({ 
                        content: '❌ This command is not recognized.', 
                        ephemeral: true 
                    });
                }

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(`Error executing command ${interaction.commandName}:`, error);
                    
                    const errorMessage = {
                        content: '❌ There was an error executing this command. Please try again later.',
                        ephemeral: true
                    };

                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(errorMessage);
                    } else {
                        await interaction.reply(errorMessage);
                    }
                }
            }

            // Handle button interactions
            else if (interaction.type === InteractionType.MessageComponent && interaction.isButton()) {
                await handleButtonInteraction(interaction);
            }

            // Handle modal submissions
            else if (interaction.type === InteractionType.ModalSubmit) {
                switch (interaction.customId) {
                    case 'report_modal':
                        await processReportSubmission(interaction);
                        break;
                        
                    case 'appeal_modal':
                        await processAppealSubmission(interaction);
                        break;
                        
                    default:
                        await interaction.reply({ 
                            content: '❌ Unknown modal submission.', 
                            ephemeral: true 
                        });
                }
            }

            // Handle select menu interactions (for future expansion)
            else if (interaction.type === InteractionType.MessageComponent && interaction.isSelectMenu()) {
                // Handle select menu interactions here if needed
                await interaction.reply({ 
                    content: '⚠️ Select menu interactions are not yet implemented.', 
                    ephemeral: true 
                });
            }

            // Handle autocomplete interactions (for future expansion)
            else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
                // Handle autocomplete here if needed
                const command = interaction.client.slashCommands.get(interaction.commandName);
                
                if (command && command.autocomplete) {
                    try {
                        await command.autocomplete(interaction);
                    } catch (error) {
                        console.error(`Error in autocomplete for ${interaction.commandName}:`, error);
                    }
                }
            }

        } catch (error) {
            console.error('Error in interactionCreate event:', error);
            
            // Attempt to send an error message if interaction hasn't been handled
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ 
                        content: '❌ An unexpected error occurred. Please try again later.', 
                        ephemeral: true 
                    });
                }
            } catch (replyError) {
                console.error('Failed to send error reply:', replyError);
            }
        }
    },
};
