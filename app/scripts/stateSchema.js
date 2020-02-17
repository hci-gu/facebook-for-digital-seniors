export default {
  stateBreakingChangeCounter: 7,
  thingsToHide: [
    {
      categoryName: "Menyalternativ",
      groups: [
        {
          option: {
            id: "universalNav",
            name: "Huvudsektioner",
            cssSelectorName: "universalNavSection",
            hide: false
          },
          options: [
            {
              id: "feed",
              name: "Flöde",
              cssSelectorName: "navItemNewsFeed",
              hide: false
            },
            {
              id: "messages",
              name: "Meddelanden",
              cssSelectorName: "navItemMessenger",
              hide: false
            },

            {
              id: "watch",
              name: "Titta",
              cssSelectorName: "navItemWatch",
              hide: false
            },

            {
              id: "marketplace",
              name: "Köp/Sälj",
              cssSelectorName: "navItemMarketplace",
              hide: false
            }
          ]
        },
        {
          option: {
            id: "appsNav",
            name: "Utforska",
            cssSelectorName: "appsNav",
            hide: false
          },
          options: [
            {
              id: "groups",
              name: "Grupper",
              cssSelectorName: "navItemGroups",
              hide: false
            },
            {
              id: "pages",
              name: "Sidor",
              cssSelectorName: "navItemPages",
              hide: false
            },
            {
              id: "events",
              name: "Evenemang",
              cssSelectorName: "navItemEvents",
              hide: false
            },
            {
              id: "fundraisers",
              name: "Insamlingar",
              cssSelectorName: "navItemFundraisers",
              hide: false
            }
          ]
        }
      ]
    },
    {
      categoryName: "Övrigt",
      options: [
        {
          id: "stories",
          name: "Händelser",
          cssSelectorName: "stories",
          hide: true
        },
        {
          id: "rpane",
          name: "Högerpanel",
          cssSelectorName: "rightPanel",
          hide: true
        }
        // {
        //   id: "language",
        //   name: "Språkruta",
        //   cssSelectorName: "languagePanel",
        //   hide: false
        // }
      ]
    }
  ],
  customCss: [
    {
      enabled: true,
      id: "zoom",
      name: "Zoom",
      selector: "body",
      property: "zoom",
      unit: "%",
      value: 100,
      min: 50,
      max: 200
    }
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
    replaceAudienceIconsWithText: true,
    highlightAudienceWhenPosting: true
  },
  facebookCssSelectors: {}
};
