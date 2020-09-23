export default {
  stateBreakingChangeCounter: 61,
  simpleMode: true,
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
          options: ['Home', 'Pages', 'Watch', 'Marketplace', 'Groups'].map((name, i) => ({
            id: `top-panel-explore-item-${i}`,
            name,
              cssSelectorName: `topPanelExploreIndex:${i}`,
              hide: false,
          }))
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
            'Videos',
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
          ].map((name, i)=> ({
            id: `explore-${i}`,
            name,
            cssSelectorName: `leftPanelExploreItemAtIndex:${i}`,
            labelCssSelectorName: `leftPanelExploreItemAtIndex:${i}`,
            hide: false,
          }))
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
            cssSelectorName:
              'composerToolbar, composerFeedToolbar',
            hide: false,
          },
          options: [
            {
              id: 'composer-create-room',
              name: 'Skapa rum',
              cssSelectorName: 'composerToolbarIndex:0',
              labelCssSelectorName: 'composerToolbarIndex:0',
              hide: false,
            },
            {
              id: 'composer-add-pic',
              name: 'Foto/video',
              cssSelectorName: 'composerToolbarIndex:1',
              labelCssSelectorName: 'composerToolbarIndex:1',
              hide: false,
            },
            {
              id: 'composer-tag-friends',
              name: 'Tagga vänner',
              cssSelectorName: 'composerToolbarIndex:2',
              labelCssSelectorName: 'composerToolbarIndex:2',
              hide: false,
            },
            {
              id: 'composer-feeling',
              name: 'Känsla/aktivitet',
              cssSelectorName: 'composerToolbarIndex:3',
              labelCssSelectorName: 'composerToolbarIndex:3',
              hide: false,
            },
            {
              id: 'composer-check-in',
              name: 'Checka in',
              cssSelectorName: 'composerToolbarIndex:4',
              labelCssSelectorName: 'composerToolbarIndex:4',
              hide: false,
            },
            {
              id: 'composer-gif',
              name: 'GIF',
              cssSelectorName: 'composerToolbarIndex:5',
              labelCssSelectorName: 'composerToolbarIndex:5',
              hide: false,
            },
            {
              id: 'composer-live-stream',
              name: 'Livevideo',
              cssSelectorName: 'composerToolbarIndex:6',
              labelCssSelectorName: 'composerToolbarIndex:6',
              hide: false,
            },
            {
              id: 'composer-charity',
              name: 'Samla in pengar',
              cssSelectorName: 'composerToolbarIndex:7',
              labelCssSelectorName: 'composerToolbarIndex:7',
              hide: false,
            },
            {
              id: 'composer-video-party',
              name: 'Videoparty',
              cssSelectorName: 'composerToolbarIndex:8',
              labelCssSelectorName: 'composerToolbarIndex:8',
              hide: false,
            },
          ],
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
      ]
    },
    {
      categoryName: 'Vänner',
      options: [
        {
          id: 'friends-recommended',
          name: 'Rekommenderade Vänner',
          cssSelectorName: 'friendsRecommendations',
          hide: false,
        }
      ]
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
        }
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
};
