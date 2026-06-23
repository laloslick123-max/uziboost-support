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

/* =========================
   🤖 IA HÍBRIDA
========================= */
async function hybridAI(text) {
  const msg = text.toLowerCase();

  if (msg.includes("precio")) return "💰 Los precios están en la web oficial de UziBoost.";
  if (msg.includes("tiempo")) return "⏱️ Entregas entre 5-30 minutos.";
  if (msg.includes("hola")) return "👋 Hola! Soy UziBoost Support.";

  return "🤖 Un staff revisará tu caso en breve.";
}

/* =========================
   ✅ BOT READY
========================= */
client.once("clientReady", () => {
  console.log(`✅ UziBoost ONLINE como ${client.user.tag}`);
});

/* =========================
   💬 MENSAJES
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // PANEL COMANDO
  if (message.content === "!panel") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("🎫 Crear Ticket")
        .setStyle(ButtonStyle.Success)
    );

    return message.channel.send({
      content: "🎫 **UziBoost Support Panel**",
      components: [row]
    });
  }

  // IA EN TICKETS
  if (message.channel.name?.includes("ticket")) {
    const reply = await hybridAI(message.content);
    return message.reply(reply);
  }

  // DEBUG (opcional)
  if (message.content === "!ping") {
    return message.reply("🏓 Pong!");
  }
});

/* =========================
   🎫 SISTEMA DE TICKETS
========================= */
client.on("interactionCreate", async (interaction) => {
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
      content: "✅ Ticket creado",
      ephemeral: true
    });
  }

  // CERRAR TICKET
  if (interaction.customId === "close_ticket") {
    await interaction.reply("🔒 Cerrando ticket...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
  }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.TOKEN);
