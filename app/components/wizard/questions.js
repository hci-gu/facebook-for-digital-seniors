const twoSelections = [
  { text: 'Stämmer', keywords: [] },
  { text: 'Stämmer inte', keywords: [] },
]
const fiveSelections = [
  { text: 'Stämmer helt', keywords: [] },
  { text: 'Stämmer delvis', keywords: [] },
  { text: 'Varken stämmer eller stämmer inte', keywords: [] },
  { text: 'Stämmer ganska dåligt', keywords: [] },
  { text: 'Stämmer inte alls', keywords: [] },
]

export default [
  {
    name: 'intro',
    title: 'Intro',
    showHelpPanel: false,
  },
  {
    name: 'extension',
    title: 'Tillägg',
    showHelpPanel: false,
    question:
      'Jag är medveten om att jag har ett tillägg installerat som påverkar utseendet av min Facebook.',
    selections: twoSelections,
  },
  {
    name: 'relevance',
    title: 'Relevans',
    showHelpPanel: false,
    question:
      'Det jag kan göra med den enklare designen av Facebook stämmer överens med det jag vill kunna göra.',
    keywords: [],
    selections: fiveSelections,
  },
  {
    name: 'missing-functions',
    title: 'Saknade funktioner',
    showHelpPanel: false,
    question:
      'Ibland när jag vill göra något i den enklare designen av Facebook saknar jag eller har svårt att hitta det jag letar efter.',
    keywords: [],
    selections: fiveSelections,
  },
  {
    name: 'simplicity',
    title: 'Förenkling',
    keywords: [],
    subStepIndex: 0,
    subSteps: [
      {
        name: 'simplicity-1',
        question:
          'Fyll i det alternativ som passar bäst för dig.\n\nSen jag började använda den enklare designen är det oftast...',
        showHelpPanel: false,
        selections: [
          {
            text: '...lättare än tidigare att hitta och göra det jag behöver.',
            keywords: [],
          },
          {
            text:
              '...lika lätt/svårt som tidigare att hitta och göra det jag behöver.',
            keywords: [],
          },
          {
            text: '...svårare än tidigare att hitta och göra det jag behöver.',
            keywords: [],
          },
        ],
      },
      {
        name: 'simplicity-2',
        question:
          'Följdfråga: Har du i den enklare designen av Facebook saknat möjligheten att göra något av följande?',
        showHelpPanel: true,
        selections: [
          {
            text: '...lättare än tidigare att hitta och göra det jag behöver.',
            keywords: [],
          },
          {
            text:
              '...lika lätt/svårt som tidigare att hitta och göra det jag behöver.',
            keywords: [],
          },
          {
            text: '...svårare än tidigare att hitta och göra det jag behöver.',
            keywords: [],
          },
        ],
      },
    ],
  },
  {
    name: 'control',
    title: 'Kontroll',
    showHelpPanel: false,
    question:
      'Fyll i det alternativ som passar bäst för dig.\n\nSen jag började använda den enklare designen har jag...',
    keywords: [],
    selections: [
      {
        text: '...större kontroll över vilken information jag ser på Facebook.',
        keywords: [],
      },
      {
        text:
          '...lika stor kontroll som tidigare över vilken information jag ser på Facebook.',
        keywords: [],
      },
      {
        text: '...mindre kontroll över vilken information jag ser på Facebook.',
        keywords: [],
      },
    ],
  },

  {
    name: 'comments',
    title: 'Övriga kommentarer',
  },
  {
    name: 'finish',
    title: 'Slutför',
  },
]
