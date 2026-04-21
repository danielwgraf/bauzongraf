export type RegistryFundId = "honeymoon" | "dogs" | "donation" | "castle";

export type RegistryFund = {
  id: RegistryFundId;
  label: string;
  /** Shown on the registry tab; edit these to match your plans. */
  description: string;
};

export const REGISTRY_FUNDS: RegistryFund[] = [
  {
    id: "honeymoon",
    label: "Honeymoon",
    description:
      "After the wedding, we're going to take a trip to Ireland to celebrate our honeymoon. Gifts here go toward flights, hotels, and other expenses related to the trip.",
  },
  {
    id: "dogs",
    label: "Dogs",
    description:
      "Fuji and Corby are mad that we've left them in America instead of taking them with us to France. Gifts here go toward treats, care, and the inevitable guilt trip that they will give us when we get back.",
  },
  // {
  //   id: "donation",
  //   label: "Donation",
  //   description:
  //     "A flexible gift you can direct wherever we need it most — we truly appreciate your generosity in any form.",
  // },
  // {
  //   id: "castle",
  //   label: "Castle",
  //   description:
  //     "Toward castle-related plans around our celebration — think venue touches, a special stay, or memories tied to the day.",
  // },
];

export function registryFundLabel(id: string) {
  return REGISTRY_FUNDS.find((f) => f.id === id)?.label ?? id;
}

export function registryFundDescription(id: string) {
  return REGISTRY_FUNDS.find((f) => f.id === id)?.description ?? "";
}

/** Funds the UI can submit (keeps APIs in sync when you comment funds in/out). */
export function isValidRegistryFundId(id: string): id is RegistryFundId {
  return REGISTRY_FUNDS.some((f) => f.id === id);
}
