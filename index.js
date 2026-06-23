import {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder
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
   ⚙️ CONFIG FIJA
========================= */
const CONFIG = {
  CATEGORY_NAME: "🎫・SOPORTE Y PEDIDOS",
  TICKET_CHANNEL: "🎫・crear-ticket",
  STAFF_ROLE_NAME: "STAFF BOT",
  LOG_CHANNEL: "logs-tickets"
};

/* =========================
   🟢 READY
========================= */
client.once("clientReady", async () => {
  console.log(`✅ UziBoost ONLINE como ${client.user.tag}`);

  const guild = client.guilds.cache.first();
  if (!guild) return;

  console.log("🔧 Configuración automática iniciada");
});

/* =========================
   🎫 PANEL AUTOMÁTICO
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!setup") {
    const channel = message.guild.channels.cache.find(
      c => c.name === CONFIG.TICKET_CHANNEL
    );

    if (!channel) {
      return message.reply("❌ No existe el canal 🎫・crear-ticket");
    }

    const embed = new EmbedBuilder()
      .setTitle("🎫 UziBoost Tickets")
      .setDescription(
        "Presiona el botón para abrir un ticket.\n\n" +
        "🔧 Soporte\n💰 Pedidos\n⚡ Optimización"
      )
      .setColor("#a855f7");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("🎫 Abrir Ticket")
        .setStyle(ButtonStyle.Success)
    );

    return channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

/* =========================
   🎫 TICKETS
========================= */
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    /* CREAR TICKET */
    if (interaction.customId === "create_ticket") {

      const category = interaction.guild.channels.cache.find(
        c => c.name === CONFIG.CATEGORY_NAME
      );

      const staffRole = interaction.guild.roles.cache.find(
        r => r.name === CONFIG.STAFF_ROLE_NAME
      );

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: category?.id || null,
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
          },
          ...(staffRole
            ? [{
                id: staffRole.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory
                ]
              }]
            : [])
        ]
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("❌ Cerrar Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `🎫 Ticket de <@${interaction.user.id}>`,
        components: [row]
      });

      return interaction.reply({
        content: `✅ Ticket creado: ${channel}`,
        ephemeral: true
      });
    }

    /* CERRAR */
    if (interaction.customId === "close_ticket") {
      await interaction.reply("🔒 Cerrando ticket...");
      setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
    }

  } catch (err) {
    console.log("ERROR:", err);
  }
});

/* =========================
   🔑 LOGIN
========================= */
client.login(process.env.TOKEN);
