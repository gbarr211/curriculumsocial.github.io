// Shared navigation adds no data collection and preserves legacy event targets.
export function communityHeader(active = '', prefix = '', preview = false) {
  const routes = [['dashboard','My community','dashboard.html'],['matching','Find families','matching.html'],['activities','Events','activities.html'],['pods','Pods','pods.html'],['curriculum','Learning votes','curriculum.html'],['apply','Contribute','apply.html'],['student','Student space','student.html']];
  const current = key => active === key ? ' aria-current="page"' : '';
  return `<a class="cs-skip" href="#cs-main">Skip to content</a><header class="cs-header"><div class="cs-header-row"><a class="cs-brand" href="${prefix}index.html">curriculum social<i>.</i></a><nav class="cs-toplinks" aria-label="Account navigation"><a href="${prefix}account/profile.html">My profile</a><a class="cs-button outline small" href="${prefix}account/signup.html">${preview ? 'Try an account' : 'Join the community'} <svg class="cs-icon cs-icon-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></nav></div><nav class="cs-appnav" aria-label="Community navigation">${routes.map(([key,label,url])=>`<a href="${prefix}${url}"${current(key)}${preview?' data-app-route="'+key+'"':''}>${label}</a>`).join('')}</nav></header>`;
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
