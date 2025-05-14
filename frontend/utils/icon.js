// utils/categoryIcons.js
export const getIconForCategory = (category) => {
  if (!category) return "help-circle";

  const map = {
    // Income
    "Salary": "cash",
    "Freelance": "briefcase",
    "Investment": "trending-up",

    // Expenses
    "Rent": "home",
    "Rates / Taxes / Charge / Cess": "document-text",
    "Vehicle Running / Maintenance": "car-sport",
    "Travelling": "airplane",
    "Electricity": "flash",
    "Water": "water",
    "Gas": "flame",
    "Telephone": "call",
    "Asset Insurance / Security": "shield-checkmark",
    "Medical": "medkit",
    "Educational": "school",
    "Club": "people",
    "Functions / Gatherings": "balloon",
    "Donation, Zakat, Annuity, Profit on Debt, Life Insurance Premium, etc.": "heart",
    "Other Personal / Household Expenses": "basket",
    "Contribution in Expenses by Family Members": "people-circle"
  };

  return map[category] || "help-circle";
};
