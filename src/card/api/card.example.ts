/** Opens in Apollo Sandbox, so the whole card is one click away */
export const CARD_EXAMPLE_QUERY = `query BusinessCard {
  profile {
    name
    headline
    description
    location
    links { label url }
    skills { name category }
    experience {
      company
      position
      period { start end months }
      stack
      achievements
    }
    projects { name description url stack }
  }
}
`;
