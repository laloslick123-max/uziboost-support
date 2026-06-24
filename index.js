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
   🧠 IA HÍBRIDA REAL
========================= */
function aiResponse(text) {
  const msg = text.toLowerCase();

  if (msg.includes("precio")) return "💰 Los precios están en la web de UziBoost.";
  if (msg.includes("tiempo")) return "⏱️ Tiempo estimado: 5-30 minutos.";
  if (msg.includes("hola")) return "👋 Hola! Soy UziBoost AI Support.";
  if (msg.includes("ayuda")) return "🧠 Dime tu problema y te ayudo.";

  return "🤖 Un staff o IA revisará tu mensaje pronto.";
}

/* =========================
   🟢 READY
========================= */
client.once("ready", () => {
  console.log(`✅ UziBoost SAAS V2 ONLINE: ${client.user.tag}`);
});

/* =========================
   🤖 IA EN MENSAJES (ESTO TE FALTABA)
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // IA GLOBAL EN TICKETS
  if (message.channel.name?.includes("ticket")) {
    const reply = aiResponse(message.content);
    return message.reply(reply);
  }

  // PANEL
  if (message.content === "!panel") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 UziBoost Support Center")
      .setDescription(
        "Selecciona una categoría para abrir tu ticket:\n\n" +
        "🔧 Soporte técnico\n💰 Compras\n⚡ Optimización\n\n" +
        "Sistema automático UziBoost SAAS"
      )
      .setColor("#a855f7");

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_create")
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
  try {

    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === "ticket_create") {

      const guild = interaction.guild;

      const category = guild.channels.cache.find(
        c => c.name === "🎫・SOPORTE Y PEDIDOS"
      );

      const channel = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: category?.id || null,
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
        content: `🎫 Ticket de <@${interaction.user.id}>`,
        components: [closeBtn]
      });

      return interaction.reply({
        content: `✅ Ticket creado: ${channel}`,
        ephemeral: true
      });
    }

    /* =========================
       CLOSE TICKET
    ========================= */
    if (interaction.isButton()) {
      if (interaction.customId === "close_ticket") {
        await interaction.reply("🔒 Cerrando ticket...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 1500);
      }
    }

  } catch (err) {
    console.log("ERROR SAAS V2:", err);
  }
});

/* =========================
   🔑 LOGIN
========================= */
client.login(process.env.TOKEN);
