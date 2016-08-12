# Bobby V0.6.1
This is **Bobby**,
**Bobby** is a Discord bot that i am working on.
The prefix of **Bobby** is **.**

## Commands
- Main Commands
  - BotInfo
  - Calc
  - Commands
  - Help
  - Info
  - ServerInfo
  - Tag
  - UserInfo
  - Blacklist
- Admin Commands
  - InRole
- Master Commands (Only available to the Master user!)
  - GetInvite
  - Master
  - ServerList
  - Template
  - ZelakUpdate
  - BlacklistAdd
  - BlacklistRemove

## Basic Config.json setup
To setup **Bobby** you need to put in the right information at the **config.json** file located inside the **data** folder. Here is a example on how to set it up.
```json

{
	"login": {
		"token": "bot_token",
		"botid": "bot_id",
		"appid": "application_id"
	},
	"misc": {
		"prefix": "custom_prefix"
	},
	"acces": {
		"master": "master_user_id"
	}
}
```

_NOTE: You can only use **1** master_user_id! More will break the bot!_
