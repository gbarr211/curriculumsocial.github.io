import { iconSvg } from './community-icons.js';
// Shared navigation adds no data collection and preserves legacy event targets.
export function communityHeader(active = '', prefix = '', preview = false, demoGrid = false) {
  const routes = [['dashboard','My community','dashboard.html'],['matching','Find families','matching.html'],['activities','Events','activities.html'],['pods','Pods','pods.html'],['curriculum','Learning votes','curriculum.html'],['apply','Contribute','apply.html'],['student','Student space','student.html']];
  const navIcons = ['home','people','sun','circle','compass','heart','book'];
  const current = key => active === key ? ' aria-current="page"' : '';
  return `<a class="cs-skip" href="#cs-main">Skip to content</a><header class="cs-header${demoGrid ? ' cs-demo-header' : ''}"><div class="cs-header-row"><a class="cs-brand" href="${prefix}index.html"><img src="${prefix}brand-mark.svg" alt="" width="34" height="34">curriculum social</a><nav class="cs-toplinks cs-account-actions" aria-label="Account navigation"><a href="${prefix}account/login.html" data-session="signed-out">Sign in <svg class="cs-icon cs-entry-cue" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path data-door-frame d="M5 21V3h14v18H5"/><path data-door-leaf d="M5 3l8 4v10l-8 4Z"/><path d="M10.5 12h.5"/></svg></a><a class="nav-primary" href="${prefix}account/signup.html" data-session="signed-out">Create account <svg class="cs-icon cs-entry-cue" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path data-door-frame d="M5 21V3h14v18H5"/><path data-door-leaf d="M5 3l8 4v10l-8 4Z"/><path d="M10.5 12h.5"/></svg></a><a class="nav-primary" href="${prefix}account/profile.html" data-session="signed-in" hidden>Your account <svg class="cs-icon cs-entry-cue" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path data-door-frame d="M5 21V3h14v18H5"/><path data-door-leaf d="M5 3l8 4v10l-8 4Z"/><path d="M10.5 12h.5"/></svg></a></nav></div>${demoGrid ? '<p class="cs-demo-heading">Explore community</p>' : `<button class="community-menu" type="button" aria-expanded="false" aria-controls="community-navigation">Explore community <span aria-hidden="true">⌄</span></button>`}<nav id="community-navigation" class="cs-appnav" aria-label="Community navigation">${routes.map(([key,label,url],index)=>`<a href="${prefix}${url}"${current(key)}${preview?' data-app-route="'+key+'"':''}>${demoGrid ? `<span class="cs-nav-icon" aria-hidden="true">${iconSvg(navIcons[index])}</span><span class="cs-nav-label">${label}</span>` : label}</a>`).join('')}</nav></header>`;
}
if (typeof document !== 'undefined' && !document.body?.hasAttribute('data-community-app')) {
  const ready = () => {
    const path = location.pathname.split('/').filter(Boolean).pop() || 'index.html';
    const active = path.replace(/\.html$/,'');
    const account = location.pathname.includes('/account/');
    document.body.classList.add('cs-legacy');
    if (['signup','login'].includes(active)) document.body.classList.add('cs-account');
    if (active === 'student') document.body.classList.add('cs-student');
    const template = document.createElement('template');
    const prefix = account ? '../' : '';
    template.innerHTML = communityHeader(active,prefix,account);
    // Production account links use the existing root routes.
    if (!account) template.content.querySelectorAll('a[href*="account/"]').forEach(a=>{a.href=a.getAttribute('href').replace('account/','');});
    document.body.prepend(template.content);
    const main = document.querySelector('main') || document.querySelector('section') || document.querySelector('.container');
    if (main) main.id = main.id || 'cs-main';
    const skip = document.querySelector('.cs-skip');
    if (main) skip.href = '#'+main.id; else skip.hidden = true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',ready,{once:true}); else ready();
}
