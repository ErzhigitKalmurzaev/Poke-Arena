export interface Fighter {
  id: string;
  name: string;
  description: string;
  types: string[];
  stats: Record<string, number>;
  sprite: string;
  shinySprite: string | null;
  cryUrl: string | null;
  isLegendary: boolean;
  isMythical: boolean;
  isEdited: boolean;
}
