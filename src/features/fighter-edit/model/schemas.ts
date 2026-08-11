import { type } from 'arktype';

const nameType = type('1<=string<=50');
const descriptionType = type('1<=string<=500');
const statType = type('number>=0');

/**
 * Arktype does the actual checking; these wrappers just swap its default
 * English messages for Russian ones matching the rest of the UI, without
 * losing the schema-driven validation itself.
 */
export function validateFighterName({ value }: { value: string }): string | undefined {
  return nameType(value) instanceof type.errors ? 'Имя — от 1 до 50 символов' : undefined;
}

export function validateFighterDescription({ value }: { value: string }): string | undefined {
  return descriptionType(value) instanceof type.errors ? 'Описание — от 1 до 500 символов' : undefined;
}

export function validateStatValue({ value }: { value: number }): string | undefined {
  return statType(value) instanceof type.errors ? 'Значение не может быть отрицательным' : undefined;
}
