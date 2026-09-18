(()=>{
  const whatsappUrl='https://tintim.link/whatsapp/c8a5172c-b689-4ab3-9680-0cf2ee69d88f/e5b7caef-2eb5-4d67-a568-783649292031';
  const query=new URLSearchParams(location.search);
  const campaign={
    utm_source:query.get('utm_source')||'',
    utm_medium:query.get('utm_medium')||'',
    utm_campaign:query.get('utm_campaign')||'',
    utm_term:query.get('utm_term')||'',
    utm_content:query.get('utm_content')||'',
    gclid:query.get('gclid')||''
  };
  window.dataLayer=window.dataLayer||[];
  window.dataLayer.push({event:'landing_page_view',page_type:'google_ads_landing_page',...campaign});
  const labels={piso:'restaurar um piso antigo',deck:'restaurar um deck',escada:'restaurar uma escada de madeira',outros:'solicitar outro serviço em madeira'};
  const box=document.querySelector('.intent-box');
  const choices=box?.querySelector('.intent-options');
  choices?.addEventListener('click',e=>{const link=e.target.closest('[data-intent]');if(link)window.dataLayer.push({event:'lead_intent_selected',service_intent:link.dataset.intent,...campaign})});
  document.addEventListener('click',e=>{const link=e.target.closest('.track-wa');if(link){window.dataLayer.push({event:'whatsapp_click',link_text:link.textContent.trim(),link_url:link.href,...campaign})}});

  // Carrega o GTM depois da primeira interação para não bloquear a experiência inicial.
  let gtmLoaded=false;
  const loadGtm=()=>{
    if(gtmLoaded)return;
    gtmLoaded=true;
    window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
    const script=document.createElement('script');
    script.async=true;
    script.src='https://www.googletagmanager.com/gtm.js?id=GTM-TLMBNNM';
    document.head.appendChild(script);
  };
  ['pointerdown','keydown','touchstart','scroll'].forEach(type=>addEventListener(type,loadGtm,{once:true,passive:true}));
  setTimeout(loadGtm,30000);

  const context=document.modelContext;
  if(context?.registerTool){
    const lifecycle=new AbortController();
    const register=tool=>Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});

    register({
      name:'prepare_floor_assessment',
      title:'Preparar avaliação do piso',
      description:'Seleciona na página o tipo de serviço necessário e prepara o link do WhatsApp para solicitar uma avaliação de piso de madeira em São Paulo.',
      inputSchema:{type:'object',properties:{service:{type:'string',enum:Object.keys(labels)},neighborhood:{type:'string'},areaSquareMeters:{type:'number',minimum:1}},required:['service'],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute:async input=>{
        if(!input||!Object.hasOwn(labels,input.service))throw new Error('Serviço inválido.');
        const selected=choices.querySelector(`[data-intent="${input.service}"]`);
        if(!selected)throw new Error('Serviço inválido.');
        choices.querySelectorAll('[data-intent]').forEach(link=>link.classList.toggle('is-selected',link===selected));
        selected.href=whatsappUrl;
        selected.focus({preventScroll:true});
        box.scrollIntoView({behavior:'smooth',block:'center'});
        return {status:'ready',service:input.service,details:{neighborhood:input.neighborhood||'',areaSquareMeters:input.areaSquareMeters||null},whatsappUrl,nextStep:'Abrir o link rastreável da Tintim para continuar no WhatsApp.'};
      }
    });

    register({
      name:'navigate_landing_page',
      title:'Navegar pela página',
      description:'Leva o visitante à seção relevante da landing page da Millenium Assoalhos.',
      inputSchema:{type:'object',properties:{section:{type:'string',enum:['inicio','servicos','projetos','depoimentos','duvidas','avaliacao']}},required:['section'],additionalProperties:false},
      annotations:{readOnlyHint:true,untrustedContentHint:false},
      execute:async input=>{
        const target=input&&document.getElementById(input.section);
        if(!target)throw new Error('Seção inválida.');
        target.scrollIntoView({behavior:'smooth',block:'start'});
        history.replaceState(null,'',`#${input.section}`);
        return {status:'navigated',section:input.section};
      }
    });
  }
})();
