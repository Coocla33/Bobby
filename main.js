var Discord = require('discord.js')
var chalk = require('chalk')

var cmd = require('./commands.js')
var config = require('./data/config.json')

var bot = new Discord.Client()

var prefix = config.misc.prefix

var server_obj
var i

var user_cooldown = {}

var log_info = chalk.bold.green('INFO: ')
var log_warn = chalk.bold.yellow('WARNING: ')
var log_error = chalk.bold.red('ERROR: ')

var startup = new Date()

var log_time = function() {
	var date = new Date()
	return chalk.bold.cyan('[' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '] ')
}

var log = function(cmd_name, user_name, user_id, user_discrim) {
	console.log(log_time() + log_info + '[' + user_name + '#' + user_discrim + ' | ' + user_id + '] used the command: <' + cmd_name + '>')
}

console.log(log_time() + log_info + 'Starting up Bobby!')

bot.on("ready", () => {
	bot.setStatus("online", "Bobby | V0.5.2")

	var ready = new Date() - startup
	console.log(log_time() + log_info + 'Servers: ' + bot.servers.length)
	console.log(log_time() + log_info + 'users: ' + bot.users.length)
	console.log(log_time() + log_info + 'Time taken: ' + ready + 'ms')
})

bot.on("serverCreated", function(server) {
	bot.sendMessage(server.defaultChannel, 'Hi! I am Bobby! I am here to serve you! I can do lots of stuff! Just type `' + prefix + 'help` and i will show you what i can do!')
	console.log(log_time() + log_info + 'Joined a server with the name: <' + server.name + '>')
})

bot.on("message", function(msg) {
	if (msg.content.startsWith(prefix)) {
		var base = msg.content.substr(prefix.length)
		var stub = base.split(' ')
		var name = stub[0]
		var new_cooldown = 
		name = name.toLowerCase()
		var suffix = base.substr(stub[0].length + 1)
		try {
			if (cmd.execute[name]) {
				if (cmd.execute[name].master == true && msg.author.id == config.acces.master) {
					cmd.execute[name].fn(bot, msg, suffix)
					log(cmd.execute[name].name, msg.author.name, msg.author.id, msg.author.discriminator)
				}
				else if (cmd.execute[name].admin == true) {
					if (msg.server.roles.get('name', 'bobby commander')) {
						if (msg.author.id == msg.server.owner.id || bot.memberHasRole(msg.author.id, msg.server.roles.get('name', 'bobby commander'))) {
							cmd.execute[name].fn(bot, msg, suffix)
							log(cmd.execute[name].name, msg.author.name, msg.author.id, msg.author.discriminator)
						}
						else {
							bot.sendMessage(msg, 'I am sorry, but you dont have acces to this command!')
							console.log(log_time() + log_warn + '[' + msg.author.name + '#' + msg.author.discriminator + ' | ' + msg.author.id + '] tried to use the ADMIN command: <' + cmd.execute[name].name + '>')
						}
					}
					else {
						bot.sendMessage(msg, 'I am sorry but if you want to be able to use this command there should be a role in the server called: `bobby controller` (CASE SENSITIVE!)')
					}
				}
				else if (cmd.execute[name].admin == false && cmd.execute[name].master == false) {
					if (user_cooldown[msg.author.id]) {
						if (user_cooldown[msg.author.id][name]) {
							if (user_cooldown[msg.author.id][name].cooldown < new Date()) {
								cmd.execute[name].fn(bot, msg, suffix)
								log(cmd.execute[name].name, msg.author.name, msg.author.id, msg.author.discriminator)
								cooldown(new Date(), msg.author, cmd.execute[name].cooldown, name)
							}
							else {
								var wait_sec = (user_cooldown[msg.author.id][name].cooldown - new Date()) / 1000
								bot.sendMessage(msg, 'Oh ooh! It seems like you are trying to use commands to fast! You need to wait another `' + wait_sec + '` seconds!')
							}
						}
						else {
							cmd.execute[name].fn(bot, msg, suffix)
							log(cmd.execute[name].name, msg.author.name, msg.author.id, msg.author.discriminator)
							cooldown(new Date(), msg.author, cmd.execute[name].cooldown, name)
						}
					}
					else {
						cmd.execute[name].fn(bot, msg, suffix)
						log(cmd.execute[name].name, msg.author.name, msg.author.id, msg.author.discriminator)
						cooldown(new Date(), msg.author, cmd.execute[name].cooldown, name)
					}
				}
				else {
					bot.sendMessage(msg, 'I am sorry, but you dont have acces to this command!')
					console.log(log_time() + log_warn + '[' + msg.author.name + '#' + msg.author.discriminator + ' | ' + msg.author.id + '] tried to use the MASTER command: <' + cmd.execute[name].name + '>')
				}
			}
		}
		catch (err) {
			console.log(log_time() + log_warn + msg.author.name + ' attempt to execute <' + stub.join(' ') + '>')
			console.log(log_time() + log_error + err)
		}
	}
})	

var add_time = function(date, seconds) {
	return new Date(date.getTime() + seconds * 1000)
}

var cooldown = function(date, user, time, command_name) {
	var new_cooldown = new Date(date.getTime() + time)
	var user_id = user.id
	if (user_cooldown[user.id]) {
		if (user_cooldown[user.id][command_name]) {
			user_cooldown[user.id][command_name].cooldown = new_cooldown
		}
		else {
			user_cooldown[user.id][command_name] = {'cooldown': new_cooldown}
		}
	}
	else {
		user_cooldown[user.id] = {[command_name]: {'cooldown': new_cooldown}}
	}
}

bot.loginWithToken(config.login.token)
