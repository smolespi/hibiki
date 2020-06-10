const Command = require("structures/Command");

class whitelistCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<item:string>",
      description: "Removes a member or server from the blacklist.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args) {
    // Checks for id
    if (isNaN(args[0])) {
      if (!args[1]) return;
      if (isNaN(args[1])) return;
      // Updates db
      await this.bot.db.table("blacklist").filter({ guild: args[1] }).delete();
      msg.channel.createMessage(this.bot.embed("✅ Success", `Whitelisted **${args[1]}**.`, "success"));
    } else {
      // Whitelists user
      await this.bot.db.table("blacklist").filter({ user: args[0] }).delete();
      msg.channel.createMessage(this.bot.embed("✅ Success", `Whitelisted **${args[0]}**.`, "success"));
    }
  }
}

module.exports = whitelistCommand;
