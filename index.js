import {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  StringSelectMenuBuilder
} from "discord.js";

import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

/* =========================
   🧠 CONFIG SAAS (EDITABLE)
========================= */
const DB = new Map();

/* =========================
   🟢 READY (FIX IMPORTANTE)
========================= */
client.once("ready", () => {
  console.log(`✅ SAAS BOT ONLINE: ${client.user.tag}`);
});

/* =========================
   ⚙️ SETUP CONFIG
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!setup") {
    const config = {
      category: message.guild.channels.cache.find(c => c.name === "🎫・SOPORTE Y PEDIDOS")?.id,
      logs: message.guild.channels.cache.find(c => c.name === "logs-tickets")?.id
    };

    DB.set(message.guild.id, config);

    return message.reply("✅ Sistema SAAS configurado correctamente");
  }

  /* =========================
     🎫 PANEL
  ========================= */
  if (message.content === "!panel") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 UziBoost SAAS Support")
      .setDescription("Selecciona una opción para abrir ticket")
      .setColor("#a855f7");

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_menu")
        .setPlaceholder("Selecciona categoría")
        .addOptions(
          { label: "Soporte", value: "soporte", emoji: "🔧" },
          { label: "Compras", value: "compras", emoji: "💰" },
          { label: "Optimización", value: "opt", emoji: "⚡" }
        )
    );

    return message.channel.send({
      embeds: [embed],
      components: [menu]
    });
  }
});

/* =========================
   🎫 TICKETS PRO
========================= */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === "ticket_menu") {
    const config = DB.get(interaction.guild.id);

    if (!config) {
      return interaction.reply({
        content: "❌ Usa !setup primero",
        ephemeral: true
      });
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: config.category || null,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]
    });

    const btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("❌ Cerrar")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `🎫 Ticket de <@${interaction.user.id}>`,
      components: [btn]
    });

    return interaction.reply({
      content: `✅ Ticket creado: ${channel}`,
      ephemeral: true
    });
  }

  /* =========================
     ❌ CLOSE
  ========================= */
  if (interaction.isButton()) {
    if (interaction.customId === "close_ticket") {
      await interaction.reply("🔒 Cerrando...");
      setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
    }
  }
});

client.login(process.env.TOKEN);
