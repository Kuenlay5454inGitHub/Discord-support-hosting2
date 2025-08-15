# Discord Support Bot

A comprehensive Discord support ticket system built with Discord.js v14. This bot enables users to create reports, appeals, and general support tickets through an intuitive button-based interface with modal forms.

## Features

### Ticket System
- **Report System**: Users can report misconduct with detailed forms
- **Appeal System**: Users can appeal punishments with structured submissions
- **General Support**: Create support tickets for general assistance

### Modal Forms
- **Report Form**: User ID (required), Accused Misconduct (required), Evidence (required), Additional Info (optional)
- **Appeal Form**: User ID (required), Punishment Reason (required), Why it's wrong (required), Additional Info (optional)

### Automatic Features
- **Ticket Channel Creation**: Creates private channels for each ticket type
- **User Information Display**: Shows if user is in support server or main server
- **Permission System**: Role-based access control for different moderation actions
- **Support Role Pinging**: Automatically pings designated support role

## Commands

### Legacy Prefix Commands (t!)
- `t!enablesupport` - Enable support system for the server
- `t!sendreportmessage #channel` - Send report button message to specified channel
- `t!sendappealmessage #channel` - Send appeal button message to specified channel  
- `t!sendsupportmessage #channel` - Send general support button message to specified channel
- `t!help` - Display help information

### Slash Commands (/setup)
- `/setup enable` - Enable support system for the server
- `/setup report #channel` - Setup report system in specified channel
- `/setup appeal #channel` - Setup appeal system in specified channel
- `/setup support #channel` - Setup general support system in specified channel
- `/setup permissions` - Configure moderation role permissions

## Installation

1. Clone this repository
2. Install dependencies: `npm install discord.js`
3. Set up your Discord application at https://discord.com/developers/applications
4. Add your bot token and client ID as environment variables:
   - `DISCORD_TOKEN` - Your bot's token
   - `CLIENT_ID` - Your application's client ID
5. Run the bot: `node index.js`

## Project Structure
