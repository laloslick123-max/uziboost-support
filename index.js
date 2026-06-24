import {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
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

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log(`✅ UziBoost ONLINE como ${client.user.tag}`);
});

/* =========================
   SLASH COMMAND PANEL
========================= */
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "panel") {

    const embed = new EmbedBuilder()
      .setTitle("🎫 UziBoost Support System")
      .setDescription(
        "Bienvenido al panel de soporte.\n\n" +
        "🔧 Soporte técnico\n💰 Compras\n⚡ Optimización PC\n\n" +
        "Selecciona una opción abajo."
      )
      .setColor("#a855f7");

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prices")
        .setLabel("Precios")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("payments")
        .setLabel("Pagos")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("requirements")
        .setLabel("Requisitos")
        .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket")
        .setLabel("🎫 Abrir Ticket")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("❌ Cerrar")
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row1, row2]
    });
  }
});

/* =========================
   BOTONES
========================= */
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isButton()) return;

  if (interaction.customId === "prices") {
    return interaction.reply({ content: "💰 Precios desde $X", ephemeral: true });
  }

  if (interaction.customId === "payments") {
    return interaction.reply({ content: "💳 PayPal / Stripe / Transferencia", ephemeral: true });
  }

  if (interaction.customId === "requirements") {
    return interaction.reply({ content: "📋 CPU, GPU, RAM, Windows actualizado", ephemeral: true });
  }

  /* ===== TICKETS ===== */
  if (interaction.customId === "open_ticket") {

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

    const btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("❌ Cerrar Ticket")
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

  if (interaction.customId === "close_ticket") {
    await interaction.reply("🔒 Cerrando...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 1500);
  }
});

client.login(process.env.TOKEN);
