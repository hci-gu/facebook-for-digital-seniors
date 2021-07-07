export default {
  stateBreakingChangeCounter: 90,
  globalToggle: true,
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
            'Covid-19-informationscentret', // 0
            'Sidor', // 1
            'Vänner', // 2
            'Messenger', // 3
            'Evenemang', // 4
            'Marketplace', // 5
            'Videor', // 6
            'Insamlingar', // 7
            'Grupper', // 8
            'Vänlistor', // 9
            'Minnen', // 10
            'Spela spel', // 11
            'Erbjudanden', // 12
            'Spelvideo', // 13
            'Köp- och säljgrupper', // 14
            'Jobb', // 15
            'Senaste', // 16
            'Annonser', // 17
            'Facebook Pay', // 18
            'Sparat', // 19
            'Krisrespons', // 20
            'Oculus', // 21
            'Senaste annonsaktivitet', // 22
            'Livevideor', // 23
            'Vädret', // 24
            'Annonscenter', // 25
            'Ads Manager', // 26
            'Watch', // 27
          ].map((name, i) => ({
            id: `explore-${i}`,
            name,
            cssSelectorName: `leftPanelExploreTextSearch:${name}`,
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
            { id: 'composer-question', text: 'Håll en frågestund' },
          ].map(({ id, text }, i) => ({
            id,
            name: text,
            cssSelectorName: `composerToolbarText:${text}, composerFeedToolbarText:${text}`,
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
          textSearch: 'Spara inlägg',
          digForParents: 4,
          hide: false,
        },
        {
          id: 'post-settings-hide',
          name: 'Dölj inlägg/annons',
          textSearch: 'Dölj inlägg',
          digForParents: 4,
          hide: false,
        },
        {
          id: 'post-settings-save-link',
          name: 'Spara inlägg',
          textSearch: 'Spara länk',
          digForParents: 4,
          hide: false,
        },
        {
          id: 'post-settings-save-video',
          name: 'Spara inlägg',
          textSearch: 'Spara video',
          digForParents: 4,
          hide: false,
        },
        {
          id: 'post-settings-hide-ad',
          name: 'Dölj inlägg/annons',
          textSearch: 'Dölj annons',
          digForParents: 4,
          hide: false,
        },
        {
          id: 'post-settings-notifications',
          name: 'Följ inlägg',
          textSearch: 'Aktivera aviseringar för det här inlägget',
          digForParents: 4,
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
          cssSelectorName: 'rightPanelSponsored, rightPanelSponsoredContent',
          hide: false,
        },
        {
          id: 'footer-text',
          name: 'Fotnot',
          cssSelectorName: 'footerText',
          hide: false,
        },
      ],
    },
  ],
  audienceSettings: {
    replaceAudienceIconsWithText: false,
    highlightAudienceWhenPosting: false,
  },
  facebookCssSelectors: {},
}
