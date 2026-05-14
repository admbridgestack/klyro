-- 84 message templates: 7 active verticals × 2 channels × 2 languages × 3 types
-- Variables use {placeholder} syntax resolved by the MessageRouter at send time.

do $$
declare
  v_verticals text[] := array['barbershop','salon','fitness','spa','tattoo','carwash','petgrooming'];
  v_vertical  text;
begin

-- ─────────────────────────────────────────────────────────────────────────────
-- BARBERSHOP
-- ─────────────────────────────────────────────────────────────────────────────
foreach v_vertical in array v_verticals loop

if v_vertical = 'barbershop' then

  -- whatsapp / es
  insert into message_templates (type, channel, language, vertical, content, variables) values
  ('confirmation', 'whatsapp', 'es', 'barbershop',
   '¡Hola {nombre}! Tu corte está confirmado para {fecha} a las {hora} con {staff}. Te esperamos en {dirección}. 💈',
   '["nombre","fecha","hora","staff","dirección"]'),
  ('reminder_24h', 'whatsapp', 'es', 'barbershop',
   '¡{nombre}, te recordamos tu turno mañana {fecha} a las {hora} con {staff}! 💈 Si necesitas cancelar, avísanos.',
   '["nombre","fecha","hora","staff"]'),
  ('cancellation', 'whatsapp', 'es', 'barbershop',
   'Hola {nombre}, tu turno del {fecha} a las {hora} ha sido cancelado. Puedes agendar uno nuevo cuando quieras.',
   '["nombre","fecha","hora"]');

  -- whatsapp / en
  insert into message_templates (type, channel, language, vertical, content, variables) values
  ('confirmation', 'whatsapp', 'en', 'barbershop',
   'Hi {nombre}! Your haircut is confirmed for {fecha} at {hora} with {staff}. See you at {dirección}. 💈',
   '["nombre","fecha","hora","staff","dirección"]'),
  ('reminder_24h', 'whatsapp', 'en', 'barbershop',
   'Hey {nombre}, just a reminder about your appointment tomorrow {fecha} at {hora} with {staff}! 💈',
   '["nombre","fecha","hora","staff"]'),
  ('cancellation', 'whatsapp', 'en', 'barbershop',
   'Hi {nombre}, your appointment on {fecha} at {hora} has been cancelled. Book again anytime.',
   '["nombre","fecha","hora"]');

  -- email / es
  insert into message_templates (type, channel, language, vertical, content, variables) values
  ('confirmation', 'email', 'es', 'barbershop',
   'Hola {nombre},\n\nTu turno en {negocio} está confirmado.\n\nFecha: {fecha}\nHora: {hora}\nServicio: {servicio}\nBarbero: {staff}\nDirección: {dirección}\n\n¡Te esperamos! 💈',
   '["nombre","negocio","fecha","hora","servicio","staff","dirección"]'),
  ('reminder_24h', 'email', 'es', 'barbershop',
   'Hola {nombre},\n\nTe recordamos que mañana tienes un turno en {negocio}.\n\nFecha: {fecha}\nHora: {hora}\nBarbero: {staff}\n\n¡Te esperamos!',
   '["nombre","negocio","fecha","hora","staff"]'),
  ('cancellation', 'email', 'es', 'barbershop',
   'Hola {nombre},\n\nTu turno del {fecha} a las {hora} en {negocio} ha sido cancelado.\n\nPuedes agendar uno nuevo en: {link}',
   '["nombre","fecha","hora","negocio","link"]');

  -- email / en
  insert into message_templates (type, channel, language, vertical, content, variables) values
  ('confirmation', 'email', 'en', 'barbershop',
   'Hi {nombre},\n\nYour appointment at {negocio} is confirmed.\n\nDate: {fecha}\nTime: {hora}\nService: {servicio}\nBarber: {staff}\nAddress: {dirección}\n\nSee you there! 💈',
   '["nombre","negocio","fecha","hora","servicio","staff","dirección"]'),
  ('reminder_24h', 'email', 'en', 'barbershop',
   'Hi {nombre},\n\nReminder: you have an appointment at {negocio} tomorrow.\n\nDate: {fecha}\nTime: {hora}\nBarber: {staff}',
   '["nombre","negocio","fecha","hora","staff"]'),
  ('cancellation', 'email', 'en', 'barbershop',
   'Hi {nombre},\n\nYour appointment on {fecha} at {hora} at {negocio} has been cancelled.\n\nBook again at: {link}',
   '["nombre","fecha","hora","negocio","link"]');

-- ─────────────────────────────────────────────────────────────────────────────
elsif v_vertical = 'salon' then

  insert into message_templates (type, channel, language, vertical, content, variables) values
  ('confirmation', 'whatsapp', 'es', 'salon',
   '¡Hola {nombre}! Tu cita de {servicio} está confirmada para {fecha} a las {hora} con {staff}. ✨',
   '["nombre","servicio","fecha","hora","staff"]'),
  ('reminder_24h', 'whatsapp', 'es', 'salon',
   '¡{nombre}, mañana es tu día! Tu cita de {servicio} a las {hora} con {staff}. ✨',
   '["nombre","servicio","hora","staff"]'),
  ('cancellation', 'whatsapp', 'es', 'salon',
   'Hola {nombre}, tu cita del {fecha} a las {hora} fue cancelada. ¡Agenda de nuevo cuando quieras!',
   '["nombre","fecha","hora"]'),
  ('confirmation', 'whatsapp', 'en', 'salon',
   'Hi {nombre}! Your {servicio} appointment is confirmed for {fecha} at {hora} with {staff}. ✨',
   '["nombre","servicio","fecha","hora","staff"]'),
  ('reminder_24h', 'whatsapp', 'en', 'salon',
   'Hey {nombre}, tomorrow is your {servicio} appointment at {hora} with {staff}. ✨',
   '["nombre","servicio","hora","staff"]'),
  ('cancellation', 'whatsapp', 'en', 'salon',
   'Hi {nombre}, your appointment on {fecha} at {hora} has been cancelled. Book again anytime!',
   '["nombre","fecha","hora"]'),
  ('confirmation', 'email', 'es', 'salon',
   'Hola {nombre},\n\nTu cita en {negocio} está confirmada.\n\nFecha: {fecha}\nHora: {hora}\nServicio: {servicio}\nEstilista: {staff}\n\n¡Te esperamos! ✨',
   '["nombre","negocio","fecha","hora","servicio","staff"]'),
  ('reminder_24h', 'email', 'es', 'salon',
   'Hola {nombre},\n\nRecordatorio: mañana tienes tu cita en {negocio}.\n\nFecha: {fecha}\nHora: {hora}\nServicio: {servicio}',
   '["nombre","negocio","fecha","hora","servicio"]'),
  ('cancellation', 'email', 'es', 'salon',
   'Hola {nombre},\n\nTu cita del {fecha} en {negocio} fue cancelada.\n\nAgenda de nuevo en: {link}',
   '["nombre","fecha","negocio","link"]'),
  ('confirmation', 'email', 'en', 'salon',
   'Hi {nombre},\n\nYour appointment at {negocio} is confirmed.\n\nDate: {fecha}\nTime: {hora}\nService: {servicio}\nStylist: {staff}',
   '["nombre","negocio","fecha","hora","servicio","staff"]'),
  ('reminder_24h', 'email', 'en', 'salon',
   'Hi {nombre},\n\nReminder: your {servicio} appointment at {negocio} is tomorrow at {hora}.',
   '["nombre","servicio","negocio","hora"]'),
  ('cancellation', 'email', 'en', 'salon',
   'Hi {nombre},\n\nYour appointment on {fecha} at {negocio} has been cancelled. Book again at: {link}',
   '["nombre","fecha","negocio","link"]');

-- ─────────────────────────────────────────────────────────────────────────────
elsif v_vertical = 'fitness' then

  insert into message_templates (type, channel, language, vertical, content, variables) values
  ('confirmation', 'whatsapp', 'es', 'fitness',
   '¡{nombre}! Tu sesión está confirmada para {fecha} a las {hora} con {staff}. ¡A darle! 💪',
   '["nombre","fecha","hora","staff"]'),
  ('reminder_24h', 'whatsapp', 'es', 'fitness',
   '¡{nombre}, mañana entrenas! Tu sesión con {staff} a las {hora}. ¡Sin pretextos! 💪',
   '["nombre","staff","hora"]'),
  ('cancellation', 'whatsapp', 'es', 'fitness',
   'Hola {nombre}, tu sesión del {fecha} a las {hora} fue cancelada. ¡Agenda tu próxima sesión!',
   '["nombre","fecha","hora"]'),
  ('confirmation', 'whatsapp', 'en', 'fitness',
   'Hey {nombre}! Your session is confirmed for {fecha} at {hora} with {staff}. Let''s go! 💪',
   '["nombre","fecha","hora","staff"]'),
  ('reminder_24h', 'whatsapp', 'en', 'fitness',
   'Hey {nombre}, you train tomorrow! Your session with {staff} at {hora}. No excuses! 💪',
   '["nombre","staff","hora"]'),
  ('cancellation', 'whatsapp', 'en', 'fitness',
   'Hi {nombre}, your session on {fecha} at {hora} has been cancelled. Book your next session!',
   '["nombre","fecha","hora"]'),
  ('confirmation', 'email', 'es', 'fitness',
   'Hola {nombre},\n\nTu sesión en {negocio} está confirmada.\n\nFecha: {fecha}\nHora: {hora}\nEntrenador: {staff}',
   '["nombre","negocio","fecha","hora","staff"]'),
  ('reminder_24h', 'email', 'es', 'fitness',
   'Hola {nombre},\n\n¡Mañana entrenas en {negocio}!\n\nFecha: {fecha}\nHora: {hora}\nEntrenador: {staff}',
   '["nombre","negocio","fecha","hora","staff"]'),
  ('cancellation', 'email', 'es', 'fitness',
   'Hola {nombre},\n\nTu sesión del {fecha} en {negocio} fue cancelada. Agenda en: {link}',
   '["nombre","fecha","negocio","link"]'),
  ('confirmation', 'email', 'en', 'fitness',
   'Hi {nombre},\n\nYour training session at {negocio} is confirmed.\n\nDate: {fecha}\nTime: {hora}\nTrainer: {staff}',
   '["nombre","negocio","fecha","hora","staff"]'),
  ('reminder_24h', 'email', 'en', 'fitness',
   'Hi {nombre},\n\nYou train tomorrow at {negocio}!\n\nDate: {fecha}\nTime: {hora}\nTrainer: {staff}',
   '["nombre","negocio","fecha","hora","staff"]'),
  ('cancellation', 'email', 'en', 'fitness',
   'Hi {nombre},\n\nYour session on {fecha} at {negocio} has been cancelled. Book at: {link}',
   '["nombre","fecha","negocio","link"]');

-- ─────────────────────────────────────────────────────────────────────────────
elsif v_vertical = 'spa' then

  insert into message_templates (type, channel, language, vertical, content, variables) values
  ('confirmation', 'whatsapp', 'es', 'spa',
   'Hola {nombre}, tu {servicio} está reservado para {fecha} a las {hora}. Te esperamos para tu momento de bienestar. 🌿',
   '["nombre","servicio","fecha","hora"]'),
  ('reminder_24h', 'whatsapp', 'es', 'spa',
   'Hola {nombre}, mañana es tu {servicio} a las {hora} en {negocio}. Recuerda llegar 10 minutos antes. 🌿',
   '["nombre","servicio","hora","negocio"]'),
  ('cancellation', 'whatsapp', 'es', 'spa',
   'Hola {nombre}, tu reserva del {fecha} a las {hora} fue cancelada. Estamos para atenderte cuando lo necesites.',
   '["nombre","fecha","hora"]'),
  ('confirmation', 'whatsapp', 'en', 'spa',
   'Hello {nombre}, your {servicio} is booked for {fecha} at {hora}. We look forward to your wellness moment. 🌿',
   '["nombre","servicio","fecha","hora"]'),
  ('reminder_24h', 'whatsapp', 'en', 'spa',
   'Hello {nombre}, your {servicio} is tomorrow at {hora} at {negocio}. Please arrive 10 minutes early. 🌿',
   '["nombre","servicio","hora","negocio"]'),
  ('cancellation', 'whatsapp', 'en', 'spa',
   'Hello {nombre}, your booking on {fecha} at {hora} has been cancelled. We''re here whenever you need us.',
   '["nombre","fecha","hora"]'),
  ('confirmation', 'email', 'es', 'spa',
   'Hola {nombre},\n\nTu {servicio} en {negocio} está confirmado.\n\nFecha: {fecha}\nHora: {hora}\nTerapeuta: {staff}\n\nTe esperamos. 🌿',
   '["nombre","servicio","negocio","fecha","hora","staff"]'),
  ('reminder_24h', 'email', 'es', 'spa',
   'Hola {nombre},\n\nMañana es tu {servicio} en {negocio}.\n\nFecha: {fecha}\nHora: {hora}\n\nRecuerda llegar 10 minutos antes.',
   '["nombre","servicio","negocio","fecha","hora"]'),
  ('cancellation', 'email', 'es', 'spa',
   'Hola {nombre},\n\nTu reserva del {fecha} en {negocio} fue cancelada. Puedes agendar de nuevo en: {link}',
   '["nombre","fecha","negocio","link"]'),
  ('confirmation', 'email', 'en', 'spa',
   'Hello {nombre},\n\nYour {servicio} at {negocio} is confirmed.\n\nDate: {fecha}\nTime: {hora}\nTherapist: {staff}\n\nWe look forward to seeing you. 🌿',
   '["nombre","servicio","negocio","fecha","hora","staff"]'),
  ('reminder_24h', 'email', 'en', 'spa',
   'Hello {nombre},\n\nYour {servicio} at {negocio} is tomorrow.\n\nDate: {fecha}\nTime: {hora}\n\nPlease arrive 10 minutes early.',
   '["nombre","servicio","negocio","fecha","hora"]'),
  ('cancellation', 'email', 'en', 'spa',
   'Hello {nombre},\n\nYour booking on {fecha} at {negocio} has been cancelled. Book again at: {link}',
   '["nombre","fecha","negocio","link"]');

-- ─────────────────────────────────────────────────────────────────────────────
elsif v_vertical = 'tattoo' then

  insert into message_templates (type, channel, language, vertical, content, variables) values
  ('confirmation', 'whatsapp', 'es', 'tattoo',
   '¡Hola {nombre}! Tu sesión de {servicio} está confirmada para {fecha} a las {hora} con {staff}. 🖊️',
   '["nombre","servicio","fecha","hora","staff"]'),
  ('reminder_24h', 'whatsapp', 'es', 'tattoo',
   '¡{nombre}, mañana es tu sesión con {staff} a las {hora}! 🖊️ Recuerda hidratarte y desayunar bien.',
   '["nombre","staff","hora"]'),
  ('cancellation', 'whatsapp', 'es', 'tattoo',
   'Hola {nombre}, tu sesión del {fecha} fue cancelada. Contáctanos para reagendar.',
   '["nombre","fecha"]'),
  ('confirmation', 'whatsapp', 'en', 'tattoo',
   'Hey {nombre}! Your {servicio} session is confirmed for {fecha} at {hora} with {staff}. 🖊️',
   '["nombre","servicio","fecha","hora","staff"]'),
  ('reminder_24h', 'whatsapp', 'en', 'tattoo',
   'Hey {nombre}, your session with {staff} is tomorrow at {hora}! 🖊️ Remember to hydrate and eat well.',
   '["nombre","staff","hora"]'),
  ('cancellation', 'whatsapp', 'en', 'tattoo',
   'Hi {nombre}, your session on {fecha} has been cancelled. Contact us to reschedule.',
   '["nombre","fecha"]'),
  ('confirmation', 'email', 'es', 'tattoo',
   'Hola {nombre},\n\nTu sesión en {negocio} está confirmada.\n\nFecha: {fecha}\nHora: {hora}\nArtista: {staff}\n\nRecuerda: hidratación y buen desayuno el día de tu cita.',
   '["nombre","negocio","fecha","hora","staff"]'),
  ('reminder_24h', 'email', 'es', 'tattoo',
   'Hola {nombre},\n\nMañana es tu sesión en {negocio}.\n\nFecha: {fecha}\nHora: {hora}\nArtista: {staff}',
   '["nombre","negocio","fecha","hora","staff"]'),
  ('cancellation', 'email', 'es', 'tattoo',
   'Hola {nombre},\n\nTu sesión del {fecha} en {negocio} fue cancelada. Contáctanos para reagendar.',
   '["nombre","fecha","negocio"]'),
  ('confirmation', 'email', 'en', 'tattoo',
   'Hi {nombre},\n\nYour session at {negocio} is confirmed.\n\nDate: {fecha}\nTime: {hora}\nArtist: {staff}\n\nRemember: hydrate and eat well on the day of your appointment.',
   '["nombre","negocio","fecha","hora","staff"]'),
  ('reminder_24h', 'email', 'en', 'tattoo',
   'Hi {nombre},\n\nYour session at {negocio} is tomorrow.\n\nDate: {fecha}\nTime: {hora}\nArtist: {staff}',
   '["nombre","negocio","fecha","hora","staff"]'),
  ('cancellation', 'email', 'en', 'tattoo',
   'Hi {nombre},\n\nYour session on {fecha} at {negocio} has been cancelled. Contact us to reschedule.',
   '["nombre","fecha","negocio"]');

-- ─────────────────────────────────────────────────────────────────────────────
elsif v_vertical = 'carwash' then

  insert into message_templates (type, channel, language, vertical, content, variables) values
  ('confirmation', 'whatsapp', 'es', 'carwash',
   'Listo {nombre}, tu vehículo tiene cita el {fecha} a las {hora} en {sucursal}. 🚗',
   '["nombre","fecha","hora","sucursal"]'),
  ('reminder_24h', 'whatsapp', 'es', 'carwash',
   '¡{nombre}, mañana es la cita de tu vehículo a las {hora} en {sucursal}! 🚗',
   '["nombre","hora","sucursal"]'),
  ('cancellation', 'whatsapp', 'es', 'carwash',
   'Hola {nombre}, tu cita del {fecha} fue cancelada. ¡Agenda de nuevo cuando gustes!',
   '["nombre","fecha"]'),
  ('confirmation', 'whatsapp', 'en', 'carwash',
   'Got it {nombre}, your vehicle appointment is on {fecha} at {hora} at {sucursal}. 🚗',
   '["nombre","fecha","hora","sucursal"]'),
  ('reminder_24h', 'whatsapp', 'en', 'carwash',
   'Hey {nombre}, your vehicle appointment is tomorrow at {hora} at {sucursal}! 🚗',
   '["nombre","hora","sucursal"]'),
  ('cancellation', 'whatsapp', 'en', 'carwash',
   'Hi {nombre}, your appointment on {fecha} has been cancelled. Book again anytime!',
   '["nombre","fecha"]'),
  ('confirmation', 'email', 'es', 'carwash',
   'Hola {nombre},\n\nTu vehículo tiene cita en {negocio}.\n\nFecha: {fecha}\nHora: {hora}\nSucursal: {sucursal}\nServicio: {servicio}',
   '["nombre","negocio","fecha","hora","sucursal","servicio"]'),
  ('reminder_24h', 'email', 'es', 'carwash',
   'Hola {nombre},\n\nMañana es la cita de tu vehículo en {negocio}.\n\nFecha: {fecha}\nHora: {hora}',
   '["nombre","negocio","fecha","hora"]'),
  ('cancellation', 'email', 'es', 'carwash',
   'Hola {nombre},\n\nTu cita del {fecha} en {negocio} fue cancelada. Agenda de nuevo en: {link}',
   '["nombre","fecha","negocio","link"]'),
  ('confirmation', 'email', 'en', 'carwash',
   'Hi {nombre},\n\nYour vehicle appointment at {negocio} is confirmed.\n\nDate: {fecha}\nTime: {hora}\nLocation: {sucursal}\nService: {servicio}',
   '["nombre","negocio","fecha","hora","sucursal","servicio"]'),
  ('reminder_24h', 'email', 'en', 'carwash',
   'Hi {nombre},\n\nYour vehicle appointment at {negocio} is tomorrow.\n\nDate: {fecha}\nTime: {hora}',
   '["nombre","negocio","fecha","hora"]'),
  ('cancellation', 'email', 'en', 'carwash',
   'Hi {nombre},\n\nYour appointment on {fecha} at {negocio} has been cancelled. Book again at: {link}',
   '["nombre","fecha","negocio","link"]');

-- ─────────────────────────────────────────────────────────────────────────────
elsif v_vertical = 'petgrooming' then

  insert into message_templates (type, channel, language, vertical, content, variables) values
  ('confirmation', 'whatsapp', 'es', 'petgrooming',
   '¡Hola {nombre}! La cita de {mascota} está confirmada para {fecha} a las {hora}. 🐾',
   '["nombre","mascota","fecha","hora"]'),
  ('reminder_24h', 'whatsapp', 'es', 'petgrooming',
   '¡{nombre}, mañana es el turno de {mascota} a las {hora}! 🐾',
   '["nombre","mascota","hora"]'),
  ('cancellation', 'whatsapp', 'es', 'petgrooming',
   'Hola {nombre}, la cita de {mascota} del {fecha} fue cancelada. ¡Agenda de nuevo!',
   '["nombre","mascota","fecha"]'),
  ('confirmation', 'whatsapp', 'en', 'petgrooming',
   'Hi {nombre}! {mascota}''s appointment is confirmed for {fecha} at {hora}. 🐾',
   '["nombre","mascota","fecha","hora"]'),
  ('reminder_24h', 'whatsapp', 'en', 'petgrooming',
   'Hey {nombre}, {mascota}''s appointment is tomorrow at {hora}! 🐾',
   '["nombre","mascota","hora"]'),
  ('cancellation', 'whatsapp', 'en', 'petgrooming',
   'Hi {nombre}, {mascota}''s appointment on {fecha} has been cancelled. Book again anytime!',
   '["nombre","mascota","fecha"]'),
  ('confirmation', 'email', 'es', 'petgrooming',
   'Hola {nombre},\n\nLa cita de {mascota} en {negocio} está confirmada.\n\nFecha: {fecha}\nHora: {hora}\nServicio: {servicio}',
   '["nombre","mascota","negocio","fecha","hora","servicio"]'),
  ('reminder_24h', 'email', 'es', 'petgrooming',
   'Hola {nombre},\n\nMañana es el turno de {mascota} en {negocio}.\n\nFecha: {fecha}\nHora: {hora}',
   '["nombre","mascota","negocio","fecha","hora"]'),
  ('cancellation', 'email', 'es', 'petgrooming',
   'Hola {nombre},\n\nLa cita de {mascota} del {fecha} en {negocio} fue cancelada. Agenda de nuevo en: {link}',
   '["nombre","mascota","fecha","negocio","link"]'),
  ('confirmation', 'email', 'en', 'petgrooming',
   'Hi {nombre},\n\n{mascota}''s appointment at {negocio} is confirmed.\n\nDate: {fecha}\nTime: {hora}\nService: {servicio}',
   '["nombre","mascota","negocio","fecha","hora","servicio"]'),
  ('reminder_24h', 'email', 'en', 'petgrooming',
   'Hi {nombre},\n\n{mascota}''s appointment at {negocio} is tomorrow.\n\nDate: {fecha}\nTime: {hora}',
   '["nombre","mascota","negocio","fecha","hora"]'),
  ('cancellation', 'email', 'en', 'petgrooming',
   'Hi {nombre},\n\n{mascota}''s appointment on {fecha} at {negocio} has been cancelled. Book again at: {link}',
   '["nombre","mascota","fecha","negocio","link"]');

end if;
end loop;
end $$;
