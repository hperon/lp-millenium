(()=>{
  const phone='5511967008068';
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
  const labels={restaurar:'restaurar um piso antigo',raspar:'raspar tacos',calafetar:'corrigir frestas no piso', 'nao-sei':'entender qual tratamento meu piso precisa'};
  const box=document.querySelector('.intent-box');
  const choices=box?.querySelector('.intent-options');
  const next=box?.querySelector('.intent-next');
  const cta=document.querySelector('#smart-cta');

  function choose(intent){
    const label=labels[intent]||labels['nao-sei'];
    const message=`Olá, vim pelo Google e quero ${label}. Vou enviar fotos, metragem aproximada e meu bairro.`;
    cta.href=`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    choices.hidden=true; next.hidden=false;
    box.querySelector('.step').textContent='2 de 2';
    next.querySelector('a').focus({preventScroll:true});
    window.dataLayer.push({event:'lead_intent_selected',service_intent:intent,...campaign});
  }

  choices?.addEventListener('click',e=>{const button=e.target.closest('[data-intent]');if(button)choose(button.dataset.intent)});
  box?.querySelector('.reset-intent')?.addEventListener('click',()=>{next.hidden=true;choices.hidden=false;box.querySelector('.step').textContent='1 de 2';choices.querySelector('button').focus()});
  document.addEventListener('click',e=>{const link=e.target.closest('.track-wa');if(link){window.dataLayer.push({event:'whatsapp_click',link_text:link.textContent.trim(),link_url:link.href,...campaign})}});

  if('modelContext' in navigator && navigator.modelContext?.registerTool){
    navigator.modelContext.registerTool({
      name:'iniciar_avaliacao_piso',
      description:'Prepara o contato da Millenium Assoalhos para avaliar um piso de madeira em São Paulo.',
      inputSchema:{type:'object',properties:{necessidade:{type:'string',enum:Object.keys(labels)},bairro:{type:'string'},metragem:{type:'number'}},required:['necessidade']},
      execute:async({necessidade,bairro,metragem})=>{
        const extras=[bairro&&`bairro ${bairro}`,metragem&&`${metragem} m²`].filter(Boolean).join(' e ');
        const message=`Olá, vim pelo Google e quero ${labels[necessidade]||labels['nao-sei']}.${extras?` O imóvel fica no ${extras}.`:''} Vou enviar fotos do piso.`;
        return {whatsappUrl:`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,proximoPasso:'Abrir o WhatsApp e anexar fotos ou vídeo do piso.'};
      }
    });
  }
})();
