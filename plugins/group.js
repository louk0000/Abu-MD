const config = require("../config");
const { bot, isPublic } = require("../lib/");
const { isAdmin, parsedJid, isUrl } = require("../lib");
const { cron, saveSchedule } = require("../lib/scheduler");
bot(
  {
    pattern: "add ",
    fromMe: isPublic,
    desc: "Adds a person to group",
    type: "group",
  },
  async (message, match) => {
    if (!message.isGroup)
      return await message.reply("_This bot is for groups_");
    match = match || message.reply_message.jid;
    if (!match) return await message.reply("_Mention user to add");
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_I'm not admin_");
    let jid = parsedJid(match);
    await message.add(jid);
    return await message.reply(`@${jid[0].split("@")[0]} added`, {
      mentions: jid,
    });
  }
);

bot(
  {
    pattern: "kick ",
    fromMe: isPublic,
    desc: "kicks a person from group",
    type: "group",
  },
  async (message, match) => {
    if (!message.isGroup)
      return await message.reply("_This bot is for groups_");
    match = match || message.reply_message.jid;
    if (!match) return await message.reply("_Mention user to kick");
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_I'm not admin_");
    let jid = parsedJid(match);
    await message.kick(jid);
    return await message.reply(`@${jid[0].split("@")[0]} kicked`, {
      mentions: jid,
    });
  }
);

bot(
  {
    pattern: "promote ",
    fromMe: isPublic,
    desc: "promote a member",
    type: "group",
  },
  async (message, match) => {
    if (!message.isGroup)
      return await message.reply("_This bot is for groups_");
    match = match || message.reply_message.jid;
    if (!match) return await message.reply("_Mention user to promote_");
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_I'm not admin_");
    let jid = parsedJid(match);
    await message.promote(jid);
    return await message.reply(`@${jid[0].split("@")[0]} promoted as admin`, {
      mentions: jid,
    });
  }
);
bot(
  {
    pattern: "demote ",
    fromMe: isPublic,
    desc: "demote a member",
    type: "group",
  },
  async (message, match) => {
    if (!message.isGroup)
      return await message.reply("_This bot is for groups_");
    match = match || message.reply_message.jid;
    if (!match) return await message.reply("_Mention user to demote");
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_I'm not admin_");
    let jid = parsedJid(match);
    await message.demote(jid);
    return await message.reply(`@${jid[0].split("@")[0]} demoted from admin`, {
      mentions: jid,
    });
  }
);

bot(
  {
    pattern: "mute ?(.*)",
    fromMe: true,
    desc: "nute group",
    type: "group",
  },
  async (message, match, m, client) => {
    if (!message.isGroup)
      return await message.reply("_This bot is for groups_");
    if (!isAdmin(message.jid, message.user, message.client))
      return await message.reply("_I'm not admin_");
    await message.reply("_Muting_");
    return await client.groupSettingUpdate(message.jid, "announcement");
  }
);

bot(
  {
    pattern: "unmute ?(.*)",
    fromMe: true,
    desc: "unmute group",
    type: "group",
  },
  async (message, match, m, client) => {
    if (!message.isGroup)
      return await message.reply("_This bot is for groups_");
    if (!isAdmin(message.jid, message.user, message.client))
      return await message.reply("_I'm not admin_");
    await message.reply("_Unmuting_");
    return await client.groupSettingUpdate(message.jid, "not_announcement");
  }
);
bot(
  {
    pattern: "amute ?(.*)",
    fromMe: true,
    desc: "auto mutes group",
    type: "group",
  },
  async (message, match, m, client) => {
    if (!message.isGroup)
      return await message.reply("_This bot is for groups_");
    if (!match) return message.reply("_Enter time to mute_\nEg : amute 20:10");

    if (!isAdmin(message.jid, message.user, message.client))
      return await message.reply("_I'm not admin_");
    message.reply(`_Group will mute at ${match}_`);
    await saveSchedule(message.jid, match, async () => {
      await message.reply("_Muting_");
      return await client.groupSettingUpdate(message.jid, "announcement");
    });
    return cron(match, async () => {
      await message.reply("_Muting_");
      return await client.groupSettingUpdate(message.jid, "announcement");
    });
  }
);
bot(
  {
    pattern: "aunmute ?(.*)",
    fromMe: true,
    desc: "auto unmutes group",
    type: "group",
  },
  async (message, match, m, client) => {
    if (!message.isGroup)
      return await message.reply("_This bot is for groups_");
    if (!match)
      return message.reply("_Enter time to unmute_\nEg : aunmute 20:10");

    if (!isAdmin(message.jid, message.user, message.client))
      return await message.reply("_I'm not admin_");
    message.reply(`_Group will unmute at ${match}_`);
    await saveSchedule(message.jid, match, async () => {
      await message.reply("_Auto Unmuting_");
      return await client.groupSettingUpdate(message.jid, "not_announcement");
    });
    return cron(match, async () => {
      await message.reply("_Auto Unmuting_");
      return await client.groupSettingUpdate(message.jid, "not_announcement");
    });
  }
);
bot(
  {
    pattern: "gjid ?(.*)",
    fromMe: true,
    desc: "gets jid of all group members",
    type: "group",
  },
  async (message, match, m, client) => {
    if (!message.isGroup)
      return await message.reply("_This bot is for groups_");
    let { participants } = await client.groupMetadata(message.jid);
    let participant = participants.map((u) => u.id);
    let str = "╭──〔 *ɢʀᴏᴜᴘ ᴊɪᴅ* 〕\n";
    participant.forEach((result) => {
      str += `├ *${result}*\n`;
    });
    str += `╰──────────────`;
    message.reply(str);
  }
);

bot(
  {
    on: "text",
    fromMe: false,
  },
  async (message, match) => {
    if (!message.isGroup) return;
    if (config.ANTILINK)
      if (isUrl(match)) {
        await message.reply("_Link detected_");
        let botadmin = await isAdmin(message.jid, message.user, message.client);
        let senderadmin = await isAdmin(
          message.jid,
          message.participant,
          message.client
        );
        if (botadmin) {
          if (!senderadmin) {
            await message.reply(
              `_Commencing Specified Action :${config.ANTILINK_ACTION}_`
            );
            return await message[config.ANTILINK_ACTION]([message.participant]);
          }
        } else {
          return await message.reply("_I'm not admin_");
        }
      }
  }
);
