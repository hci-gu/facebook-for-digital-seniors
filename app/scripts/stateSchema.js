export default {
  stateBreakingChangeCounter: 2,
  thingsToHide: [
    {
      sectionName: "Menyalternativ",
      sectionOption: {
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
      sectionName: "Övrigt",
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
      enabled: false,
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
