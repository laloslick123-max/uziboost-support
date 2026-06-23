import {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
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

client.once("clientReady", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

/* ======================
   PANEL
====================== */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!panel") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("🎫 Crear Ticket")
        .setStyle(ButtonStyle.Success)
    );

    return message.channel.send({
      content: "🎫 Panel de Tickets UziBoost",
      components: [row]
    });
  }
});

/* ======================
   INTERACTIONS (TICKETS)
====================== */
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    // CREAR TICKET
    if (interaction.customId === "create_ticket") {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
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

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("❌ Cerrar Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `🎫 Ticket creado por <@${interaction.user.id}>`,
        components: [row]
      });

      return interaction.reply({
        content: "✅ Ticket creado correctamente",
        ephemeral: true
      });
    }

    // CERRAR TICKET
    if (interaction.customId === "close_ticket") {
      await interaction.reply("🔒 Cerrando ticket...");
      setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
    }
  } catch (err) {
    console.log("ERROR INTERACTION:", err);
  }
});

client.login(process.env.TOKEN);
