export default {
  stateBreakingChangeCounter: 36,
  simpleMode: true,
  globalToggle: false,
  thingsToHide: [
    {
      categoryName: 'Menyalternativ',
      groups: [
        {
          option: {
            id: 'universalNav',
            name: 'Huvudsektioner',
            cssSelectorName: 'universalNav',
            hide: false,
          },
          options: [
            {
              id: 'universal-nav-item-0',
              name: 'x',
              cssSelectorName: 'universalNavItemAtIndex:0',
              labelCssSelectorName: 'universalNavItemLabel',
              hide: false,
            },
            {
              id: 'universal-nav-item-1',
              name: 'x',
              cssSelectorName: 'universalNavItemAtIndex:1',
              labelCssSelectorName: 'universalNavItemLabel',
              hide: false,
            },
            {
              id: 'universal-nav-item-2',
              name: 'x',
              cssSelectorName: 'universalNavItemAtIndex:2',
              labelCssSelectorName: 'universalNavItemLabel',
              hide: false,
            },
            {
              id: 'universal-nav-item-3',
              name: 'x',
              cssSelectorName: 'universalNavItemAtIndex:3',
              labelCssSelectorName: 'universalNavItemLabel',
              hide: false,
            },
          ],
        },
        {
          option: {
            id: 'pinnedNav',
            name: 'Genvägar',
            cssSelectorName: 'pinnedNav',
            labelCssSelectorName: 'pinnedNavLabel',
            hide: false,
          },
        },
        {
          option: {
            id: 'appsNav',
            name: 'Utforska',
            cssSelectorName: 'appsNav',
            labelCssSelectorName: 'appsNavLabel',
            hide: false,
          },
          /*
            0 - covid info
            1 - events
            2 - pages
            3 - groups
            4 - donations
            5 - friendlists
            6 - games
            7 - memories
            8 - marketplace
            9 - work
            10 - ads-manager
            11 - handle-apps
            12 - oculus
            13 - latest ad activity
            14 - weather
            15 - saved
            17 - offers
            18 - recommendations
            19 - crisisresponse
            20 - gaming-video
            21 - live-video
          */
          options: Array.from({ length: 21 }).map((_, i)=> ({
            id: `apps-nav-item-${i}`,
            name: 'x',
            cssSelectorName: `appsNavItemAtIndex:${i}`,
            labelCssSelectorName: 'appsNavItemLabel',
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
            id: 'composer-attachments-bar',
            name: '"Lägg till"-knappar',
            cssSelectorName:
              'composerAttachmentBar, composerCollapsedAttachmentBar',
            hide: false,
          },
          options: [
            {
              id: 'composer-create-room',
              name: 'x',
              cssSelectorName: 'composerCreateRoomButton',
              labelCssSelectorName: 'composerAttachmentButtonLabel',
              hide: false,
            },
            {
              id: 'composer-add-pic',
              name: 'x',
              cssSelectorName: 'composerPhotoButton',
              labelCssSelectorName: 'composerAttachmentButtonLabel',
              hide: false,
            },
            {
              id: 'composer-tag-friends',
              name: 'x',
              cssSelectorName: 'composerTagFriendsButton',
              labelCssSelectorName: 'composerAttachmentButtonLabel',
              hide: false,
            },
            {
              id: 'composer-check-in',
              name: 'x',
              cssSelectorName: 'composerCheckInButton',
              labelCssSelectorName: 'composerAttachmentButtonLabel',
              hide: false,
            },
            {
              id: 'composer-feeling',
              name: 'x',
              cssSelectorName: 'composerFeelingButton',
              labelCssSelectorName: 'composerAttachmentButtonLabel',
              hide: false,
            },
            {
              id: 'composer-gif',
              name: 'x',
              cssSelectorName: 'composerGIFButton',
              labelCssSelectorName: 'composerAttachmentButtonLabel',
              hide: false,
            },
            {
              id: 'composer-live-stream',
              name: 'x',
              cssSelectorName: 'composerLiveStreamButton',
              labelCssSelectorName: 'composerAttachmentButtonLabel',
              hide: false,
            },
            {
              id: 'composer-video-party',
              name: 'x',
              cssSelectorName: 'composerVideoPartyButton',
              labelCssSelectorName: 'composerAttachmentButtonLabel',
              hide: false,
            },
            {
              id: 'composer-recommendation',
              name: 'x',
              cssSelectorName: 'composerRecommendationButton',
              labelCssSelectorName: 'composerAttachmentButtonLabel',
              hide: false,
            },
            {
              id: 'composer-charity',
              name: 'x',
              cssSelectorName: 'composerCharityButton',
              labelCssSelectorName: 'composerAttachmentButtonLabel',
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
          id: 'post-settings-hide-ad',
          name: 'Dölj annons',
          cssSelectorName: 'postSettingsHideAd',
          hide: false,
        },
        {
          id: 'post-settings-hide',
          name: 'Dölj inlägg',
          cssSelectorName: 'postSettingsHide',
          hide: false,
        },
        {
          id: 'post-settings-save',
          name: 'Spara inlägg',
          cssSelectorName: 'postSettingsSave',
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
          id: 'rpane',
          name: 'Högerpanel',
          cssSelectorName: 'rightPanel',
          customStylesWhenHidden: {
            cssSelectorName: 'languagePanel',
            enabled: false,
            property: 'margin-top',
            value: 0,
          },
          hide: false,
        },
        {
          id: 'language',
          name: 'Språkruta',
          cssSelectorName: 'languagePanel',
          hide: false
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
