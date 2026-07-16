const issues = [
  {
    id: "not-charging",
    title: "Device is not charging",
    summary: "Holder or pocket charger does not show expected charging lights.",
    checks: [
      {
        label: "Confirm the cable and adapter are firmly connected.",
        help: "Try a known working USB-C cable and wall adapter if available."
      },
      {
        label: "Clean the charging contacts gently.",
        help: "Remove visible dust or residue before placing the holder back in the charger."
      },
      {
        label: "Leave the device charging for at least 20 minutes.",
        help: "A fully depleted battery may need a few minutes before lights appear."
      }
    ],
    success: "Charging issue is likely resolved after cable, contact, and waiting checks."
  },
   