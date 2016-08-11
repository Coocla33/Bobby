var config = require('./data/config.json')
var tags = require('./data/tags.json')
var fs = require('fs')
var chalk = require('chalk')
var zelakapi = require('zelak_api')

var prefix = config.misc.prefix
var log_error = chalk.bold.red('ERROR: ')

var log_time = function() {
	var date = new Date()
	return chalk.bold.cyan('[' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '] ')
}

var messageArray

var cmds = {
	template: {
		'name': 'template',
		'desc': '',
		'usage': '<>',
		'master': true,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			bot.sendMessage(msg, 'Template')
		}
	},
	master: {
		'name': 'master',
		'desc': 'Testing for Master User.',
		'usage': '<master>',
		'master': true,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			bot.sendMessage(msg, 'You are a master!')
		}
	},
	commands: {
		'name': 'commands',
		'desc': 'List of all commands. (Some users may see other commands then others)',
		'usage': '<commands>',
		'master': false,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			messageArray = []
			messageArray.push('These are all the commands:')
			messageArray.push('')
			messageArray.push('Main Commands:')
			messageArray.push(getCommandsMain())
			messageArray.push('')
			if (msg.author.id == config.acces.master) {
				messageArray.push('Master Commands:')
				messageArray.push(getCommandsMaster())
				messageArray.push('')
			}
			if (msg.author.id == msg.server.owner.id) {
				messageArray.push('Admin Commands:')
				messageArray.push(getCommandsAdmin())
				messageArray.push('')
			}
			messageArray.push('For more help on the commands do `' + prefix + 'help [command_name]`!')
			bot.sendMessage(msg, messageArray)
		}
	},
	help: {
		'name': 'help',
		'desc': 'Info about a command.',
		'usage': '<help [command_name]>',
		'master': false,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			if (suffix) {
				if (getCommandsHelp(suffix)) {
					bot.sendMessage(msg, getCommandsHelp(suffix))
				}
				else {
					bot.sendMessage(msg, 'That command does not exist! Type `' + prefix + 'commands` to see a list of all the commands!')
				}
			}
			else {
				bot.sendMessage(msg, 'You need to specifie a command first! Use it like this: `' + prefix + 'help [command_name]`')
			}
		}
	},
	info: {
		'name': 'info',
		'desc': 'Information about the bot',
		'usage': '<info>',
		'master': false,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			var messageArray = []
			messageArray.push('Hi, my name is Bobby! I heard you wanted some info about me!')
			messageArray.push('Well i use Discord.js!')
			messageArray.push('I am scripted in NodeJS.')
			messageArray.push('My creator is Coocla33!')
		}
	},
	botinfo: {
		'name': 'botinfo',
		'desc': 'Want to know some info about the bot? Here you go!',
		'usage': '<botinfo>',
		'master': false,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			var uptime = time(bot.uptime / 1000)
			messageArray = []
			messageArray.push('Uptime : **' + uptime.hour + ':' + uptime.min + ':' + uptime.sec + '**')
			messageArray.push('Servers : **' + bot.servers.length + '**')
			messageArray.push('Users : **' + bot.users.length + '**')
			messageArray.push('Channels : **' + bot.channels.length + '**')
			bot.sendMessage(msg, messageArray.join('\n'))
		}
	},
	tag: {
		'name': 'tag',
		'desc': 'The main tag command!',
		'usage': '<tag [create, list, info, tag_name] [tag_name] [tag_content]>',
		'master': false,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			var messageArray = []
			var args1 = suffix.toLowerCase().split(' ')[0]
			var args2 = suffix.toLowerCase().split(' ')[1]
			suffix = suffix.split(' ')
			suffix = suffix.splice(2, suffix.length).join(" ")
			if (args1 == 'create') {
				if (args2) {
					if (args2 != 'create' || args2 != 'list') {
						if (!tags[args2]) {
							if (suffix) {
								var d = new Date()
								var tagDate = d.getDay() + '-' + d.getMonth() + '-' + d.getFullYear() + ' | ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
								var tag = {"name": args2, "command": suffix, "creator": {"name": msg.author.name, "id": msg.author.id, "date": tagDate}}
								tags[args2] = tag
								fs.writeFile("./data/tags.json", JSON.stringify(tags, null, 4), function(err){
	                    			if (err) { console.log(log_time() + log_error + err) }
	               				 })
								bot.sendMessage(msg, 'Tag `'+ tags[args2].name + '` With the content of `' + tags[args2].command + '` created!')
							}
							else {
								bot.sendMessage(msg, 'You must add content for your tag first! Use it like this: `tag create example_name This is a example!`')
							}
						}
						else {
							bot.sendMessage(msg, 'There is already a tag with that name! Try another one!')
						}
					}
					else {
						bot.sendMessage(msg, 'You cannot create a tag called `Create, List`')
					}
				}
				else {
					bot.sendMessage(msg, 'You must add a name for your tag! Use it like this: `' + prefix + 'tag create example_name This is a example!`')
				}
			}
			else if (args1 == 'list') {
				messageArray.push('These are all the tags!')
				messageArray.push('')
				messageArray.push(getTagsList())
				messageArray.push('')
				messageArray.push('These are all the additions!')
				messageArray.push('')
				messageArray.push('**$<author_name>**, **$<author_id>**, **$<mention_name>**, **$<mention_id>**')
				messageArray.push('')
				messageArray.push('If u want to add a tag, just type `' + prefix + 'tag create [tag_name] [tag_content]`')
				bot.sendMessage(msg, messageArray)
			}
			else if (args1 == 'info') {
				if (args2) {
					if (tags[args2]) {
						messageArray.push('Tag info about the tag **' + tags[args2].name + '**')
						messageArray.push('Creator : **' + tags[args2].creator.name + '**')
						messageArray.push('Created at : **' + tags[args2].creator.date + '**')
						messageArray.push('Raw tag : **' + tags[args2].command + '**')
						bot.sendMessage(msg, messageArray)
					}
					else {
						bot.sendMessage(msg, 'The tag you spcified does not exist! Use `' + prefix + 'tag list` to see a list off all the tags!')
					}
				}
				else {
					bot.sendMessage(msg, 'You need to specify a command you want info about first! Use it like this: `' + prefix + 'tag info [tag_name]`')
				}
			}
			else if (tags[args1]) {
				var tagCommand = tags[args1].command
				var ready = true
				if (ready = true) {
					if (tagCommand.indexOf('$<author_name>') >= 0) {
						tagCommand = tagCommand.replace('$<author_name>', msg.author.name)
					}
				}
				if (ready = true) {
					if (tagCommand.indexOf('$<author_id>') >= 0 ) {
						tagCommand = tagCommand.replace('$<author_id>', msg.author.id)
					}
				}
				if (ready = true) {
					if (tagCommand.indexOf('$<mention_name>') >= 0) {
						if (msg.mentions.length >= 1) {
							tagCommand = tagCommand.replace('$<mention_name>', msg.mentions[0].name)
						}
						else {
							ready = false
							bot.sendMessage(msg, 'You need to mention a person first to use this tag!')
						}
					}
				}
				if (ready = true) {
					if (tagCommand.indexOf('$<mention_id>') >= 0) {
						if (msg.mentions.length >= 1) {
							tagCommand = tagCommand.replace('$<mention_id>', msg.mentions[0].id)
						}
						else {
							ready = false
							bot.sendMessage(msg, 'You need to mention a person first to use this tag!')
						}
					}
				}
				if (ready == true) {
					bot.sendMessage(msg, tagCommand)
				}
			}
			else {
				bot.sendMessage(msg, 'The tag you specified does not exist! Type: `' + prefix + 'tag list` to get a full list of all the tags!')
			}
		}
	},
	serverlist: {
		'name': 'serverlist',
		'desc': 'The full list of servers Bobby is in!',
		'usage': '<serverlist>',
		'master': true,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			bot.sendMessage(msg, '`(' + bot.servers.length + ')` | `' + bot.servers.map(server => server.name).join('`, `') + '`')
		}
	},
	calc: {
		'name': 'calc',
		'desc': 'This is for the people who are not good at Math or are lazy',
		'usage': '<calc [formula]>',
		'master': false,
		'admin': false,
		'cooldown': 10000,
		fn: function(bot, msg, suffix) {
			var messageArray = []
			if (suffix) {
				if (suffix.replace(/[^-()\d/*+.]/g, '')) {
					var formula = suffix.replace(/[^-()\d/*+.]/g, '')
					try {
						if (formula == '9+10') {
							messageArray.push('This was the formula you wanted a answer to: `' + formula + '`')
							messageArray.push('This is the answer: `21`')
						}
						else {
							messageArray.push('This was the formula you wanted a answer to: `' + formula + '`')
							messageArray.push('This is the answer: `' + eval(formula) + '`')
						}
						bot.sendMessage(msg, messageArray)
					}
					catch (err) {
						bot.sendMessage(msg, 'Oops! Something went wrong! Are you sure you put in a right formula?')
					}
				}
				else {
					bot.sendMessage(msg, 'Oops! Something went wrong! Are you sure you put in a right formula?')
				}
			}
			else {
				bot.sendMessage(msg, 'You need to add a formula first! Use it like this: `' + prefix + 'calc 1 + 1`')
			}
		}
	},
	userinfo: {
		'name': 'userinfo',
		'desc': 'Just showing some user info about users...',
		'usage': '<userinfo [mention]>',
		'master': false,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			var messageArray = []
			if (msg.mentions.length > 0) {
				var date_dm = function() {
				var dm = new Date(msg.mentions[0].createdAt)
				return '' + dm.getDay() + '/' + dm.getMonth() + '/' + dm.getFullYear() + ' | ' + dm.getHours() + ':' + dm.getMinutes() + ':' + dm.getSeconds()
				}
				messageArray.push('```')
				messageArray.push('Username : ' + msg.mentions[0].username)
				messageArray.push('Discrim  : ' + msg.mentions[0].discriminator)
				messageArray.push('Id       : ' + msg.mentions[0].id)
				messageArray.push('Status   : ' + msg.mentions[0].status)
				if (msg.mentions[0].game.name == null) {
					messageArray.push('Playing  : This use is not playing anything')
				}
				else {
					messageArray.push('Playing  : ' + msg.mentions[0].game.name)
				}
				messageArray.push('Bot      : ' + msg.mentions[0].bot)
				messageArray.push('Since    : ' + date_dm())
				messageArray.push('Avatar   : ' + msg.mentions[0].avatarURL)
				messageArray.push('```')
			}
			else {
				var date_dn = function() {
				var dn = new Date(msg.author.createdAt)
				return '' + dn.getDay() + '/' + dn.getMonth() + '/' + dn.getFullYear() + ' | ' + dn.getHours() + ':' + dn.getMinutes() + ':' + dn.getSeconds()
				}
				messageArray.push('```')
				messageArray.push('Username : ' + msg.author.username)
				messageArray.push('Discrim  : ' + msg.author.discriminator)
				messageArray.push('Id       : ' + msg.author.id)
				messageArray.push('Status   : ' + msg.author.status)
				if (msg.author.game.name == null) {
					messageArray.push('Playing  : This use is not playing anything')
				}
				else {
					messageArray.push('Playing  : ' + msg.author.game.name)
				}
				messageArray.push('Bot      : ' + msg.author.bot)
				messageArray.push('Since    : ' + date_dn())
				messageArray.push('Avatar   : ' + msg.author.avatarURL)
				messageArray.push('```')
			}
			bot.sendMessage(msg, messageArray)
		}
	},
	getinvite: {
		'name': 'getinvite',
		'desc': 'Gets a invite code for a server the bot is in!',
		'usage': '<getinvite [server_name]>',
		'master': true,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			zelakapi.getServerInvite(suffix, function(err, resp) {
				if (err) {
					return bot.sendMessage(msg, err)
				}
				bot.sendMessage(msg, resp)
			})
		}
	},
	zelakupdate: {
		'name': 'zelakupdate',
		'desc': 'Updates the server list to the Zelak Api',
		'usage': '<zelak_api>',
		'master': true,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			zelakapi.sendServersInvite(bot.servers, bot, function(err, status) {
				if (err) {
					return bot.sendMessage(msg, err)
				}
				bot.sendMessage(msg, 'Status: ' + status)
			})
		}
	},
	serverinfo: {
		'name': 'serverinfo',
		'desc': 'This command shows all the server info you need!',
		'usage': '<serverinfo>',
		'master': false,
		'admin': false,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			var date = function() {
				var dn = new Date(msg.server.createdAt)
				return '' + dn.getDay() + '/' + dn.getMonth() + '/' + dn.getFullYear() + ' | ' + dn.getHours() + ':' + dn.getMinutes() + ':' + dn.getSeconds()
			}
			var messageArray = []
			messageArray.push('```')
			messageArray.push('Name            : ' + msg.server.name)
			messageArray.push('Region   	   : ' + msg.server.region)
			messageArray.push('Id       	   : ' + msg.server.id)
			messageArray.push('Members  	   : ' + msg.server.members.length)
			messageArray.push('Channels 	   : ' + msg.server.channels.length)
			messageArray.push('Roles    	   : ' + msg.server.roles.map(roles => roles.name).join(', '))
			messageArray.push('Default Channel : ' + msg.server.defaultChannel.name)
			messageArray.push('Owner           : ' + msg.server.owner.name)
			messageArray.push('Created At      : ' + date())
			messageArray.push('Icon            : ' + msg.server.iconURL)
			messageArray.push('```')
			bot.sendMessage(msg, messageArray, {disableEveryone: true})
		}
	},
	inrole: {
		'name': 'inrole',
		'desc': 'This command shows you what players are in a specific role. (CASE SENSITIVE!)',
		'usage': '<inrole [role_name]>',
		'master': false,
		'admin': true,
		'cooldown': 3000,
		fn: function(bot, msg, suffix) {
			if (suffix) {
				var name = suffix
				if (msg.server.roles.get('name', name)) {
					var messageArray = []
					messageArray.push('(' + msg.server.usersWithRole(msg.server.roles.get('name', name)).length + ')')
					messageArray.push('**' + msg.server.usersWithRole(msg.server.roles.get('name', name)).map(users => users.name).join('**, **') + '**')
					bot.sendMessage(msg, messageArray, {disableEveryone: true})
				}
				else {
					bot.sendMessage(msg, 'Uh oh! That role does not exist!')
				}
			}
			else {
				bot.sendMessage(msg, 'You should mention a role first! Use the command like this: `' + prefix + 'inrole example role`')
			}
		}
	}
}

function getCommandsMain() {
	var cmdArray = []
	for (var cmd in cmds) {
		if (cmds[cmd].master == true && cmds[cmd].admin == true) {
			//Nothing
		}
		else { 
			cmdArray.push(cmds[cmd].name)
		}
	}
	return '**' + cmdArray.sort().join('**, **') + '**'
}

function getCommandsMaster() {
	var cmdArray = []
	for (var cmd in cmds) {
		if (cmds[cmd].master == true) {
			cmdArray.push(cmds[cmd].name)
		}
		else { 
			//Nothing
		}
	}
	return '**' + cmdArray.sort().join('**, **') + '**'
}

function getCommandsAdmin() {
	var cmdArray = []
	for (var cmd in cmds) {
		if (cmds[cmd].admin == true) {
			cmdArray.push(cmds[cmd].name)
		}
		else { 
			//Nothing
		}
	}
	return '**' + cmdArray.sort().join('**, **') + '**'
}

function getCommandsHelp(command) {
	var cmdArray = []
	if (cmds[command]) {
		cmdArray.push('Name : **' + cmds[command].name + '**')
		cmdArray.push('Description : **' + cmds[command].desc + '**')
		cmdArray.push('Usage : **' + cmds[command].usage + '**')
	}
	else {
		return 'You need to specifie a command first! Use it like this: `' + prefix + 'help [command_name]`'
	}
	return cmdArray.join('\n')
}

function getTagsList() {
	var tagArray = []
	for (var tag in tags) {
		tagArray.push(tags[tag].name)
	}
	return '**' + tagArray.sort().join('**, **') + '**'
}

function time(seconds) {
	var uptimeSecNum = parseInt(seconds, 10);
   	var uptimeHour = Math.floor(uptimeSecNum / 3600);
   	var uptimeMin = Math.floor((uptimeSecNum - (uptimeHour * 3600)) / 60);
   	var uptimeSec = (uptimeSecNum - (uptimeHour * 3600) - (uptimeMin * 60));
   	return {"sec": uptimeSec, "hour": uptimeHour, "min": uptimeMin};
}

exports.execute = cmds
