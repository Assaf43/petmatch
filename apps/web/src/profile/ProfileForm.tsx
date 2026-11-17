import { ALLERGENS, BREED_SIZES, PROTEINS, petProfileSchema } from '@petmatch/core';
import type { Allergen, BreedSize, PetProfile, Protein } from '@petmatch/core';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { he } from '../i18n/he.js';

interface ProfileFormProps {
  initial: PetProfile | null;
  onSubmit: (profile: PetProfile) => void;
}

type FieldName = 'name' | 'age' | 'breedSize';
type FieldErrors = Partial<Record<FieldName, string>>;
type GrainFree = PetProfile['grainFree'];

const FIELD_FOR_PATH: Record<string, FieldName> = {
  name: 'name',
  ageYears: 'age',
  breedSize: 'breedSize',
};

function toggle<T>(items: readonly T[], item: T): T[] {
  return items.includes(item) ? items.filter((i) => i !== item) : [...items, item];
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20';
const legendClass = 'mb-3 text-sm font-bold text-gray-700';
const choiceClass =
  'flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 has-[:checked]:border-brand-blue has-[:checked]:bg-blue-50 has-[:checked]:text-brand-blue';

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm font-bold text-red-600">
      {message}
    </p>
  );
}

export function ProfileForm({ initial, onSubmit }: ProfileFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [age, setAge] = useState(initial ? String(initial.ageYears) : '');
  const [breedSize, setBreedSize] = useState<BreedSize | ''>(initial?.breedSize ?? '');
  const [allergies, setAllergies] = useState<Allergen[]>(initial?.allergies ?? []);
  const [proteins, setProteins] = useState<Protein[]>(initial?.preferredProteins ?? []);
  const [grainFree, setGrainFree] = useState<GrainFree>(initial?.grainFree ?? 'no-preference');
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = petProfileSchema.safeParse({
      name,
      species: 'dog',
      ageYears: age.trim() === '' ? Number.NaN : Number(age),
      breedSize,
      // Canonical order, not click order, so the same choices always give the same profile.
      allergies: ALLERGENS.filter((a) => allergies.includes(a)),
      preferredProteins: PROTEINS.filter((p) => proteins.includes(p)),
      grainFree,
    });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = FIELD_FOR_PATH[String(issue.path[0])];
        if (field) next[field] = he.form.errors[field];
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8 rounded-4xl bg-white p-6 shadow-card md:p-10"
    >
      <h3 className="text-2xl font-black text-gray-900">{he.form.title}</h3>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="pet-name" className={`block ${legendClass}`}>
            {he.form.name}
          </label>
          <input
            id="pet-name"
            type="text"
            value={name}
            maxLength={60}
            onChange={(e) => {
              setName(e.target.value);
            }}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'pet-name-error' : undefined}
            className={inputClass}
          />
          <FieldError id="pet-name-error" message={errors.name} />
        </div>

        <div>
          <label htmlFor="pet-age" className={`block ${legendClass}`}>
            {he.form.age}
          </label>
          <input
            id="pet-age"
            type="number"
            inputMode="decimal"
            step={0.5}
            min={0}
            max={30}
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
            }}
            aria-invalid={errors.age ? true : undefined}
            aria-describedby={errors.age ? 'pet-age-error' : undefined}
            className={inputClass}
          />
          <FieldError id="pet-age-error" message={errors.age} />
        </div>
      </div>

      <fieldset aria-describedby={errors.breedSize ? 'pet-size-error' : undefined}>
        <legend className={legendClass}>{he.form.breedSize}</legend>
        <div className="flex flex-wrap gap-3">
          {BREED_SIZES.map((size) => (
            <label key={size} className={choiceClass}>
              <input
                type="radio"
                name="breedSize"
                value={size}
                checked={breedSize === size}
                onChange={() => {
                  setBreedSize(size);
                }}
              />
              {he.breedSize[size]}
            </label>
          ))}
        </div>
        <FieldError id="pet-size-error" message={errors.breedSize} />
      </fieldset>

      <fieldset>
        <legend className={legendClass}>{he.form.allergies}</legend>
        <div className="flex flex-wrap gap-3">
          {ALLERGENS.map((allergen) => (
            <label key={allergen} className={choiceClass}>
              <input
                type="checkbox"
                checked={allergies.includes(allergen)}
                onChange={() => {
                  setAllergies((current) => toggle(current, allergen));
                }}
              />
              {he.allergen[allergen]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={legendClass}>{he.form.preferredProteins}</legend>
        <div className="flex flex-wrap gap-3">
          {PROTEINS.map((protein) => (
            <label key={protein} className={choiceClass}>
              <input
                type="checkbox"
                checked={proteins.includes(protein)}
                onChange={() => {
                  setProteins((current) => toggle(current, protein));
                }}
              />
              {he.protein[protein]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={legendClass}>{he.form.grainFree}</legend>
        <div className="flex flex-wrap gap-3">
          <label className={choiceClass}>
            <input
              type="radio"
              name="grainFree"
              checked={grainFree === 'no-preference'}
              onChange={() => {
                setGrainFree('no-preference');
              }}
            />
            {he.grainFree.noPreference}
          </label>
          <label className={choiceClass}>
            <input
              type="radio"
              name="grainFree"
              checked={grainFree === 'yes'}
              onChange={() => {
                setGrainFree('yes');
              }}
            />
            {he.grainFree.yes}
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        className="w-full cursor-pointer rounded-2xl bg-brand-blue px-6 py-4 text-lg font-black text-white shadow-premium transition hover:opacity-90 md:w-auto"
      >
        {he.form.submit}
      </button>
    </form>
  );
}
