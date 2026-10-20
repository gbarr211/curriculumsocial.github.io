import {families, exampleEvents, eventView, applyEventAction} from './model.mjs';

export function bindEvents(d) {
  const el = id => d.getElementById(id);
  let state = exampleEvents(), actor = 'rivera', filter = 'all', pending, trigger;
  const node = (tag, text, cls) => {const n = d.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n;};
  const places=count=>count+' place'+(count===1?'':'s');
  const message = (text, error = false) => {el('event-status').textContent = text; el('event-status').classList.toggle('error', error);};
  function button(label, action, id, cls = '') {const b = node('button', label, cls); b.type = 'button'; b.dataset.eventAction = action; b.dataset.eventId = id; return b;}
  function render() {
    el('event-cards').replaceChildren();
    for (const b of d.querySelectorAll('[data-filter]')) b.setAttribute('aria-current', b.dataset.filter === filter ? 'page' : 'false');
    for (const item of state.events) {
      const event = eventView(state, actor, item.id);
      if (filter === 'mine' ? !event.mine : filter !== 'all' && event.category !== filter) continue;
      const card = node('article', '', 'event-card' + (event.status === 'cancelled' ? ' cancelled' : '')); card.dataset.event = event.id;
      const art = node('div', '', 'event-art ' + event.id); art.append(node('span', event.category === 'social' ? 'Time together' : 'Learning together', 'event-kind'));
      const copy = node('div', '', 'event-copy'); copy.append(node('h3', event.title), node('p', event.when, 'event-meta'), node('p', event.area, 'event-meta'), node('p', 'Organized by ' + event.hostName, 'event-meta'), node('p', event.description, 'description'), node('p', event.cost, 'event-meta'));
      copy.append(node('p', event.status === 'cancelled' ? 'Cancelled in this example' : event.remaining === 0 ? 'All places reserved' : places(event.remaining) + ' available · Adults included', 'places'));
      if (event.mine) copy.append(node('p', 'Your sample plan · ' + event.mine + (event.mine === 1 ? ' person' : ' people'), 'plan-state'));
      const actions = node('div', '', 'card-actions');
      if (event.status === 'open') {
        actions.append(button(event.mine ? 'Review your places' : 'View gathering', 'rsvp', event.id));
        if (event.mine) actions.append(button('Cancel my places', 'cancel-rsvp', event.id, 'text-button'));
        if (event.host === actor) actions.append(button('Cancel gathering', 'cancel-event', event.id, 'text-button'));
      }
      copy.append(actions); card.append(art, copy); el('event-cards').append(card);
    }
    if (!el('event-cards').childElementCount) el('event-cards').append(node('div', filter === 'mine' ? 'No plans yet. Find a gathering you would enjoy; pod membership is optional.' : 'No sample gatherings in this view.', 'empty'));
  }
  function openAction(action, id, source) {
    const event = eventView(state, actor, id); pending = {type: action, eventId: id, version: event.version}; trigger = source;
    el('event-dialog-error').textContent = ''; el('event-details').replaceChildren();
    el('event-dialog-title').textContent = action === 'cancel-rsvp' ? 'Change of plans?' : action === 'cancel-event' ? 'Cancel this gathering?' : event.title;
    el('event-dialog-description').textContent = action === 'cancel-rsvp' ? 'Release your household’s places so another family can join. No real booking is affected.' : action === 'cancel-event' ? 'This removes all sample reservations for this gathering. In a live service, confirmed cancellation notices would be essential; no real notices are sent here.' : event.description;
    const rsvp = action === 'rsvp'; el('rsvp-fields').hidden = !rsvp; el('caregiver-check').required = rsvp; el('party-size').required = rsvp; el('caregiver-check').checked = false;
    const available = event.remaining + event.mine;
    for (const option of el('party-size').options) option.disabled = +option.value > available;
    el('party-size').value = String(event.mine || Math.min(available, 3) || 1);
    el('confirm-event').textContent = action === 'cancel-rsvp' ? 'Release sample places' : action === 'cancel-event' ? 'Cancel sample gathering' : event.mine ? 'Update sample places' : 'Reserve sample places';
    el('confirm-event').disabled = rsvp && available === 0;
    if (rsvp) {
      for (const text of [event.when + ' · Samui time', event.area, event.cost, 'Organized by ' + event.hostName, 'Bring: ' + event.bring, event.note, available ? places(available) + ' available for your household, including any you already reserved.' : 'All sample places are reserved. Try another gathering or release places from another sample family.']) el('event-details').append(node('p', text));
    }
    el('event-dialog').showModal(); el('close-event').focus();
  }
  d.addEventListener('click', e => {const b = e.target.closest('[data-event-action]'); if (b) openAction(b.dataset.eventAction, b.dataset.eventId, b);});
  for (const b of d.querySelectorAll('[data-filter]')) b.addEventListener('click', () => {filter = b.dataset.filter; render();});
  el('event-family').addEventListener('change', () => {actor = el('event-family').value; filter = 'all'; render(); message('Viewing ' + families[actor] + '’s sample plans. No real invitation has been sent.');});
  el('reset-events').addEventListener('click', () => {state = exampleEvents(); actor = 'rivera'; filter = 'all'; el('event-family').value = actor; render(); message('Examples reset. All fictional gatherings and places have been restored.');});
  el('close-event').addEventListener('click', () => el('event-dialog').close());
  el('event-dialog').addEventListener('close', () => {pending = null; if (trigger?.isConnected) trigger.focus(); else el('gatherings').focus(); trigger = null;});
  el('event-form').addEventListener('submit', e => {
    e.preventDefault(); if (!pending || !el('event-form').reportValidity()) return;
    try {
      const type = pending.type;
      state = applyEventAction(state, actor, {...pending, people: +el('party-size').value, caregiverAcknowledged: el('caregiver-check').checked});
      el('event-dialog').close(); render(); el('gatherings').focus();
      message(type === 'rsvp' ? 'Your sample places are reserved. No real booking or pod membership was created.' : type === 'cancel-rsvp' ? 'Your sample places were released.' : 'Sample gathering cancelled. Its sample places have been cleared; no real notices were sent.');
    } catch (error) {el('event-dialog-error').textContent = error.message;}
  });
  render();
}
if (typeof document !== 'undefined' && document.getElementById('gatherings')) bindEvents(document);
