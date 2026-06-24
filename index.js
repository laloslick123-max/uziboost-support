if (message.content === "!panel") {

  const embed = new EmbedBuilder()
    .setTitle("🎫 UziBoost Support Center")
    .setDescription(
`✨ Bienvenido al sistema oficial de soporte UziBoost

Selecciona una opción para recibir asistencia o abrir un ticket con nuestro equipo especializado.

🔧 Soporte técnico profesional
💰 Información de precios y servicios
⚡ Optimización y configuración avanzada

📌 Nuestro equipo responderá lo más rápido posible con atención personalizada.`
    )
    .setColor("#a855f7");

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("prices")
      .setLabel("💰 Precios")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("payments")
      .setLabel("💳 Pagos")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("requirements")
      .setLabel("⚙️ Requisitos")
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("🎫 Abrir Ticket")
      .setStyle(ButtonStyle.Success)
  );

  return message.channel.send({
    embeds: [embed],
    components: [row1, row2]
  });
}
