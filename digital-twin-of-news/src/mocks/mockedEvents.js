import React from 'react';
import moment from 'moment';

import { EVENT_TYPE } from '../const';

const BURNED_AREA_DESCRIPTION = (date) => (
  <>
    Burned area was estimated using the{' '}
    <a
      className="url"
      href="https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel-2/burned_area_ms/"
      rel="noreferrer noopener"
      target="_blank"
    >
      Burned Area Script
    </a>{' '}
    on {date}.
  </>
);

export const MOCKED_EVENTS = [
  {
    id: 'eng-6393615',
    type: EVENT_TYPE.WILDFIRE,
    date: moment.utc('2020-12-13'),
    sensingDates: {
      beforeEvent: moment.utc('2020-12-04'),
      onEvent: moment.utc('2020-12-14'),
    },
    title: 'Sanderson Fire: Evacuation warning lifted as 1,933-acre blaze burns near Beaumont',
    lat: 33.89151,
    lng: -117.06207,
    zoom: 13,
    exactLocationName: 'Area of Santiago Canyon and Silverado Canyon roads',
    locationName: 'California, USA',
    description:
      "BEAUMONT, Calif. (KABC) -- A brush fire that erupted early Sunday morning near Beaumont spread to 1,933 acres before firefighters were able to stop its forward spread.\n\nThe Sanderson Fire was reported about 1 a.m. near La Borde Canyon Road and Jack Rabbit Trail, according to the Riverside County Fire Department.\n\nNo injuries or structural damage were reported.\n\nWorld's largest firefighting helitanker trains in Malibu for upcoming fires\n\nShortly before 9 a.m., an evacuation warning was issued for ",
    articles: [
      {
        url: 'https://myvalleynews.com/fast-moving-brush-fire-south-of-beaumont-prompts-evacuation-warning/',
        title: 'Fast-moving brush fire south of Beaumont prompts evacuation warning',
        image: 'https://myvalleynews.com/wp-content/uploads/2020/07/Fire-fighter.jpg',
      },
      {
        url:
          'https://www.nbclosangeles.com/news/local/fast-moving-brush-fire-south-of-beaumont-prompts-evacuation-warning/2484112/',
        title: 'Fast-Moving Brush Fire South of Beaumont Prompts Evacuation Warning',
        image: 'https://media.nbclosangeles.com/2020/09/GettyImages-1228394970.jpg?resize=1024%2C675',
      },
      {
        url: 'https://nbcpalmsprings.com/2020/12/14/brush-fire-breaks-out-near-beaumont/',
        title: 'Firefighters Make Headway on Sanderson Fire Near Beaumont',
        image: 'https://nbcpalmsprings.com/wp-content/uploads/sites/8/2020/12/Sanderson-Fire.jpeg?w=640',
      },
      {
        url:
          'https://mynewsla.com/crime/2020/12/13/firefighters-making-headway-on-sanderson-fire-evacuation-warning-lifted/',
        title: 'Firefighters Making Headway On Sanderson Fire, Evacuation Warning Lifted - MyNewsLA.com',
        image: 'https://mynewsla.com/wp-content/uploads/2016/04/MyNewsLA-AMP-Logo.png',
      },
      {
        url: 'https://nbcpalmsprings.com/2020/12/13/brush-fire-breaks-out-near-beaumont/',
        title: 'Brush Fire Breaks Out Near Beaumont',
        image: 'https://nbcpalmsprings.com/wp-content/uploads/sites/8/2020/12/Sanderson-Fire.jpeg?w=640',
      },
      {
        url: 'https://losangeles.cbslocal.com/2020/12/13/sanderson-fire-evacuations-riverside-county/',
        title: 'Evacuation Warning Issued As Fire In Riverside Co. Grows To 800 Acres; No Containment',
        image:
          'https://losangeles.cbslocal.com/wp-content/uploads/sites/14984641/2019/04/breaking-news-2.png?w=954',
      },
      {
        url: 'https://myvalleynews.com/sanderson-fire-now-100-contained-south-of-beaumont/',
        title: 'Sanderson Fire now 100% contained south of Beaumont',
        image: 'https://myvalleynews.com/wp-content/uploads/2020/07/CalFire.jpg',
      },
      {
        url:
          'https://mynewsla.com/uncategorized/2020/12/16/sanderson-fire-now-100-contained-south-of-beaumont/',
        title: 'Sanderson Fire Now 100% Contained South of Beaumont - MyNewsLA.com',
        image: 'https://mynewsla.com/wp-content/uploads/2016/04/MyNewsLA-AMP-Logo.png',
      },
      {
        url:
          'https://mynewsla.com/uncategorized/2020/12/14/crews-work-toward-full-containment-of-blaze-in-badlands/',
        title: 'Crews Work Toward Full Containment of Blaze in Badlands - MyNewsLA.com',
        image: 'https://mynewsla.com/wp-content/uploads/2016/04/MyNewsLA-AMP-Logo.png',
      },
      {
        url:
          'https://1010wcsi.com/fox-news/california-wildfire-explodes-to-nearly-2000-acres-as-firefighters-work-to-gain-upper-hand/',
        title:
          'California wildfire explodes to nearly 2,000 acres as firefighters work to gain upper hand - 1010 WCSI',
        image: null,
      },
      {
        url:
          'https://eu.desertsun.com/story/news/environment/wildfires/2020/12/13/wildfire-burning-east-moreno-valley-shuts-down-gilman-springs-road/6530167002/',
        title: 'Wildfire burning east of Moreno Valley shuts down Gilman Springs Road',
        image:
          'https://www.gannett-cdn.com/presto/2019/10/11/PPAS/4bf441b0-8354-428f-be8a-110dcb91280e-whitewater_030.JPG?auto=webp&crop=4415,2484,x0,y408&format=pjpg&width=1200',
      },
      {
        url:
          'https://dailycaller.com/2020/12/14/california-wildfire-sanderson-beaumont-contained-cal-fire-twitter/',
        title: 'California Wildfire Now Burning Roughly 2,000 Acres, Now 45% Contained',
        image: 'https://cdn01.dailycaller.com/wp-content/uploads/2020/12/Sanderson_Fire-e1607966317628.jpg',
      },
      {
        url: 'https://www.pe.com/2020/12/13/wildfire-explodes-to-300-acres-south-of-beaumont',
        title: 'Wildfire explodes to 800 acres south of Beaumont',
        image: 'https://www.ocregister.com/wp-content/uploads/2020/12/generic-fire-firetruck-16-3.jpg?w=640',
      },
      {
        url: 'https://abc7.com/8744140/',
        title: 'Sanderson Fire: Evacuation warning lifted as 1,933-acre blaze burns near Beaumont',
        image: 'https://cdn.abcotvs.com/dip/images/8668807_2018-Live-Video-1280x720.jpg?w=1600',
      },
      {
        url: 'https://www.pe.com/2020/12/14/crews-work-toward-full-containment-of-sanderson-fire-in-badlands',
        title: 'Crews work toward full containment of Sanderson fire in Badlands',
        image:
          'https://www.dailybulletin.com/wp-content/uploads/2020/12/RPE-L-BEAU-FIRE-FOLO-1215-03-WL-1.jpg?w=640',
      },
      {
        url:
          'http://dennismichaellynch.com/california-wildfire-explodes-to-nearly-2000-acres-as-firefighters-work-to-gain-upper-hand/',
        title: 'California wildfire explodes to nearly 2,000 acres as firefighters work to gain upper hand',
        image:
          'http://dennismichaellynch.com/wp-content/uploads/2020/12/ftimg_california-wildfire-explodes-to-nearly-2000-acres-as-firefighters-work-to-gain-upper-hand_2020-12-14T0128290000.jpg',
      },
    ],
  },

  {
    id: 'eng-6374823',
    type: EVENT_TYPE.WILDFIRE,
    date: moment.utc('2020-12-07'),
    sensingDates: {
      beforeEvent: moment.utc('2020-12-04'),
      onEvent: moment.utc('2020-12-09'),
    },
    title: '2 separate wind-driven brush fires erupt near Ventura ',
    lat: 34.33288,
    lng: -119.0745,
    zoom: 15,
    locationName: 'Santa Paula, California',
    description:
      'VENTURA, Calif. (KABC) -- Two separate wind-driven brush fires erupted off the 101 Freeway near Ventura Tuesday evening.\n\nThe larger of the fires, a 50-acre blaze dubbed the Perkin Fire, was burning in heavy brush at the bottom of a dry riverbed close to the 101 Freeway and Auto Center Drive between the cities of Ventura and Oxnard.\n\nVentura County Fire said at about 6:15 p.m. forward progress was slowing, and crews were working on containing flare-ups. They initially said the fire was at 20 acre',
    articles: [
      {
        url:
          'https://eu.vcstar.com/story/news/2020/12/07/firefighters-cornell-fire-santa-paula-river-bottom-santa-ana-winds/6479734002/',
        title: 'Firefighters respond to brushfire in river bottom in Santa Paula',
        image:
          'https://www.gannett-cdn.com/presto/2020/12/07/PVCS/1eebc459-0cbf-44b9-812f-b7a703a19b04-Cornell_fire_1.jpg?auto=webp&crop=943,531,x0,y0&format=pjpg&width=1200',
      },
      {
        url:
          'https://www.latimes.com/california/story/2020-12-07/cornell-fire-grows-in-ventura-county-evacuation-warnings-issued',
        title: 'Brush fire ignites amid high winds in Ventura County, spurring evacuation warnings',
        image:
          'https://ca-times.brightspotcdn.com/dims4/default/fa74e2b/2147483647/strip/true/crop/1856x1044+6+0/resize/1200x675!/quality/90/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F5d%2Fd8%2F57688dfd42ff8f825603b6f7285d%2Fla-me-cornell-fire.jpg',
      },
      {
        url: 'https://losangeles.cbslocal.com/2020/12/07/cornell-fire-santa-paula-evacuation-warnings/',
        title: 'Cornell Fire Burning In Santa Paula Prompts Evacuation Warnings',
        image:
          'https://losangeles.cbslocal.com/wp-content/uploads/sites/14984641/2020/12/Screen-Shot-2020-12-07-at-2.03.30-PM.png?w=1500',
      },
      {
        url:
          'https://www.news.com.au/national/evacuation-warnings-lifted-as-containment-of-fire-in-santa-paula-california-increases/video/8dfe7890e7045532ee869302bf1a1843',
        title: 'Evacuation Warnings Lifted as Containment of Fire in Santa Paula, California, Increases',
        image: null,
      },
      {
        url: 'https://abc7.com/8586851/',
        title: 'Santa Paula fire: 174-acre blaze started by tree falling on power line',
        image: 'https://cdn.abcotvs.com/dip/images/4506100_kabc-breaking-news-live-event-img.jpg?w=1600',
      },
      {
        url:
          'https://www.news.com.au/national/fastgrowing-brush-fire-in-california-prompts-evacuation-warning/video/3f7910bdc889764879d7a34a199b4f06',
        title: 'Fast-Growing Brush Fire in California Prompts Evacuation Warning',
        image: null,
      },
      {
        url: 'https://keyt.com/news/fire/2020/12/07/heavy-winds-pushing-brush-fire-near-santa-paul/',
        title:
          'Heavy winds pushing brush fire near Santa Paula, evacuation warnings issued | NewsChannel 3-12',
        image: 'https://keyt.b-cdn.net/2020/12/santa-paula-fire-from-senerey-twitter-860x415.jpg',
      },
      {
        url:
          'https://www.mercurynews.com/2020/12/08/map-wildfire-closes-california-freeway-during-red-flag-alert',
        title: 'Map: Wildfire closes California freeway during red flag alert',
        image: 'https://www.mercurynews.com/wp-content/uploads/2020/12/126.jpg?w=640',
      },
      {
        url:
          'https://keyt.com/news/ventura-county/2020/12/09/cornell-fire-that-sparked-near-santa-paula-now-100-contained/',
        title: 'Cornell Fire that sparked near Santa Paula now 100% contained | NewsChannel 3-12',
        image: 'https://keyt.b-cdn.net/2020/12/cornell-fire-1-860x645.jpg',
      },
      {
        url:
          'https://www.dailyrepublic.com/all-dr-news/wires/southern-california-is-in-for-a-reprieve-from-dangerous-fire-weather-los-angeles-times/',
        title: 'Southern California is in for a reprieve from dangerous fire weather [Los Angeles Times]',
        image: null,
      },
      {
        url:
          'https://eu.vcstar.com/story/news/2020/12/08/ventura-county-residents-without-power-fire-danger-southern-california-edison/6492128002/',
        title: 'More than 28,000 Ventura County residents out of power due to fire danger',
        image:
          'https://www.gannett-cdn.com/presto/2020/12/03/PVCS/cd1855b7-02d9-4edd-bd31-26c0c1b4db39-Wind_Art_Thursday_3.JPG?auto=webp&crop=4725,2658,x0,y237&format=pjpg&width=1200',
      },
      {
        url:
          'https://www.news.com.au/national/highway-reopens-as-brush-fire-continues-to-rage-in-california/video/d1beb31786fab7e9806123c309f46df3',
        title: 'Highway Re-opens as Brush Fire Continues to Rage in California',
        image: null,
      },
      {
        url:
          'https://www.latimes.com/california/story/2020-12-09/southern-california-is-in-for-a-reprieve-from-dangerous-fire-weather',
        title: 'Southern California is in for a reprieve from dangerous fire weather ',
        image:
          'https://ca-times.brightspotcdn.com/dims4/default/0dc627b/2147483647/strip/true/crop/5472x3078+0+285/resize/1200x675!/quality/90/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fd2%2Fe3%2Fc775cada4e74a606395c35912568%2Fla-photos-1staff-667194-brush-fire-affecting-a-homeless-camp-at-whittier-narrows-5-ajs.jpg',
      },
      {
        url: 'https://abc7.com/8621732/',
        title: '2 separate wind-driven brush fires erupt near Ventura ',
        image: 'https://cdn.abcotvs.com/dip/images/8621654_120820-kabc-6pm-brush-fires-vid.jpg?w=1600',
      },
    ],
  },

  {
    links: [
      'https://firms2.modaps.eosdis.nasa.gov/map/#t:adv;d:2020-11-27..2020-12-07;@145,-20,11z',
      'https://apps.sentinel-hub.com/eo-browser/?zoom=11&lat=-20&lng=145&themeId=DEFAULT-THEME&datasetId=S2L2A&fromTime=2020-11-07T00%3A00%3A00.000Z&toTime=2020-12-07T23%3A59%3A59.999Z&layerId=1_TRUE_COLOR',
      'https://apps.sentinel-hub.com/eo-browser/?zoom=11&lat=-20&lng=145&themeId=9b854d70-7c5f-4575-a3d7-8d3d929b4dde&datasetId=S2L2A&fromTime=2020-11-07T00%3A00%3A00.000Z&toTime=2020-12-07T23%3A59%3A59.999Z&layerId=BURNED-AREAS-DETECTION',
    ],
    id: 'por-575881',
    date: moment.utc('2020-12-07'),
    type: 'wildfire',
    sensingDates: {
      beforeEvent: moment.utc('2020-11-22'),
      onEvent: moment.utc('2020-12-07'),
    },
    title: 'Austr\u00e1lia evacua maior ilha de areia do mundo ',
    lat: -19.94624,
    lng: 144.69818,
    zoom: 10,
    exactLocationName: null,
    locationName: 'Queensland',
    description:
      'As autoridades australianas instaram os residentes de Happy Valley, em Fraser, a maior ilha de areia do mundo, a abandonar imediatamente o local, alertando que o inc\u00eandio que assola a regi\u00e3o se tornou "demasiado perigoso" e "amea\u00e7a vidas".\n\nOs Servi\u00e7os de Inc\u00eandios e Emerg\u00eancia de Queensland, no nordeste da Austr\u00e1lia, informaram, esta segunda-feira, em comunicado, que pouco antes do meio-dia (duas horas da manh\u00e3 em Portugal continental), as chamas se dirigiam para Happy Valley, uma das du',
    articles: [
      {
        url:
          'https://expresso.pt/internacional/2020-12-07-Australia-evacua-maior-ilha-de-areia-do-mundo-devido-a-incendio',
        title: 'Austr\u00e1lia evacua maior ilha de areia do mundo devido a inc\u00eandio',
        image: 'http://images.impresa.pt/expresso/2020-12-07-Fraser-Australia/fb/wm',
      },
      {
        url:
          'https://www.jn.pt/mundo/australia-evacua-maior-ilha-de-areia-do-mundo--13113717.html?utm_source=feedburner&utm_medium=feed&utm_campaign=feed%3a+jn-ultimas+%28jn+-+ultimas%29',
        title: 'Austr\u00e1lia evacua maior ilha de areia do mundo ',
        image:
          'https://static.globalnoticias.pt/jn/image.aspx?brand=JN&type=generate&guid=6d747bc5-7c94-42c2-ad65-f02779f90fa2&w=800&h=420&watermark=true&t=20201207083700',
      },
      {
        url:
          'https://observador.pt/2020/12/07/australia-evacua-maior-ilha-de-areia-do-mundo-devido-a-incendio/',
        title: 'Austr\u00e1lia evacua maior ilha de areia do mundo devido a inc\u00eandio',
        image:
          'https://wm.observador.pt/wm/obs/l/https%3A%2F%2Fbordalo.observador.pt%2F770x403%2Cq86%2Ccx0%2Ccw2016%2Ccy62%2Cch1133%2Fhttps%3A%2F%2Fs3.observador.pt%2Fwp-content%2Fuploads%2F2020%2F12%2F07082355%2FGettyImages-1288920154.jpg',
      },
      {
        url:
          'https://tvi24.iol.pt/internacional/ilha-fraser/australia-evacua-maior-ilha-de-areia-do-mundo-devido-a-incendio-que-se-tornou-demasiado-perigoso',
        title:
          'Austr\u00e1lia evacua maior ilha de areia do mundo devido a inc\u00eandio que se tornou "demasiado perigoso" | TVI24',
        image: 'https://img.iol.pt/preset/5fcddab70cf203abc5b59cab/og/tvi24',
      },
      {
        url:
          'https://noticias.mmo.co.mz/2020/12/australia-evacua-maior-ilha-de-areia-do-mundo-devido-a-incendio.html',
        title: 'Austr\u00e1lia evacua maior ilha de areia do mundo devido a inc\u00eandio - MMO',
        image:
          'https://noticias.mmo.co.mz/wp-content/uploads/2020/12/Australia-evacua-maior-ilha-de-areia-do-mundo-devido-a-incendio.jpg',
      },
      {
        url:
          'https://www.noticiasaominuto.com/mundo/1641961/australia-evacua-maior-ilha-de-areia-do-mundo-devido-a-incendio',
        title: 'Austr\u00e1lia evacua maior ilha de areia do mundo devido a inc\u00eandio',
        image: 'https://media-manager.noticiasaominuto.com/1280/naom_5fcdcec3a6cf9.jpg',
      },
      {
        url: 'http://www.destak.pt/artigo/459988',
        title: 'Actualidade: Austr\u00e1lia evacua maior ilha de areia do mundo devido a inc\u00eandio',
        image: null,
      },
      {
        url:
          'http://www.jornalodiario.com.br/geral/internacional/australia-pede-saida-de-moradores-da-maior-ilha-de-areia-do-mundo/239195',
        title: 'Austr\u00e1lia pede sa\u00edda de moradores da maior ilha de areia do mundo | Clique F5',
        image:
          'https://www.jornalodiario.com.br/storage/webdisco/2020/12/07/560x420/1e1995bbc813ff3e39626480f441049e.jpg',
      },
      {
        url:
          'https://www.revistaplaneta.com.br/australia-pede-saida-de-moradores-de-ilha-que-e-patrimonio-da-humanidade/',
        title:
          'Austr\u00e1lia pede sa\u00edda de moradores de ilha que \u00e9 Patrim\u00f4nio da Humanidade - Planeta',
        image: 'https://www.revistaplaneta.com.br/wp-content/uploads/sites/3/2020/12/fraser.jpg',
      },
      {
        url:
          'https://agenciabrasil.ebc.com.br/internacional/noticia/2020-12/australia-pede-saida-de-moradores-da-maior-ilha-de-areia-do-mundo',
        title: 'Austr\u00e1lia pede sa\u00edda de moradores da maior ilha de areia do mundo',
        image:
          'https://agenciabrasil.ebc.com.br/sites/default/modules/custom/custom_tokens/imagem_twitter_padrao.png',
      },
      {
        url:
          'https://www.cmjornal.pt/mundo/detalhe/australia-evacua-maior-ilha-de-areia-do-mundo-devido-a-incendio',
        title: 'Austr\u00e1lia evacua maior ilha de areia do mundo devido a inc\u00eandio',
        image: 'https://cdn.cmjornal.pt/images/2020-12/img_1280x720$2020_12_07_07_31_48_996418.jpg',
      },
    ],
  },

  {
    id: 'eng-6370168',
    date: moment.utc('2020-12-06'),
    type: 'wildfire',
    sensingDates: {
      beforeEvent: moment.utc('2020-10-01'),
      onEvent: moment.utc('2020-12-05'),
    },
    title: "Happy Valley residents urged to 'leave immediately' as Fraser Island fire threatens township",
    lat: -25.094,
    lng: 153.21259,
    zoom: 10,
    exactLocationName: null,
    locationName: 'Fraser Island',
    description:
      'The bushfire which has blackened more than half of Fraser Island is quickly approaching the township of Happy Valley.\n\nResidents have been urged by the Queensland Fire and Emergency Service (QFES) to leave immediately.\n\nAn update at 10:45pm said the fire front was expected to reach the township at around midnight on Monday morning.\n\nPeople in and around Happy Valley township are being asked to leave the area and head to the Eastern Beach and head south to Eurong Resort.\n\n"Leaving immediately is t',
    articles: [
      {
        url:
          'https://www.couriermail.com.au/news/queensland/weather/leave-immediately-bushfire-closes-in-on-fraser-island-township/news-story/5a2fe918cac22e474e4dfcecf8c600cb',
        title: 'Emergency declared on Fraser Island as dozens flee',
        image: 'https://content.api.news/v3/images/bin/9c31d26f2d61a5c72e2eaeab69d282ce',
      },
      {
        url: 'https://todayheadline.co/town-evacuated-as-super-tankers-attack-fraser-island-fire/',
        title: 'Town evacuated as super tankers attack Fraser Island fire  --  TodayHeadline',
        image: 'https://media.apnarm.net.au/media/images/2020/12/07/rfs_plane-u1wk1sipdcac9g5fhv2_t1880.JPG',
      },
      {
        url:
          'https://www.news.com.au/national/queensland/leave-immediately-bushfire-closes-in-on-fraser-island-township/news-story/5a2fe918cac22e474e4dfcecf8c600cb',
        title: "'Leave immediately': Bushfire closes in on Fraser Island township",
        image: 'https://cdn.newsapi.com.au/image/v1/9c31d26f2d61a5c72e2eaeab69d282ce?width=1280',
      },
      {
        url:
          'https://www.goldcoastbulletin.com.au/news/queensland/leave-immediately-bushfire-closes-in-on-fraser-island-township/news-story/5a2fe918cac22e474e4dfcecf8c600cb',
        title: "'Leave immediately': Bushfire closes in on Fraser township",
        image: 'https://cdn.newsapi.com.au/image/v1/9c31d26f2d61a5c72e2eaeab69d282ce',
      },
      {
        url:
          'https://www.couriermail.com.au/travel/travel-updates/health-safety/happy-valley-prepare-to-leave-warning-issued-for-fraser-island-village-as-fire-advances/news-story/deef93effc1faec818e0ab0ccae65dff',
        title: "'Leave now': Warning as island blaze rages",
        image: 'https://content.api.news/v3/images/bin/5cea8a524e17c80cf98b3c8856d7a413',
      },
      {
        url:
          'https://www.nzherald.co.nz/world/emergency-bushfire-warning-issued-for-fraser-island-residents/CFRAQAJ52TK7YB3N2UTTVUGC5M/',
        title: 'Emergency bushfire warning issued for Fraser Island residents - NZ Herald',
        image:
          'https://www.nzherald.co.nz/resizer/MM2V8ZvO61qtDghaPdkxL-axAWc=/1200x675/filters:quality(70)/cloudfront-ap-southeast-2.images.arcpublishing.com/nzme/NVLZZIETIHVSC3QVYZ4APDDWKA.jpg',
      },
      {
        url: 'https://au.news.yahoo.com/fraser-island-town-danger-fire-nears-193241340--spt.html',
        title: 'Fraser Island town in danger as fire nears',
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
      },
      {
        url: 'https://www.newcastleherald.com.au/story/7043211/fraser-island-town-in-danger-as-fire-nears/',
        title: 'Fraser Island town in danger as fire nears',
        image:
          'https://www.newcastleherald.com.au/images/transform/v1/crop/frm/silverstone-feed-data/cc3bd3a6-8c1b-4842-b25c-803331e60235.jpg/r0_74_800_526_w1200_h678_fmax.jpg',
      },
      {
        url:
          'http://www.benallaensign.com.au/national/2020/12/06/2354995?slug=bushfire-threatens-fraser-island-township',
        title: 'Bushfire threatens Fraser Island township - Benalla Ensign',
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/wfh0msxfb3kj9z5lqgy0',
      },
      {
        url:
          'http://www.cobramcourier.com.au/national/2020/12/06/2354997?slug=bushfire-threatens-fraser-island-township',
        title: 'Bushfire threatens Fraser Island township - Cobram Courier',
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/pfgmdc6twywjbt0ixla2',
      },
      {
        url: 'https://www.newcastleherald.com.au/story/7042792/bushfire-threatens-fraser-island-township/',
        title: 'Bushfire threatens Fraser Island township',
        image:
          'https://www.newcastleherald.com.au/images/transform/v1/crop/frm/silverstone-feed-data/5fe519cc-8845-4435-8865-039f141d3283.jpg/r0_74_800_526_w1200_h678_fmax.jpg',
      },
      {
        url:
          'https://www.sbs.com.au/news/fraser-island-residents-told-to-evacuate-immediately-as-bushfire-warning-reaches-emergency-level',
        title:
          'Fraser Island residents told to evacuate immediately as bushfire warning reaches emergency level',
        image: 'https://sl.sbs.com.au/public/image/file/8c98ea21-b75a-46a6-b29f-254bdf637c7b/crop/16x9',
      },
      {
        url:
          'https://www.perthnow.com.au/news/happy-valley-prepare-to-leave-warning-issued-for-fraser-island-village-as-fire-advances-ng-deef93effc1faec818e0ab0ccae65dff',
        title: 'Fire warning for Fraser Island village',
        image: 'https://perthnow.com.au/static/fallback-images/perthnow-16x9.png?imwidth=1024',
      },
      {
        url:
          'https://www.geelongadvertiser.com.au/technology/environment/dozens-of-residents-evacuated-as-life-threatening-bushfire-approaches-major-township/news-story/0f611047092eed73a8a03c0f74e2187d',
        title: 'Desperation as megafire nears town',
        image: 'https://cdn.newsapi.com.au/image/v1/5a95ab0c05a9e78a920a87f2d9a52476',
      },
      {
        url:
          'https://www.themercury.com.au/news/queensland/leave-immediately-bushfire-closes-in-on-fraser-island-township/news-story/5a2fe918cac22e474e4dfcecf8c600cb',
        title: "'Get out now': Fraser Island fire to impact town within hours",
        image: 'https://cdn.newsapi.com.au/image/v1/34531f4ba3a8a49eb5103b58e3920c25',
      },
      {
        url:
          'https://www.dailytelegraph.com.au/news/queensland/weather/leave-immediately-bushfire-closes-in-on-fraser-island-township/news-story/5a2fe918cac22e474e4dfcecf8c600cb',
        title: "'Leave immediately': Emergency declared on Fraser Island",
        image: 'https://content.api.news/v3/images/bin/9c31d26f2d61a5c72e2eaeab69d282ce',
      },
      {
        url:
          'https://www.themercury.com.au/technology/environment/dozens-of-residents-evacuated-as-life-threatening-bushfire-approaches-major-township/news-story/0f611047092eed73a8a03c0f74e2187d',
        title: 'Megafire to hit town within hours',
        image: 'https://cdn.newsapi.com.au/image/v1/5a95ab0c05a9e78a920a87f2d9a52476',
      },
      {
        url: 'https://thenewdaily.com.au/news/2020/12/07/fraser-island-bushfire-emergency/',
        title: "Fraser Island residents urged to leave as fire comes 'with a vengeance'",
        image:
          'https://1v1d1e1lmiki1lgcvx32p49h8fe-wpengine.netdna-ssl.com/wp-content/uploads/2020/12/1607298495-happy-valley-960x600.jpg',
      },
      {
        url:
          'https://www.dailymail.co.uk/news/article-9024139/Fraser-Island-bushfire-Happy-Valley-residents-Queensland-told-evacuate-immediately.html',
        title: 'Residents evacuate as Fraser Island bushfire reaches Happy Valley',
        image: 'https://i.dailymail.co.uk/1s/2020/12/06/21/36520306-0-image-a-5_1607290532732.jpg',
      },
      {
        url:
          'https://www.couriermail.com.au/technology/environment/dozens-of-residents-evacuated-as-life-threatening-bushfire-approaches-major-township/news-story/0f611047092eed73a8a03c0f74e2187d',
        title: "'Life threatening': Fire approaches town",
        image: 'https://content.api.news/v3/images/bin/5a95ab0c05a9e78a920a87f2d9a52476',
      },
      {
        url: 'https://thenewdaily.com.au/news/2020/12/06/fraser-island-township-warning/',
        title: 'Conditions change again, hours after Fraser Island township given all clear',
        image:
          'https://1v1d1e1lmiki1lgcvx32p49h8fe-wpengine.netdna-ssl.com/wp-content/uploads/2020/12/1607257052-Fraser-Island-Dec4-960x600.jpg',
      },
      {
        url: 'https://thenewdaily.com.au/news/2020/12/07/fraser-island-fire-emergency-2/',
        title:
          "Fraser Island residents urged to leave immediately as dangerous fire comes 'with a vengeance' | The New Daily",
        image:
          'https://1v1d1e1lmiki1lgcvx32p49h8fe-wpengine.netdna-ssl.com/wp-content/uploads/2020/12/1607298495-happy-valley-960x600.jpg',
      },
      {
        url:
          'https://www.abc.net.au/news/2020-12-06/fire-fraser-island-kingfisher-bay-resort-prepare-to-leave/12955220',
        title: "Happy Valley residents urged to 'leave immediately' as Fraser Island fire threatens township",
        image: 'https://www.abc.net.au/cm/rimage/12938710-16x9-large.jpg?v=4',
      },
      {
        url: 'https://www.byronnews.com.au/news/emergency-declared-on-fraser-island-as-dozens-flee/4153129/',
        title: 'Emergency declared on Fraser Island as dozens flee',
        image:
          'https://media.apnarm.net.au/media/images/2020/12/06/v3imagesbin0803edd9fd8012cc3d5e07a1c1f33cb7-31omwaz73pilv50ahv2_ct300x300.jpg',
      },
      {
        url: 'https://thenewdaily.com.au/news/queensland/2020/12/07/happy-valley-bushfire-warning/',
        title: "Bushfire moments away from impacting Fraser Island's Happy Valley",
        image:
          'https://1v1d1e1lmiki1lgcvx32p49h8fe-wpengine.netdna-ssl.com/wp-content/uploads/2020/12/1607257052-Fraser-Island-Dec4-960x600.jpg',
      },
      {
        url:
          'https://www.abc.net.au/news/2020-12-07/qld-fraser-island-bushfire-evacuation-firefighting-effort/12955852',
        title:
          'Happy Valley residents advised to evacuate as interstate resources join firefighting effort on Fraser Island',
        image: 'https://www.abc.net.au/cm/rimage/12938710-16x9-large.jpg?v=4',
      },
      {
        url: 'https://www.gattonstar.com.au/news/leave-now-fire-expected-to-impact-happy-valley/4153123/',
        title: 'UPDATE: Fraser township survives night, but warning remains',
        image:
          'https://media.apnarm.net.au/media/images/2020/12/06/v3imagesbin4246553a6cb40c21e1f7d2be20d1d123-ykhqacvqeoeyr6x9hv2_ct300x300.jpg',
      },
      {
        url:
          'http://www.kyfreepress.com.au/national/2020/12/07/2356347?slug=fraser-island-town-in-danger-as-fire-nears',
        title: 'Fraser Island town in danger as fire nears - Kyabram Free Press',
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/ele3shyhb4faisvbuzkb',
      },
      {
        url:
          'https://www.perthnow.com.au/news/environment/dozens-of-residents-evacuated-as-life-threatening-bushfire-approaches-major-township-ng-0f611047092eed73a8a03c0f74e2187d',
        title: "'Life threatening': Fire approaches town",
        image:
          'https://images.perthnow.com.au/publication/0F611047092EED73A8A03C0F74E2187D/1607287473676_a7c2ccb3afe294c70a127117a7c8eb12.jpeg?imwidth=1024',
      },
      {
        url:
          'http://www.theguardian.com/australia-news/2020/dec/07/fraser-island-residents-warned-bushfire-poses-threat-to-all-lives-as-blaze-nears-town',
        title: "Fraser Island residents warned bushfire poses 'threat to all lives' as blaze nears town",
        image:
          'https://i.guim.co.uk/img/media/0ea8e895e222eb8e4e2f6b7482257ee738e68837/0_224_4072_2442/master/4072.jpg?width=1200&height=630&quality=85&auto=format&fit=crop&overlay-align=bottom%2Cleft&overlay-width=100p&overlay-base64=L2ltZy9zdGF0aWMvb3ZlcmxheXMvdGctZGVmYXVsdC5wbmc&s=a68bbf8884571135f4c4a9e4d9faf27d',
      },
      {
        url: 'https://thewest.com.au/news/bushfires/dangerous-fire-nears-fraser-island-homes-ng-s-2040990',
        title: 'Dangerous fire nears Fraser Island homes',
        image:
          'https://images.thewest.com.au/publication/S-2040990/1607307866223_Bushfire_Qld_16-9_20006001_2040990_202012061812201964e60f-d1d4-4a11-b493-4289e4af91fc.jpg_sd_1280x720.jpg?imwidth=1024',
      },
      {
        url:
          'https://www.brisbanetimes.com.au/national/queensland/fraser-island-residents-told-to-evacuate-as-fire-hurtles-towards-township-20201207-p56l4b.html',
        title: 'Fraser Island residents told to evacuate as fire hurtles towards township',
        image:
          'https://static.ffx.io/images/$zoom_0.8526570048309178%2C$multiply_0.7554%2C$ratio_1.776846%2C$width_1059%2C$x_0%2C$y_5/t_crop_custom/q_86%2Cf_auto/t_brisbanetimes_no_label_no_age_social_wm/3128f66cda462439700b3d227fa5f1d88351ee64',
      },
      {
        url:
          'https://www.news.com.au/national/queensland/leave-immediately-bushfire-closes-in-on-fraser-island-township/news-story/5a2fe918cac22e474e4dfcecf8c600cb?utm_source=feedburner&utm_medium=feed&utm_campaign=Feed%253A%2Bnewscomauqldndm%2B%2528News.com.au%2B%257C%2BNational%2B%257C%2BQueensland%2529',
        title: "'Leave immediately': Bushfire closes in on Fraser Island township",
        image: 'https://cdn.newsapi.com.au/image/v1/9c31d26f2d61a5c72e2eaeab69d282ce?width=1280',
      },
      {
        url:
          'https://www.warwickdailynews.com.au/news/prepare-to-leave-conditions-at-happy-valley-set-to/4153011/',
        title: 'PREPARE TO LEAVE: Conditions at Happy Valley set to worsen',
        image:
          'https://media.apnarm.net.au/media/images/2020/12/06/v3imagesbin158575849acccc315e56221e0c0b0d4b-izkxsgk95h6c2um8hv2_ct300x300.jpg',
      },
      {
        url: 'https://www.newcastleherald.com.au/story/7045228/dangerous-fire-nears-fraser-island-homes/',
        title: 'Dangerous fire nears Fraser Island homes',
        image:
          'https://www.newcastleherald.com.au/images/transform/v1/crop/frm/silverstone-feed-data/f56c23b9-b26d-4083-a614-124c9ff29975.jpg/r0_74_800_526_w1200_h678_fmax.jpg',
      },
      {
        url: 'https://au.news.yahoo.com/dangerous-fire-nears-fraser-island-homes-194129527--spt.html',
        title: 'Dangerous fire nears Fraser Island homes',
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
      },
      {
        url:
          'https://www.perthnow.com.au/news/bushfires/dangerous-fire-nears-fraser-island-homes-ng-s-2040990',
        title: 'Dangerous fire nears Fraser Island homes',
        image:
          'https://images.perthnow.com.au/publication/S-2040990/1607307866223_Bushfire_Qld_16-9_20006001_2040990_202012061812201964e60f-d1d4-4a11-b493-4289e4af91fc.jpg_sd_1280x720.jpg?imwidth=1024',
      },
      {
        url:
          'https://www.sbs.com.au/news/residents-of-k-gari-fraser-island-told-to-leave-immediately-as-dangerous-bushfire-threatens-happy-valley',
        title:
          "Residents of K'gari-Fraser Island told to leave immediately as 'dangerous' bushfire threatens Happy Valley",
        image: 'https://sl.sbs.com.au/public/image/file/d9682736-ab07-4382-9011-80f47afe70b0/crop/16x9',
      },
      {
        url:
          'https://www.laprensalatina.com/authorities-order-evacuation-as-fraser-island-fire-nears-happy-valley/',
        title:
          'Authorities order evacuation as Fraser Island fire nears Happy Valley - La Prensa Latina Media',
        image: 'https://mk0laprensalatice12d.kinstacdn.com/wp-content/uploads/2020/12/17109201w.jpg',
      },
      {
        url:
          'http://national.corowafreepress.com.au/national/2020/12/07/2356346?slug=dangerous-fire-nears-fraser-island-homes',
        title: 'Dangerous fire nears Fraser Island homes - Corowa Free Press',
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/nagapkufzkhq5xmc7s6p',
      },
      {
        url: 'https://www.newcastleherald.com.au/story/7043211/dangerous-fire-nears-fraser-island-town/',
        title: 'Dangerous fire nears Fraser Island town',
        image:
          'https://www.newcastleherald.com.au/images/transform/v1/crop/frm/silverstone-feed-data/cc3bd3a6-8c1b-4842-b25c-803331e60235.jpg/r0_74_800_526_w1200_h678_fmax.jpg',
      },
      {
        url: 'https://www.newcastleherald.com.au/story/7043211/dangerous-fire-nears-fraser-island-homes/',
        title: 'Dangerous fire nears Fraser Island homes',
        image:
          'https://www.newcastleherald.com.au/images/transform/v1/crop/frm/silverstone-feed-data/cc3bd3a6-8c1b-4842-b25c-803331e60235.jpg/r0_74_800_526_w1200_h678_fmax.jpg',
      },
      {
        url:
          'https://www.huffingtonpost.com.au/entry/leave-immediately-bushfire-approaches-township-on-fraser-island_au_5fcd5eecc5b6636e092654fe',
        title: "'Leave Immediately': Bushfire Approaches Township On K'gari - Fraser Island",
        image: 'https://img.huffingtonpost.com/asset/5fcd6076240000b10140b509.jpeg?ops=1200_630',
      },
      {
        url:
          'https://www.sbs.com.au/news/very-dangerous-conditions-as-k-gari-fraser-island-bushfire-threatens-homes',
        title: "'Very dangerous' conditions as K'gari-Fraser Island bushfire threatens homes",
        image: 'https://sl.sbs.com.au/public/image/file/ffd3cf6c-c8ca-478f-9175-0a9b6b15c1f1/crop/16x9',
      },
      {
        url:
          'http://www.sheppnews.com.au/national-news/2020/12/08/2360124?slug=dangerous-fire-nears-fraser-island-homes-1',
        title: 'Dangerous fire nears Fraser Island homes - Shepparton News',
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/dyl8cxjaxfx22rpouajt',
      },
      {
        url: 'http://www.xinhuanet.com/english/2020-12/07/c_139569474.htm',
        title: "Evacuation notice issued on Australia's Fraser Island as bushfire approaches",
        image: null,
      },
      {
        url:
          'https://www.sbs.com.au/news/two-k-gari-fraser-island-settlements-told-to-prepare-to-leave-as-firefighters-save-happy-valley-from-blaze',
        title:
          "Two K'gari-Fraser Island settlements told to prepare to leave, as firefighters 'save' Happy Valley from blaze",
        image: 'https://sl.sbs.com.au/public/image/file/ffd3cf6c-c8ca-478f-9175-0a9b6b15c1f1/crop/16x9',
      },
      {
        url: 'https://thenewdaily.com.au/news/state/qld/2020/12/08/fraser-island-fire-town/',
        title: 'Dangerous blaze nears Fraser Island township',
        image:
          'https://1v1d1e1lmiki1lgcvx32p49h8fe-wpengine.netdna-ssl.com/wp-content/uploads/2020/12/1607376401-FraserIslandCathedrals-960x600.jpg',
      },
      {
        url: 'https://www.portstephensexaminer.com.au/story/7043211/dangerous-fire-nears-fraser-island-town/',
        title: 'Dangerous fire nears Fraser Island town',
        image:
          'https://www.portstephensexaminer.com.au/images/transform/v1/crop/frm/silverstone-feed-data/cc3bd3a6-8c1b-4842-b25c-803331e60235.jpg/r0_74_800_526_w1200_h678_fmax.jpg',
      },
      {
        url: 'https://www.mygc.com.au/happy-valley-evacuated-as-fraser-island-fire-rages-on/',
        title: 'Happy Valley evacuated as Fraser Island fire rages on - myGC.com.au',
        image: 'https://www.mygc.com.au/wp-content/uploads/2020/12/fraser-island-feature.jpg',
      },
      {
        url: 'https://www.newcastleherald.com.au/story/7045228/bushfire-nears-fraser-island-settlement/',
        title: 'Bushfire nears Fraser Island settlement',
        image:
          'https://www.newcastleherald.com.au/images/transform/v1/crop/frm/silverstone-feed-data/f56c23b9-b26d-4083-a614-124c9ff29975.jpg/r0_74_800_526_w1200_h678_fmax.jpg',
      },
      {
        url: 'https://www.newcastleherald.com.au/story/7045228/dangerous-fire-nears-fraser-island-town/',
        title: 'Dangerous fire nears Fraser Island town',
        image:
          'https://www.newcastleherald.com.au/images/transform/v1/crop/frm/silverstone-feed-data/f56c23b9-b26d-4083-a614-124c9ff29975.jpg/r0_74_800_526_w1200_h678_fmax.jpg',
      },
      {
        url:
          'http://www.benallaensign.com.au/national/2020/12/07/2356342?slug=dangerous-fire-nears-fraser-island-town',
        title: 'Dangerous fire nears Fraser Island town - Benalla Ensign',
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/osjlql8dlgq5e2tewa3o',
      },
      {
        url:
          'http://www.sheppnews.com.au/national-news/2020/12/08/2360124?slug=bushfire-nears-fraser-island-settlement',
        title: 'Bushfire nears Fraser Island settlement - Shepparton News',
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/dyl8cxjaxfx22rpouajt',
      },
      {
        url:
          'http://www.riverineherald.com.au/national/2020/12/08/2360126?slug=dangerous-fire-nears-fraser-island-town',
        title: 'Dangerous fire nears Fraser Island town - Riverine Herald',
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/q4fbzk0z4tmxcskjbims',
      },
      {
        url:
          'https://www.socialnews.xyz/2020/12/06/evacuation-notice-issued-on-australias-fraser-island-over-bushfire/',
        title: "Evacuation notice issued on Australia's Fraser Island over bushfire",
        image:
          'https://boxoffice.socialnews.xyz/get_ians_img.php.jpg?id=news/C-1-1302040&txt=Evacuation+notice+issued+on+Australia%27s+Fraser+Island+over+bushfire',
      },
      {
        url:
          'https://www.sbs.com.au/news/fears-that-k-gari-fraser-island-bushfire-has-massively-impacted-unique-ecosystems',
        title: "Fears that K'gari-Fraser Island bushfire has 'massively impacted' unique ecosystems",
        image: 'https://sl.sbs.com.au/public/image/file/d088937f-b48b-471c-b89a-17fcf35d810b/crop/16x9',
      },
      {
        url:
          'http://www.kyfreepress.com.au/national/2020/12/06/2355007?slug=fraser-island-town-out-of-immediate-danger',
        title: 'Fraser Island town out of immediate danger - Kyabram Free Press',
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/w3ajwm89zzwrwdvmgmg2',
      },
      {
        url:
          'https://www.smh.com.au/national/queensland/fraser-island-residents-told-to-evacuate-as-fire-hurtles-towards-township-20201207-p56l4b.html',
        title: 'Fraser Island residents told to evacuate as fire nears township',
        image:
          'https://static.ffx.io/images/$zoom_0.8526570048309178%2C$multiply_0.7554%2C$ratio_1.776846%2C$width_1059%2C$x_0%2C$y_5/t_crop_custom/q_86%2Cf_auto/t_smh_no_label_no_age_social_wm/3128f66cda462439700b3d227fa5f1d88351ee64',
      },
      {
        url: 'https://www.bna.bh/en/news?cms=q8FmFJgiscL2fwIzON1%252BDj9NHXEkmoZRw30clj3t0Vg%253D',
        title: 'Fire on heritage-listed Australian island nears town',
        image:
          'https://bna-media.s3-eu-west-1.amazonaws.com/Media/Images/News/World-News/1-e2216c6c-fd64-42d1-9de5-df3164042567.jpeg',
      },
      {
        url:
          'https://www.96fm.com.au/newsroom/we-saved-the-town-fraser-island-township-saved-as-dangerous-bushfires-continue-to-bear-down/',
        title: 'Fraser Island Township Saved, But Dangerous Bushfires Continue To Bear Down',
        image:
          'https://www.96fm.com.au/wp-content/uploads/sites/8/2020/12/GettyImages-1288920153.jpg?crop=0px,31px,1024px,576px&resize=2400,1350&quality=75',
      },
      {
        url:
          'https://www.msn.com/en-xl/news/newsworld/leave-immediately-bushfire-approaches-township-in-australias-fraser-island/ar-BB1bGFQ2',
        title: "'Leave Immediately': Bushfire approaches township in Australia's Fraser Island",
        image:
          'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/BB1bGyPF.img?h=630&w=1200&m=6&q=60&o=t&l=f&f=jpg',
      },
      {
        url:
          'http://www.yarrawongachronicle.com.au/national/2020/12/08/2360137?slug=dangerous-fire-nears-fraser-island-town',
        title: 'Dangerous fire nears Fraser Island town - Yarrawonga Chronicle',
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/pnv7pt6n3j3rzlplpqpc',
      },
      {
        url: 'https://www.qt.com.au/news/defiant-township-battles-on-against-inferno/4153989/',
        title: 'Defiant township battles on against inferno',
        image:
          'https://media.apnarm.net.au/media/images/2020/12/07/v3imagesbin3e7d8bbd8c7c35bf57574f0075ab6d67-5nm8zd30e3t3ei7jhv2_ct300x300.jpg',
      },
      {
        url:
          'https://7news.com.au/news/bushfires/fraser-island-bushfire-people-in-yidney-rocks-and-the-oaks-told-to-leave-immediately-c-1723319',
        title: 'LEAVE IMMEDIATELY: People in two new hamlets told to evacuate on Fraser Island',
        image:
          'https://images.7news.com.au/publication/C-1723319/fe46f31ec58408ff3c66b91ea5afbf48937dbd8c-16x9-x0y0w1920h1080.jpg?imwidth=1024',
      },
      {
        url:
          'https://www.news.com.au/technology/environment/crews-prepare-for-worst-but-hope-for-the-best-after-rain-dampens-raging-bushfires/news-story/efe1f825ba43f14d33030df3d03704d3?utm_source=feedburner&utm_medium=feed&utm_campaign=Feed%253A%2Bnewscomaunationalbreakingnewsndm%2B%2528News.com.au%2B%257C%2BNational%2B%257C%2BBreaking%2BNews%2529',
        title: "Town saved, more in harm's way on island",
        image: 'https://cdn.newsapi.com.au/image/v1/17418f12a33619d39f98b027dc1e566e?width=1280',
      },
      {
        url:
          'https://www.investing.com/news/world-news/leave-immediately-bushfire-approaches-township-in-australias-fraser-island-2362897',
        title: "'Leave Immediately': Bushfire approaches township in Australia's Frase",
        image: 'https://i-invdn-com.akamaized.net/trkd-images/LYNXMPEGB50KI_M.jpg',
      },
      {
        url:
          'http://www.riverineherald.com.au/national/2020/12/08/2360126?slug=township-saved-from-fraser-island-fire',
        title: "Township 'saved' from Fraser Island fire - Riverine Herald",
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/wbjcgyuib8godcqqsswd',
      },
      {
        url:
          'https://www.smh.com.au/national/queensland/a-threat-to-all-lives-emergency-warning-for-bushfire-on-fraser-island-s-east-coast-20201206-p56l1k.html',
        title: "'A threat to all lives': emergency warning for bushfire on Fraser Island's east coast",
        image:
          'https://static.ffx.io/images/$zoom_0.8539%2C$multiply_0.7554%2C$ratio_1.777778%2C$width_1059%2C$x_0%2C$y_189/t_crop_custom/q_86%2Cf_auto/t_smh_no_label_no_age_social_wm/69a4566ee5dc5d546dcc1462716d535efb97efde',
      },
      {
        url: 'https://www.qt.com.au/news/minutes-from-catastrophe-how-happy-valley-was-save/4154698/',
        title: 'Minutes from catastrophe: How Happy Valley was saved',
        image:
          'https://media.apnarm.net.au/media/images/2020/12/08/v3imagesbin2d51446bbbed4fcfe897fa76f5417f37-z86zv81o75lrqyaqhv2_ct300x300.jpg',
      },
      {
        url:
          'https://www.abc.net.au/news/2020-12-08/queensland-weather-storms-clean-up-severe-cells/12959670',
        title:
          'Rain provides relief to Fraser Island firefighting efforts as south-east Queensland mops up after severe storm cell',
        image: 'https://www.abc.net.au/cm/rimage/12960158-16x9-large.jpg?v=2',
      },
      {
        url:
          'https://www.heraldsun.com.au/technology/environment/crews-prepare-for-worst-but-hope-for-the-best-after-rain-dampens-raging-bushfires/news-story/efe1f825ba43f14d33030df3d03704d3',
        title: 'Fears fire could reignite after rain',
        image: 'https://content.api.news/v3/images/bin/e4b6f107708fe53b8a390d3bc4e208f9',
      },
      {
        url: 'https://uk.reuters.com/article/us-australia-fires-fraser-island-idUKKBN28G0VX',
        title: "Firefighters slow bushfire threatening township in Australia's Fraser Island",
        image:
          'https://static.reuters.com/resources/r/?m=02&d=20201207&t=2&i=1543658832&r=LYNXMPEGB60CS&w=800',
      },
      {
        url:
          'https://www.brisbanetimes.com.au/national/queensland/absolute-tragedy-new-warning-issued-as-fraser-island-blaze-worsens-20201205-p56kwh.html',
        title: "'Absolute tragedy': New warning issued as Fraser Island blaze worsens",
        image:
          'https://static.ffx.io/images/$zoom_1.151648148148148%2C$multiply_0.7554%2C$ratio_1.776846%2C$width_1059%2C$x_357%2C$y_180/t_crop_custom/q_86%2Cf_auto/t_brisbanetimes_no_label_no_age_social_wm/3254a9b4dbbc535bf17d493a1677a03b34ec23f7',
      },
      {
        url:
          'https://www.perthnow.com.au/news/environment/shocking-pictures-of-fire-ravaged-fraser-island-scorched-by-eight-week-blaze-ng-d2dd4e1afedb325009608798c2cafe74',
        title: 'Shocking pictures of fire-ravaged island',
        image:
          'https://images.perthnow.com.au/publication/D2DD4E1AFEDB325009608798C2CAFE74/1607477550093_826d730c683a36d608aee9f50e23606b.jpeg?imwidth=1024',
      },
      {
        url:
          'https://www.daily-sun.com/post/522221/Australia-bushfire:-Fraser-Island-residents-told-to-leave-immediately',
        title: 'Australia bushfire: Fraser Island residents told to leave immediately | daily sun',
        image: 'https://www.daily-sun.com/assets/news_images/2020/12/07/bushfire-daily_sun.jpg',
      },
      {
        url:
          'https://www.news.com.au/technology/environment/shocking-pictures-of-fireravaged-fraser-island-scorched-by-eightweek-blaze/news-story/d2dd4e1afedb325009608798c2cafe74',
        title: 'Shocking Fraser Island picture',
        image: 'https://cdn.newsapi.com.au/image/v1/29fa141ad746279af813a8f215e536c9?width=1280',
      },
      {
        url:
          'https://www.sbs.com.au/news/fire-emergency-on-world-heritage-listed-k-gari-fraser-island-downgraded-after-massive-effort',
        title: "Fire emergency on World Heritage listed K'gari-Fraser Island downgraded after massive effort",
        image: 'https://sl.sbs.com.au/public/image/file/28e7eb16-6a00-496b-a678-83a712b556c4/crop/16x9',
      },
      {
        url: 'https://au.news.yahoo.com/fraser-island-fire-emergency-downgraded-210755931--spt.html',
        title: 'Fraser Island fire emergency downgraded',
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
      },
      {
        url: 'https://www.newcastleherald.com.au/story/7047257/fraser-island-fire-emergency-downgraded/',
        title: 'Fraser Island fire emergency downgraded',
        image:
          'https://www.newcastleherald.com.au/images/transform/v1/crop/frm/silverstone-feed-data/da14252c-d52d-4286-afb9-3d962b81c683.jpg/r0_74_800_526_w1200_h678_fmax.jpg',
      },
      {
        url: 'https://www.portstephensexaminer.com.au/story/7047257/fraser-island-fire-emergency-downgraded/',
        title: 'Fraser Island fire emergency downgraded',
        image:
          'https://www.portstephensexaminer.com.au/images/transform/v1/crop/frm/silverstone-feed-data/da14252c-d52d-4286-afb9-3d962b81c683.jpg/r0_74_800_526_w1200_h678_fmax.jpg',
      },
      {
        url:
          'https://www.smh.com.au/national/queensland/absolute-tragedy-fraser-island-blaze-downgrades-but-conditions-set-to-worsen-20201205-p56kwh.html',
        title: "'Absolute tragedy': Fraser Island blaze downgrades, but conditions set to worsen",
        image:
          'https://static.ffx.io/images/$zoom_1.151648148148148%2C$multiply_0.7554%2C$ratio_1.776846%2C$width_1059%2C$x_357%2C$y_180/t_crop_custom/q_86%2Cf_auto/t_smh_no_label_no_age_social_wm/3254a9b4dbbc535bf17d493a1677a03b34ec23f7',
      },
      {
        url:
          'https://www.watoday.com.au/national/queensland/no-damage-to-happy-valley-town-as-fraser-island-evacuation-orders-ease-20201208-p56lho.html',
        title: 'No damage to Happy Valley town as Fraser Island evacuation orders ease',
        image:
          'https://static.ffx.io/images/$zoom_0.8159%2C$multiply_0.7554%2C$ratio_1.776846%2C$width_1059%2C$x_187%2C$y_0/t_crop_custom/q_86%2Cf_auto/t_watoday_no_label_no_age_social_wm/da1fdef6c8c011b2002104127e24bac6719add2e',
      },
      {
        url: 'https://junkee.com/fraser-island-fires/281287',
        title: 'Fraser Island Bushfire: Residents Evacuated After Emergency Declaration',
        image: 'https://junkee.com/wp-content/uploads/2020/12/fraser-island-fb.jpeg',
      },
      {
        url:
          'http://www.riverineherald.com.au/national/2020/12/09/2364051?slug=fraser-island-fire-emergency-downgraded',
        title: 'Fraser Island fire emergency downgraded - Riverine Herald',
        image:
          'https://res.cloudinary.com/cognitives/image/upload/c_fill,dpr_auto,f_auto,fl_lossy,h_675,q_auto,w_1200/ka9dlwykdjsywmuqjmg9',
      },
      {
        url: 'https://thenewdaily.com.au/news/state/qld/2020/12/09/fraser-island-fire-weather/',
        title: "'Walls of fire': Fresh fears for Fraser Island",
        image:
          'https://1v1d1e1lmiki1lgcvx32p49h8fe-wpengine.netdna-ssl.com/wp-content/uploads/2020/12/1607466300-12962020-3x2-xlarge-960x600.jpg',
      },
      {
        url:
          'https://www.newdelhitimes.com/residents-of-australias-fraser-island-township-urged-to-evacuate-as-wildfire-approaches/',
        title: "Residents of Australia's Fraser Island Township Urged to Evacuate as Wildfire Approaches",
        image:
          'https://i1.wp.com/www.newdelhitimes.com/wp-content/uploads/2020/12/18-6.jpg?fit=259%2C194&ssl=1&w=144',
      },
      {
        url:
          'https://www.abc.net.au/news/2020-12-07/fraser-island-kgari-fire-update-happy-valley-saved/12958386',
        title: 'Happy Valley township saved from fierce Fraser Island bushfire',
        image: 'https://www.abc.net.au/cm/rimage/12958746-16x9-large.jpg?v=2',
      },
    ],
  },

  {
    id: 'eng-6243897',
    type: EVENT_TYPE.WILDFIRE,
    date: moment.utc('2020-10-26'),
    sensingDates: {
      beforeEvent: moment.utc('2020-10-20'),
      onEvent: moment.utc('2020-10-30'),
    },
    title: 'Silverado Fire: 2 firefighters critically injured while battling 7,200-acre blaze near Irvine',
    lat: 33.72366,
    lng: -117.69739,
    zoom: 13,
    exactLocationName: 'Off the 241 in the Irvine area',
    locationName: 'California, USA',
    description:
      'IRVINE, Calif. (KABC) -- Two firefighters were critically injured while battling a quickly spreading vegetation fire that broke out near Irvine Monday morning, which prompted mandatory evacuations for thousands of residents as the region was seeing strong winds.\n\nThe blaze, dubbed the Silverado Fire, was reported just after 6:45 a.m. at 10 acres in size in the area of Santiago Canyon and Silverado Canyon roads, according to the Orange County Fire Authority. There had been conflicting reports rega',
    articles: [
      {
        url:
          'https://www.nbclosangeles.com/news/california-wildfires/silverado-fire-irvine-orange-county-wildfires-evacuations/2451464/',
        title: 'Silverado Fire 32% Contained as Some Irvine Residents Return Home',
        image: 'https://media.nbclosangeles.com/2020/10/GettyImages-1229325177-1.jpg?resize=1200%2C675',
      },
      {
        url:
          'https://www.mercurynews.com/silverado-fire-forces-90000-to-evacuate-2-firefighters-critically-burned',
        title: 'Silverado fire forces 90,000 to evacuate; 2 firefighters critically burned',
        image: 'https://www.mercurynews.com/wp-content/themes/scng/static/images/mercurynews.jpg',
      },
      {
        url: 'https://abc7.com/7386188/',
        title:
          'Silverado Fire: 13,354 acres burned, 78K ordered to evacuate as blaze that critically injured 2 firefighters continues to rage near Irvine',
        image: 'https://cdn.abcotvs.com/dip/images/7388275_102720-kabc-6am-silverado-fire-CC-vid.jpg?w=1600',
      },
      {
        url:
          'https://www.dhakatribune.com/world/south-asia/2020/10/27/90-000-flee-homes-near-la-as-wildfires-rage',
        title: '90,000 flee homes near LA as wildfires rage',
        image:
          'https://eng-media.dhakatribune.com/?width=476&height=249&cropratio=16:9&quality=100&image=/uploads/2020/10/new-1603792527577.gif',
      },
      {
        url: 'https://news.yahoo.com/cause-southern-california-fire-forced-200414754.html',
        title: "Cause of Southern California fire that forced thousands to evacuate may be 'lashing wire'",
        image:
          'https://s.yimg.com/ny/api/res/1.2/jLlPBzG2tV7qIU3kh3Mpxg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTIwMDA7aD0xMzg5/https://s.yimg.com/uu/api/res/1.2/kqeKcDRhczaoGsaMdYcXjg--~B/aD0xNzM2O3c9MjUwMDtzbT0xO2FwcGlkPXl0YWNoeW9u/https://media.zenfs.com/en-US/nbc_news_122/4dcd935813e345731ea6d7563a3ade2b',
      },
      {
        url: 'https://www.channelstv.com/2020/10/27/thousands-flee-homes-near-los-angeles-as-wildfires-rage/',
        title: 'Thousands Flee Homes Near Los Angeles As Wildfires Rage',
        image: 'https://www.channelstv.com/wp-content/uploads/2020/09/california.jpg',
      },
      {
        url: 'https://abc7news.com/7388761/',
        title: 'Silverado Fire: 13,000 acres burned, 78K ordered to evacuate',
        image: 'https://cdn.abcotvs.com/dip/images/7390421_102720-kgo-silverado-fire-sky7-img.jpg?w=1600',
      },
      {
        url:
          'https://mynewsla.com/crime/2020/10/29/silverado-fire-32-contained-as-some-irvine-residents-return-home/',
        title: 'Silverado Fire 32% Contained as Some Irvine Residents Return Home - MyNewsLA.com',
        image: 'https://mynewsla.com/wp-content/uploads/2016/04/MyNewsLA-AMP-Logo.png',
      },
      {
        url:
          'https://www.nbclosangeles.com/news/california-wildfires/silverado-fire-32-contained-as-some-irvine-residents-return-home/2451464/',
        title: 'Silverado Fire 32% Contained as Some Irvine Residents Return Home',
        image: 'https://media.nbclosangeles.com/2020/10/GettyImages-1229325177-1.jpg?resize=1200%2C675',
      },
      {
        url:
          'https://www.fox35orlando.com/news/wind-driven-wildfires-rage-through-southern-california-as-thousands-flee-homes',
        title: 'Southern California wildfires: Wind-driven blazes force thousands to flee',
        image:
          'https://images.foxtv.com/static.fox35orlando.com/www.fox35orlando.com/content/uploads/2020/10/724/407/silverado-fire-getty.jpg?ve=1&tl=1',
      },
      {
        url:
          'https://eu.desertsun.com/story/news/2020/10/27/silverado-fire-evacuation-warnings-issued-mission-viejo-trabuco-canyon/3748568001/',
        title: 'Silverado Fire: Evacuation warnings issued for Mission Viejo, Trabuco Canyon',
        image:
          'https://www.gannett-cdn.com/presto/2020/10/27/USAT/a966fcca-9e61-4c4b-b7f2-1c4c51aabdd4-XXX_SiilverSurferFire_3.JPG?auto=webp&crop=7565,4255,x1,y469&format=pjpg&width=1200',
      },
      {
        url: 'https://weather.com/news/news/2020-10-27-southern-california-wildfires-silverado-blue-ridge',
        title:
          'Two Southern California Wildfires Drive 100,000 from Their Homes; Two Firefighters Critically Injured | The Weather Channel - Articles from The Weather Channel | weather.com',
        image: 'https://s.w-x.co/SilveradoTwo102720.jpg',
      },
      {
        url:
          'https://www.dailymail.co.uk/news/article-8882819/California-authorities-evacuate-90-000-people-Silverado-Blue-Ridge-wildfires-blaze.html',
        title: 'California authorities evacuate 90,000 people in Orange County',
        image: 'https://i.dailymail.co.uk/1s/2020/10/27/04/34883860-0-image-a-88_1603771730933.jpg',
      },
      {
        url: 'https://abc30.com/7388549/',
        title:
          '2 firefighters critically injured while battling Silverado Fire in SoCal, thousands evacuated',
        image: 'https://cdn.abcotvs.com/dip/images/7388275_102720-kabc-6am-silverado-fire-CC-vid.jpg?w=1600',
      },
      {
        url:
          'https://gvwire.com/2020/10/27/fierce-winds-drive-new-socal-wildfires-santa-ana-conditions-expected-today/',
        title: 'Fierce Winds Drive New SoCal Wildfires. Santa Ana Conditions Expected Today. - GV Wire',
        image: 'https://media.gvwire.com/wp-content/uploads/2020/10/27083011/fire.jpg',
      },
    ],
    infoHighlights: [
      { title: 'Estimated burned area:', value: '1,965.71 ha', description: BURNED_AREA_DESCRIPTION },
    ],
  },

  {
    id: 'eng-6251749',
    type: EVENT_TYPE.WILDFIRE,
    date: moment.utc('2020-10-27'),
    sensingDates: {
      beforeEvent: moment.utc('2020-10-20'),
      onEvent: moment.utc('2020-10-30'),
    },
    title: 'Calmer California winds help firefighters beat back 2 blazes',
    lat: 33.91291,
    lng: -117.70297,
    zoom: 13,
    exactLocationName: 'Chino Hills',
    locationName: 'California, USA',
    description:
      '1 of 22\n\nHerman Termeer, bottom left, takes pictures as a helicopter drops water over the Blue Ridge Fire burning along the hillside Tuesday, Oct. 27, 2020, in Chino Hills, Calif. Facing extreme wildfire conditions this week that included hurricane-level winds, the main utility in Northern California cut power to nearly 1 million people while its counterpart in Southern California pulled the plug on just 30 customers to prevent power lines and other electrical equipment from sparking a blaze.\n\nJa',
    articles: [
      {
        url:
          'https://siouxcityjournal.com/news/national/california-utility-slow-to-pull-plug-before-wildfire-erupted/article_5fa0444d-feac-54cc-bac2-cb8227fcc387.html',
        title: 'California utility slow to pull plug before wildfire erupted',
        image:
          'https://bloximages.chicago2.vip.townnews.com/siouxcityjournal.com/content/tncms/assets/v3/editorial/7/53/7539d843-0778-54fb-88bf-6e71f3ee6cf5/5f9906396e076.image.jpg?crop=1763%2C992%2C0%2C91&resize=1120%2C630&order=crop%2Cresize',
      },
      {
        url:
          'https://www.nwitimes.com/news/national/calmer-california-winds-help-firefighters-beat-back-2-blazes/article_87c49476-3c2f-5dd0-9435-eff9d56a8bc3.html',
        title: 'Calmer California winds help firefighters beat back 2 blazes',
        image:
          'https://bloximages.chicago2.vip.townnews.com/nwitimes.com/content/tncms/assets/v3/editorial/0/99/099326bf-9df3-5e58-acd8-e2cdb2799fb3/5f99063c05ce2.image.jpg?crop=1763%2C992%2C0%2C91&resize=1120%2C630&order=crop%2Cresize',
      },
      {
        url:
          'https://tucson.com/news/national/california-utility-slow-to-pull-plug-before-wildfire-erupted/article_80d718a8-8130-5cfd-b2fa-c09e4b4d5916.html',
        title: 'California utility slow to pull plug before wildfire erupted',
        image:
          'https://bloximages.chicago2.vip.townnews.com/tucson.com/content/tncms/assets/v3/editorial/c/17/c170f729-8232-558a-a831-4657e39cfdab/5f9905b8eea78.image.jpg?crop=1763%2C992%2C0%2C91&resize=1120%2C630&order=crop%2Cresize',
      },
      {
        url:
          'https://tucson.com/news/national/correction-california-wildfires-story/article_80d718a8-8130-5cfd-b2fa-c09e4b4d5916.html',
        title: 'Correction: California Wildfires story',
        image:
          'https://bloximages.chicago2.vip.townnews.com/tucson.com/content/tncms/assets/v3/editorial/c/17/c170f729-8232-558a-a831-4657e39cfdab/5f9aa4b48a904.image.jpg?crop=1763%2C992%2C0%2C91&resize=1120%2C630&order=crop%2Cresize',
      },
      {
        url:
          'https://santamariatimes.com/ap/national/calmer-california-winds-help-firefighters-beat-back-2-blazes/article_7402d3e5-9eaa-54ef-9239-6a3d1d89a4bd.html',
        title: 'Calmer California winds help firefighters beat back 2 blazes',
        image:
          'https://bloximages.chicago2.vip.townnews.com/santamariatimes.com/content/tncms/assets/v3/editorial/2/78/27851e18-d468-5592-8808-183e99459690/5f99c5a6a1aff.image.jpg?crop=512%2C288%2C0%2C26&resize=512%2C288&order=crop%2Cresize',
      },
      {
        url: 'https://www.arkansasonline.com/news/2020/oct/30/many-californians-can-go-home/',
        title: 'Many Californians can go home',
        image:
          'https://wehco.media.clients.ellingtoncms.com/imports/adg/photos/196521933_196518861-19ae16095f114075bb042dcc54504559_t600.jpg?4326734cdb8e39baa3579048ef63ad7b451e7676',
      },
      {
        url: 'https://sgtalk.org/mybb/Thread-Raging-California-fires-keep-tens-of-thousands-from-homes',
        title: 'Raging California fires keep tens of thousands from homes',
        image: 'https://storage.googleapis.com/afs-prod/media/38a4953b11214c1e8a5782a5c10ea5f7/800.jpeg',
      },
    ],
    infoHighlights: [
      { title: 'Estimated burned area:', value: '2,613.26 ha', description: BURNED_AREA_DESCRIPTION },
    ],
  },

  {
    id: 'eng-6232785',
    type: EVENT_TYPE.WILDFIRE,
    date: moment.utc('2020-10-19'),
    sensingDates: {
      beforeEvent: moment.utc('2020-10-06'),
      onEvent: moment.utc('2020-10-19'),
    },
    title: 'Record wildfires continue to expand across Colorado',
    lat: 44.409471899585924,
    lng: -120.1983768868472,
    zoom: 13,
    locationName: 'Colorado, USA',
    description:
      'Colorado has become a major hotspot for record-breaking wildfires in the Western United States in the 2020 fire season with flames reaching the major population centers of Boulder and Fort Collins. As of Thursday, eleven different fires have been burning across the state razing over 550,000 acres and dozens of homes. Thousands of residents are under evacuation orders.\n\nRed flag warnings have been in effect throughout the state as unusually warm temperatures',
    articles: [
      {
        url: 'https://coloradosun.com/2020/10/20/colorado-largest-wildfire-history/',
        title: 'Fire charts that show where 2020 ranks in Colorado wildfire history',
        image:
          'https://coloradosun.com/wp-content/uploads/sites/15/2020/10/JosephGruber_20201018_000659_44577-2.jpg?resize=1200,630',
      },
      {
        url: 'https://www.wyomingpublicmedia.org/post/each-fire-burning-more-land-usual-year-nationwide',
        title: 'Each Fire Burning More Land Than Usual This Year, Nationwide',
        image:
          'https://www.wyomingpublicmedia.org/sites/wpr/files/styles/medium/public/202010/fire_bar_charts.png',
      },
      {
        url: 'https://www.wsws.org/en/articles/2020/10/23/colo-o23.html',
        title: 'Record wildfires continue to expand across Colorado',
        image: 'https://www.wsws.org/asset/97c331c4-63fa-4e1d-8d3a-0880d82a00a6?rendition=image1280',
      },
      {
        url: 'https://www.counterpunch.org/2020/10/22/rethinking-our-relationship-with-fire/',
        title: 'Rethinking Our Relationship With Fire - CounterPunch.org',
        image: 'https://www.counterpunch.org/wp-content/dropzone/2020/08/cp-default.png',
      },
      {
        url:
          'https://saskatoon.ctvnews.ca/prince-albert-firefighters-return-after-devastating-wildfire-in-oregon-1.5156919',
        title: 'Prince Albert firefighters return after devastating wildfire in Oregon',
        image:
          'https://www.ctvnews.ca/polopoly_fs/1.5156929.1603405228!/httpImage/image.jpg_gen/derivatives/landscape_620/image.jpg',
      },
      {
        url:
          'https://news.globallandscapesforum.org/47794/fires-2020-experts-explain-the-global-wildfire-crisis/',
        title: 'Fires 2020: Experts explain the global wildfire crisis',
        image:
          'https://i1.wp.com/news.globallandscapesforum.org/wp-content/uploads/2020/10/fires-caro.jpg?fit=2046%2C636&ssl=1',
      },
      {
        url: 'https://kbnd.com/kbnd-news/local-news-feed/536021',
        title: 'ODF Fire Report Update',
        image: 'https://kbnd.com/assets/images/odf_fire.jpg',
      },
      {
        url:
          'https://www.vox.com/21507802/wildfire-2020-california-indigenous-native-american-indian-controlled-burn-fire',
        title: 'Why fire is our best tool against megafires',
        image:
          'https://cdn.vox-cdn.com/thumbor/0gmbwHIcd1TYejj5Ce80It0-wbQ=/0x0:3000x1500/fit-in/1200x600/cdn.vox-cdn.com/uploads/chorus_asset/file/21978165/GettyImages_1279741558.jpg',
      },
      {
        url:
          'https://www.wate.com/news/four-fires-in-10-days-in-claxton-community-what-firefighters-want-you-to-avoid/',
        title: 'Four fires in 10 days in Claxton community: What firefighters want you to avoid',
        image: 'https://www.wate.com/wp-content/uploads/sites/42/2020/10/claxton-fire.jpg?w=1280',
      },
      {
        url: 'https://www.radioiowa.com/2020/10/23/28-fire-deaths-reported-in-iowa-so-far-this-year/',
        title: '28 fire deaths reported in Iowa so far this year - Radio Iowa',
        image: null,
      },
      {
        url: 'https://www.nationalobserver.com/2020/10/23/opinion/burning-planet-why-we-must-learn-live-fire',
        title: 'A burning planet: Why we must learn to live with fire',
        image:
          'https://www.nationalobserver.com/sites/nationalobserver.com/files/img/2020/10/22/matt-howard-eakdzk4lo4o-unsplash.jpg',
      },
    ],
    infoHighlights: [
      { title: 'Estimated burned area:', value: '36.39 ha', description: BURNED_AREA_DESCRIPTION },
    ],
  },
];
