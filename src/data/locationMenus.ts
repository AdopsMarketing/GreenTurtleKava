export const locationMenus: Record<string, { name: string; items: { name: string; price: string; description: string }[] }[]> = {
  'kava-bar-at-st-augustine': [
    {
      name: 'Kava St. Augustine',
      items: [
        { name: 'Double Kava', price: '$9.5', description: 'A lot more relaxation!' },
        { name: 'Single Kava', price: '$5.5', description: 'Single shell of traditional kava' },
      ],
    },
    {
      name: 'Tea St. Augustine',
      items: [
        { name: 'Large Herbal Tea', price: '$9.5', description: '16 oz of exotic herbal tea' },
        { name: 'Small Herbal Tea', price: '$5.5', description: '8 oz of exotic herbal tea' },
      ],
    },
    {
      name: 'Coffee St. Augustine',
      items: [
        { name: 'Large Coffee', price: '$4', description: 'Large cup of premium grounds' },
        { name: 'Small Coffee', price: '$3', description: 'Small cup of premium grounds' },
      ],
    },
    {
      name: 'Misc St. Augustine',
      items: [
        { name: 'Red Bull', price: '$3', description: 'Get your wings!' },
        { name: 'Fiji Water', price: '$3', description: 'Straight from the source!' },
      ],
    },
  ],
  'kava-bar-at-daytona-beach': [
    {
      name: 'Kava Daytona Beach',
      items: [
        { name: 'Single Kava', price: '$5.5', description: '6oz single shell of traditional kava' },
        { name: 'Double Kava', price: '$9.5', description: 'Your 12oz bula - a lot more relaxation!' },
        { name: 'Loggerhead', price: '$16', description: '6oz Kava with 5ml Herbal Extract' },
      ],
    },
    {
      name: 'Tea Daytona Beach',
      items: [
        { name: 'Double Herbal Tea', price: '$9.5', description: '16 oz of exotic herbal tea' },
        { name: 'Single Herbal Tea', price: '$5.5', description: '8 oz of exotic herbal tea' },
      ],
    },
    {
      name: 'Coffee Daytona Beach',
      items: [
        { name: 'Large Coffee', price: '$4', description: 'Large cup of premium grounds' },
        { name: 'Small Coffee', price: '$3', description: 'Small cup of premium grounds' },
      ],
    },
    {
      name: 'Misc Items Daytona',
      items: [
        { name: 'Red Bull', price: '$4', description: 'Get your wings!' },
        { name: 'Fiji Water', price: '$3', description: 'Straight from the source!' },
      ],
    },
  ],
  'kava-bar-at-ormond-beach': [
    {
      name: 'Kava Ormond Beach',
      items: [
        { name: 'Single Kava', price: '$5.5', description: '6oz single shell of traditional kava' },
        { name: 'Double Kava', price: '$9.5', description: 'Your 12oz bula - a lot more relaxation!' },
        { name: 'Loggerhead', price: '$16.5', description: '6oz Kava with 5ml Herbal Extract' },
      ],
    },
    {
      name: 'Tea Ormond Beach',
      items: [
        { name: 'Double Herbal Tea', price: '$9.5', description: '16 oz of exotic herbal tea' },
        { name: 'Single Herbal Tea', price: '', description: '8 oz of exotic herbal tea' },
      ],
    },
    {
      name: 'Coffee Ormond Beach',
      items: [{ name: 'Large Coffee', price: '$4', description: 'Large cup of premium grounds' }],
    },
    {
      name: 'Misc Items Ormond',
      items: [
        { name: 'Red Bull', price: '', description: 'Get your wings!' },
        { name: 'Fiji Water', price: '', description: 'Straight from the source!' },
        { name: 'Small Coffee', price: '', description: 'Small cup of premium grounds' },
      ],
    },
  ],
};
