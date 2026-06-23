import { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } from "discord.js";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function hybridAI(message) {
  const msg = message.toLowerCase();

  if (msg.includes("precio")) return "💰 Revisa la web de UziBoost para precios.";
  if (msg.includes("hola")) return "👋 Hola! Soy UziBoost Support AI.";
  if (msg.includes("tiempo")) return "⏱️ 5-30 minutos promedio.";

  if (openai) {
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres soporte de UziBoost." },
          { role: "user", content: message }
        ]
      });
      return res.choices[0].message.content;
    } catch {
      return "⚠️ IA no disponible.";
    }
  }

  return "🤖 Un staff responderá pronto.";
}

client.once("ready", () => {
  console.log(`✅ UziBoost listo como ${client.user.tag}`);
});

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
      content: "🎫 Panel UziBoost",
      components: [row]
    });
  }

  if (message.channel.name?.includes("ticket")) {
    const reply = await hybridAI(message.content);
    return message.reply(reply);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

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

    await channel.send(`🎫 Ticket de <@${interaction.user.id}>`);

    return interaction.reply({ content: "✅ Ticket creado", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
