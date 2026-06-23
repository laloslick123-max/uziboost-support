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

/* =========================
   CLIENTE ESTABLE
========================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

/* =========================
   🧠 CONFIG FIJA (SAAS SIMPLE)
========================= */
const CONFIG = {
  categoryName: "🎫・SOPORTE Y PEDIDOS",
  logChannel: "logs-tickets",
  staffRole: "STAFF BOT"
};

/* =========================
   READY FIX
========================= */
client.once("ready", () => {
  console.log(`✅ FIX BOT ONLINE COMO ${client.user.tag}`);
});

/* =========================
   PANEL (ESTABLE)
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!panel") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 UziBoost Support Panel")
      .setDescription("Selecciona una categoría para abrir tu ticket")
      .setColor("#a855f7");

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_create")
        .setPlaceholder("Selecciona una opción")
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
   TICKETS FIXED
========================= */
client.on("interactionCreate", async (interaction) => {
  try {

    /* ===== CREATE TICKET ===== */
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId !== "ticket_create") return;

      const guild = interaction.guild;

      const category = guild.channels.cache.find(
        c => c.name === CONFIG.categoryName
      );

      const channel = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: category ? category.id : null,
        permissionOverwrites: [
          {
            id: guild.id,
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

      const closeBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("❌ Cerrar Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `🎫 Ticket creado por <@${interaction.user.id}>`,
        components: [closeBtn]
      });

      return interaction.reply({
        content: `✅ Ticket creado: ${channel}`,
        ephemeral: true
      });
    }

    /* ===== CLOSE TICKET ===== */
    if (interaction.isButton()) {
      if (interaction.customId === "close_ticket") {
        await interaction.reply("🔒 Cerrando ticket...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 1500);
      }
    }

  } catch (err) {
    console.log("ERROR FIX BOT:", err);
  }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.TOKEN);
