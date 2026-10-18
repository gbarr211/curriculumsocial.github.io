// Synthetic interaction model, deliberately separate from real bookings.
export const families = {rivera: 'Rivera Family', chen: 'Chen Family', taylor: 'Taylor Family'};
export function exampleEvents() {
  return {events: [
    {id: 'beach', title: 'A slow morning by the sea', category: 'social', when: 'Sample Saturday · 09:00–10:30', area: 'North Samui · Public beach', host: 'taylor', capacity: 12, cost: 'Free gathering · Bring your own snacks', description: 'Sand, a little shade and time to get to know one another. Come for the conversation, stay for a shared beach game.', bring: 'Water, sun protection and something to sit on.', note: 'Meet on the sand. This sample gathering does not include swimming supervision.', status: 'open', version: 1},
    {id: 'lunch', title: 'Pull up a chair', category: 'social', when: 'Sample Sunday · 12:00–13:30', area: 'East Samui · Shared lunch space', host: 'rivera', capacity: 8, cost: 'Bring a lunch · No platform charge', description: 'A relaxed lunch for families who would like to meet again. No lesson plan, pod membership or teaching commitment needed.', bring: 'Your own food and water. Check any food arrangements directly with the host.', note: 'Adults remain with and responsible for their own household.', status: 'open', version: 1},
    {id: 'play', title: 'Little makers, shared discoveries', category: 'learning', when: 'Sample Wednesday · 10:00–11:30', area: 'South Samui · Play room', host: 'chen', capacity: 10, cost: 'Sample activity · Any venue entry is separate', description: 'Build, draw and try a small practical project together. Families share ideas; there is no assessment or learner record to set up.', bring: 'Comfortable clothes and a curious idea.', note: 'The host helps organize. Each household provides its own attending caregiver.', status: 'open', version: 1}
  ], rsvps: [{eventId: 'beach', family: 'taylor', people: 3}, {eventId: 'beach', family: 'chen', people: 4}, {eventId: 'lunch', family: 'chen', people: 3}, {eventId: 'lunch', family: 'taylor', people: 3}, {eventId: 'play', family: 'chen', people: 5}, {eventId: 'play', family: 'taylor', people: 5}]};
}
const fail = message => { throw Error(message); };
export function eventView(state, actor, id) {
  if (!Object.hasOwn(families, actor)) fail('Choose a sample family.');
  const event = state.events.find(item => item.id === id);
  if (!event) fail('This gathering is unavailable.');
  const attending = state.rsvps.filter(r => r.eventId === id), mine = attending.find(r => r.family === actor);
  return {...event, hostName: families[event.host], mine: mine?.people || 0, remaining: event.capacity - attending.reduce((sum, r) => sum + r.people, 0), households: attending.length};
}
export function applyEventAction(original, actor, action) {
  const state = structuredClone(original), event = eventView(state, actor, action.eventId);
  if (event.status !== 'open') fail('This gathering has been cancelled.');
  if (action.version !== event.version) fail('This gathering changed. Review the available places and try again.');
  switch (action.type) {
    case 'rsvp':
      if (!Number.isInteger(action.people) || action.people < 1 || action.people > 8) fail('Choose 1 to 8 people, including the attending adult.');
      if (action.caregiverAcknowledged !== true) fail('Confirm that your household will have an attending caregiver.');
      if (action.people > event.remaining + event.mine) fail('There are not enough places for your household.');
      state.rsvps = state.rsvps.filter(r => !(r.eventId === event.id && r.family === actor));
      state.rsvps.push({eventId: event.id, family: actor, people: action.people});
      break;
    case 'cancel-rsvp':
      if (!event.mine) fail('Your household does not have a place reserved.');
      state.rsvps = state.rsvps.filter(r => !(r.eventId === event.id && r.family === actor));
      break;
    case 'cancel-event':
      if (event.host !== actor) fail('Only the organizing family can cancel this gathering.');
      state.events.find(item => item.id === event.id).status = 'cancelled';
      state.rsvps = state.rsvps.filter(r => r.eventId !== event.id);
      break;
    default: fail('This action is unavailable.');
  }
  state.events.find(item => item.id === event.id).version++;
  return state;
}
