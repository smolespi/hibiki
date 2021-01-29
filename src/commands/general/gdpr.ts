import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class GDPRCommand extends Command {
  description = "Sends you any bot data that's associated with you (or your server).";
  args = "[server:string]";
  aliases = ["data", "datadump"];
  cooldown = 60000;
  allowdms = true;
  allowdisable = false;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const type = pargs?.[0]?.value?.toLowerCase();

    // Server data dumping
    if (type === "server" || type === "guild") {
      if (!msg.channel.guild) {
        return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.GDPR_NOTSERVER"), "error");
      }

      if (msg.channel.guild.ownerID !== msg.author.id) {
        return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.GDPR_NOPERMS"), "error");
      }

      // Gets owner DM channel
      const ownerDM = await this.bot.users
        .get(msg.author.id)
        .getDMChannel()
        .catch(() => {});

      if (!ownerDM) return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.GDPR_NODMS"), "error");
      msg.addReaction("📬").catch(() => {});

      // Data to get
      const tables = {
        guildconfig: await this.bot.db.getGuildConfig(msg.channel.guild.id),
        mutecache: await this.bot.db.getGuildMuteCache(msg.channel.guild.id),
        points: await this.bot.db.getGuildPoints(msg.channel.guild.id),
        warnings: await this.bot.db.getGuildWarnings(msg.channel.guild.id),
      };

      // Removes junk
      Object.keys(tables).forEach((t) => {
        if (!tables[t] || (Array.isArray(tables[t]) && !tables[t]?.length)) delete tables[t];
      });

      // Creates the file
      const tablefile = Buffer.from(JSON.stringify(tables, null, 2));
      return ownerDM
        .createMessage(
          {
            embed: {
              title: `🌐 ${msg.string("general.GDPR")}`,
              description: msg.string("general.GDPR_DATA_SERVER"),
              color: msg.convertHex("general"),
            },
          },
          {
            file: tablefile,
            name: "data.json",
          },
        )
        .catch(() => {
          msg.createEmbed(msg.string("global.ERROR"), msg.string("general.GDPR_ERROR"), "error");
          return;
        });
    }

    // User data
    // Gets user's DM channel
    const userDM = await this.bot.users
      .get(msg.author.id)
      .getDMChannel()
      .catch(() => {});

    // Gets user data and handles if the user doesn't have their DMs open
    if (!userDM) return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.GDPR_NODMS"), "error");
    msg.addReaction("📬").catch(() => {});

    // Data to get
    const tables = {
      userconfig: await this.bot.db.getUserConfig(msg.author.id),
      economy: await this.bot.db.getUserCookies(msg.author.id),
      marriages: await this.bot.db.getUserMarriage(msg.author.id),
      mutecache: await this.bot.db.getUserMuteCache(msg.author.id),
      points: await this.bot.db.getUserPoints(msg.author.id),
      reminders: await this.bot.db.getUserReminders(msg.author.id),
      monitoring: await this.bot.db.getUserMonitoring(msg.author.id),
      warnings: await this.bot.db.getUserWarnings(msg.author.id),
    };

    // Removes junk
    Object.keys(tables).forEach((t) => {
      if (!tables[t] || (Array.isArray(tables[t]) && !tables[t]?.length)) delete tables[t];
    });

    // Creates a data file
    const tablefile = Buffer.from(JSON.stringify(tables, null, 2));
    return userDM
      .createMessage(
        {
          embed: {
            title: `🌐 ${msg.string("general.GDPR")}`,
            description: msg.string("general.GDPR_DATA"),
            color: msg.convertHex("general"),
          },
        },
        {
          file: tablefile,
          name: "data.json",
        },
      )
      .catch(() => {
        msg.createEmbed(msg.string("global.ERROR"), msg.string("general.GDPR_ERROR"), "error");
        return;
      });
  }
}
