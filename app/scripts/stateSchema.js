export default {
  stateBreakingChangeCounter: 80,
  globalToggle: false,
  thingsToHide: [
    {
      categoryName: 'Menyalternativ',
      groups: [
        {
          option: {
            id: 'top-panel-explore',
            name: 'Huvudsektioner',
            cssSelectorName: 'topPanelExplore',
            hide: false,
          },
          options: [
            'Home',
            'Pages',
            'Watch',
            'Marketplace',
            'Groups',
            'Games',
          ].map((name, i) => ({
            id: `top-panel-explore-${name}`,
            name,
            cssSelectorName: `topPanelExplore${name}`,
            hide: false,
          })),
        },
        {
          option: {
            id: 'leftPanelShortCuts',
            name: 'Genvägar',
            cssSelectorName: 'leftPanelShortCuts',
            labelCssSelectorName: '',
            hide: false,
          },
        },
        {
          option: {
            id: 'leftPanelExplore',
            name: 'Utforska',
            cssSelectorName: 'leftPanelExplore',
            hide: false,
          },
          options: [
            'Covid-19-informationscentret',
            'Sidor',
            'Vänner',
            'Messenger',
            'Evenemang',
            'Marketplace',
            'Videor',
            'Insamlingar',
            'Grupper',
            'Vänlistor',
            'Minnen',
            'Spel',
            'Erbjudanden',
            'Spelvideo',
            'Köp- och säljgrupper',
            'Jobb',
            'Senaste',
            'Annonser',
            'Facebook Pay',
            'Sparat',
            'Krisrespons',
            'Oculus',
            'Senaste annonsaktivitet',
            'Livevideor',
            'Vädret',
          ].map((name, i) => ({
            id: `explore-${i}`,
            name,
            cssSelectorName: `leftPanelExploreTextSearch:${name}`,
            labelCssSelectorName: `leftPanelExploreTextSearch:${name}`,
            hide: false,
          })),
        },
      ],
    },
    {
      categoryName: 'När man skapar inlägg',
      groups: [
        {
          option: {
            id: 'composer',
            name: 'Skapa inlägg',
            cssSelectorName: 'composer, composerFeed, composerToolbarFull',
            hide: false,
          },
        },
        {
          option: {
            id: 'composer-background-button',
            name: 'Knapp för bakgrund',
            cssSelectorName: 'composerBackgroundButton',
            hide: false,
          },
        },
        {
          option: {
            id: 'composer-emoji-button',
            name: 'Emojiknapp',
            cssSelectorName: 'composerEmojiButton',
            hide: false,
          },
        },
        {
          option: {
            id: 'composer-audience-button',
            name: 'Knapp för att hantera mottagare',
            cssSelectorName: 'composerAudienceButton',
            hide: false,
          },
        },
        {
          option: {
            id: 'composer-toolbar',
            name: '"Lägg till"-knappar',
            cssSelectorName: 'composerToolbar, composerFeedToolbar',
            hide: false,
          },
          options: [
            { id: 'composer-create-room', text: 'Skapa rum' },
            { id: 'composer-add-pic', text: 'Foto/video' },
            { id: 'composer-tag-friends', text: 'Tagga vänner' },
            { id: 'composer-feeling', text: 'Känsla/aktivitet' },
            { id: 'composer-check-in', text: 'Checka in' },
            { id: 'composer-gif', text: 'GIF' },
            { id: 'composer-live-stream', text: 'Livevideo' },
            { id: 'composer-charity', text: 'Samla in pengar' },
            { id: 'composer-video-party', text: 'Videoparty' },
          ].map(({ id, text }, i) => ({
            id,
            name: text,
            cssSelectorName: `composerToolbarIndex:${i}, composerFeedToolbarText:${text}`,
            labelCssSelectorName: `composerToolbarIndex:${i}`,
            hide: false,
          })),
        },
      ],
    },
    {
      categoryName: 'Inställningar på andras inlägg',
      options: [
        {
          id: 'post-settings-save',
          name: 'Spara inlägg',
          cssSelectorName: 'postSettingsSave',
          hide: false,
        },
        {
          id: 'post-settings-hide-ad',
          name: 'Dölj inlägg/annons',
          cssSelectorName: 'postSettingsHide',
          hide: false,
        },
        {
          id: 'post-settings-notifications',
          name: 'Följ inlägg',
          cssSelectorName: 'postSettingsNotifications',
          hide: false,
        },
      ],
    },
    {
      categoryName: 'Vänner',
      options: [
        {
          id: 'friends-recommended',
          name: 'Rekommenderade Vänner',
          cssSelectorName: 'friendsRecommendations',
          hide: false,
        },
      ],
    },
    {
      categoryName: 'Övrigt',
      options: [
        {
          id: 'stories',
          name: 'Händelser',
          cssSelectorName: 'stories',
          hide: false,
        },
        {
          id: 'videoChats',
          name: 'Rum',
          cssSelectorName: 'videoChats',
          hide: false,
        },
        {
          id: 'right-panel-sponsored',
          name: 'Högerpanel sponsrad',
          cssSelectorName: 'rightPanelSponsored',
          hide: false,
        },
      ],
    },
  ],
  customCss: [
    {
      enabled: true,
      id: 'zoom',
      name: 'Zoom',
      cssSelectorName: 'body',
      property: 'zoom',
      unit: '%',
      value: 100,
      min: 50,
      max: 200,
    },
    // {
    //   enabled: false,
    //   id: "paragraphsize",
    //   name: "Brödtext textstorlek",
    //   selector: "p",
    //   property: "font-size",
    //   unit: "px",
    //   value: 19,
    //   min: 10,
    //   max: 40
    // },
    // {
    //   enabled: false,
    //   id: "textsize",
    //   name: "Övergripande textstorlek",
    //   selector: "body",
    //   property: "font-size",
    //   unit: "%",
    //   value: 100,
    //   min: 60,
    //   max: 240
    // }
  ],
  audienceSettings: {
    replaceAudienceIconsWithText: false,
    highlightAudienceWhenPosting: false,
  },
  facebookCssSelectors: {},
}
